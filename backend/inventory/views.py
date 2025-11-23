from rest_framework.decorators import api_view, permission_classes
import math
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from datetime import timedelta, date
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal

from .models import Medicine, Order,Pharmacy,Sale,OrderItem
from .models import Pharmacy as InventoryPharmacy
from .serializers import MedicineSerializer, OrderSerializer,SellRequestSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import re


def _get_or_create_customer(customer_name: str | None, customer_email: str | None, customer_phone: str | None):
    """Normalize identifiers and try to find an existing Customer, creating one if needed.
    Matching priority: email (lowercased) -> phone (digits only) -> name.
    Returns a Customer instance or None if creation failed.
    """
    from .models import Customer
    try:
        email = (customer_email or '').strip().lower() if customer_email else None
        phone = None
        if customer_phone:
            # normalize phone by keeping digits only
            digits = re.sub(r"\D", "", str(customer_phone))
            phone = digits if digits else None

        name = (customer_name or '').strip() or None

        if email:
            obj, _ = Customer.objects.get_or_create(email=email, defaults={'name': name or '', 'phone': customer_phone})
            return obj

        if phone:
            # try to find by phone (may have stored with formatting)
            obj = Customer.objects.filter(phone__iregex=r"\D*" + re.sub(r"(\d)", r"\\1", phone) + r"\D*").first()
            if obj:
                return obj
            obj, _ = Customer.objects.get_or_create(phone=customer_phone, defaults={'name': name or '', 'email': customer_email})
            return obj

        if name:
            obj, _ = Customer.objects.get_or_create(name=name, defaults={'phone': customer_phone or '', 'email': customer_email})
            return obj
    except Exception:
        try:
            # last-resort create without uniqueness guarantees
            return Customer.objects.create(name=customer_name or '', email=customer_email or None, phone=customer_phone or None)
        except Exception:
            return None



def _display_name(user):
    """Return a human-friendly name for a user-like object: prefer full name, then a `name` field, then username, then email."""
    try:
        if not user:
            return 'User'
        full = getattr(user, 'get_full_name', None)
        if callable(full):
            fn = full()
            if fn:
                return fn
        nm = getattr(user, 'name', None)
        if nm:
            return nm
        un = getattr(user, 'username', None)
        if un:
            return un
        em = getattr(user, 'email', None)
        if em:
            
            try:
                return em.split('@')[0]
            except Exception:
                return em
      
        return str(user)
    except Exception:
        return 'User'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Return dashboard stats for the authenticated pharmacy user.
    """
    user = request.user
    if user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=403)

    inv_pharm = InventoryPharmacy.objects.filter(user=user).first()
    if not inv_pharm:
        return Response({'error': 'Pharmacy profile not found for user'}, status=403)

    medicines = Medicine.objects.filter(pharmacy=user)
    completed_orders = Order.objects.filter(pharmacy=user, status='completed')

    sales_qs = Sale.objects.filter(pharmacy=inv_pharm)

    today = timezone.now().date()
    orders_today_total = completed_orders.filter(created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0
    sales_today_total = sales_qs.filter(sale_date__date=today).aggregate(total=Sum('total_price'))['total'] or 0
    today_sales = orders_today_total + sales_today_total

    expired_items = medicines.filter(expiry_date__lt=today).count()
    low_stock_items = medicines.filter(stock_quantity__lte=F('minimum_stock')).count()
    total_medicines = medicines.count()

    total_orders = Order.objects.filter(pharmacy=user).count()
    total_sales_count_orders = completed_orders.count()
    total_sales_count_sales = sales_qs.count()
    total_sales_count = total_sales_count_orders + total_sales_count_sales

    total_revenue_orders = completed_orders.aggregate(total=Sum('total_amount'))['total'] or 0
    total_revenue_sales = sales_qs.aggregate(total=Sum('total_price'))['total'] or 0
    total_revenue = (total_revenue_orders or 0) + (total_revenue_sales or 0)

    customer_ids = set(sales_qs.exclude(customer__isnull=True).values_list('customer_id', flat=True))
    anon_phones = set(
        Order.objects.filter(pharmacy=user, status='completed')
        .exclude(customer_phone__isnull=True)
        .exclude(customer_phone='')
        .values_list('customer_phone', flat=True)
    )
    total_customers = len(customer_ids) + len({p for p in anon_phones if p})
    start = today - timedelta(days=6)
    orders_by_day = (
        completed_orders.filter(created_at__date__range=(start, today))
        .values('created_at__date')
        .annotate(total=Sum('total_amount'))
    )
    sales_by_day = (
        sales_qs.filter(sale_date__date__range=(start, today))
        .values('sale_date__date')
        .annotate(total=Sum('total_price'))
    )
    totals_map = {}
    for row in orders_by_day:
        totals_map[row['created_at__date']] = float(row['total'] or 0)
    for row in sales_by_day:
        key = row.get('sale_date__date')
        totals_map[key] = totals_map.get(key, 0) + float(row['total'] or 0)

    weekly_sales = [float(totals_map.get(start + timedelta(days=i), 0)) for i in range(7)]

    thirty_days_ago = timezone.now() - timedelta(days=30)
    monthly_revenue_orders = completed_orders.filter(created_at__gte=thirty_days_ago).aggregate(total=Sum('total_amount'))['total'] or 0
    monthly_revenue_sales = sales_qs.filter(sale_date__gte=thirty_days_ago).aggregate(total=Sum('total_price'))['total'] or 0
    monthly_revenue = (monthly_revenue_orders or 0) + (monthly_revenue_sales or 0)

    average_order_value = float(total_revenue) / total_sales_count if total_sales_count > 0 else 0.0

    return Response({
        'today_sales': float(today_sales),
        'expired_items': expired_items,
        'low_stock_items': low_stock_items,
        'total_medicines': total_medicines,
        'weekly_sales': weekly_sales,
        'total_orders': total_orders,
        'total_sales': total_sales_count,
        'total_revenue': float(total_revenue),
        'total_customers': total_customers,
        'monthly_revenue': float(monthly_revenue),
        'average_order_value': float(average_order_value),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pharmacy_sales(request):
    """Return recent sales for the authenticated pharmacy user."""
    user = request.user
    if user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=403)

    inv_pharm = InventoryPharmacy.objects.filter(user=user).first()
    if not inv_pharm:
        return Response({'error': 'Pharmacy profile not found for user'}, status=403)

    qs = Sale.objects.filter(pharmacy=inv_pharm).order_by('-sale_date')[:50]
    data = []
    for s in qs:
        data.append({
            'id': s.id,
            'medicine': getattr(s.medicine, 'name', None),
            'quantity': s.quantity,
            'total_price': float(s.total_price),
            'customer': {'id': s.customer.id, 'name': s.customer.name} if s.customer else None,
            'sale_date': s.sale_date,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expiring_medicines(request):
    """Return medicines that are expiring within the next 60 days (2 months)."""
    user = request.user
    if user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=403)

    # Calculate date 60 days from now
    today = date.today()
    expiry_threshold = today + timedelta(days=60)
    
    medicines = Medicine.objects.filter(
        pharmacy=user,
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=today  # Don't include already expired medicines
    ).order_by('expiry_date')

    data = []
    for medicine in medicines:
        days_until_expiry = (medicine.expiry_date - today).days
        
        # Categorize expiration level
        if days_until_expiry <= 0:
            level = 'expired'
            message = 'Expired'
        elif days_until_expiry <= 7:
            level = 'critical'
            message = f'Expires in {days_until_expiry} days'
        elif days_until_expiry <= 30:
            level = 'warning'
            message = f'Expires in {days_until_expiry} days'
        else:
            level = 'normal'
            message = f'Expires in {days_until_expiry} days'

        serializer_data = MedicineSerializer(medicine).data
        serializer_data.update({
            'days_until_expiry': days_until_expiry,
            'expiration_level': level,
            'expiration_message': message,
            'is_expiring_soon': True
        })
        data.append(serializer_data)

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customers_list(request):
    """Return customers who purchased from this pharmacy with aggregates."""
    user = request.user
    if user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=403)
    from django.db.models import Sum, Count, Max

    customers = {}
    inv_pharm = InventoryPharmacy.objects.filter(user=user).first()
    if not inv_pharm:
        return Response({'error': 'Pharmacy profile not found for user'}, status=403)
    def _norm_key(email: str | None, phone: str | None, name: str | None):
        if email:
            return f"email:{email.strip().lower()}"
        if phone:
            digits = re.sub(r"\D", "", str(phone))
            if digits:
                return f"phone:{digits}"
        if name:
            return f"name:{name.strip().lower()}"
        return None

    for s in Sale.objects.filter(pharmacy=inv_pharm).select_related('customer'):
        if s.customer:
            cust = s.customer
            key = _norm_key(getattr(cust, 'email', None), getattr(cust, 'phone', None), getattr(cust, 'name', None)) or f"cust_{cust.id}"
            entry = customers.get(key)
            if not entry:
                entry = {
                    'id': cust.id,
                    'name': cust.name or (cust.email or 'Customer'),
                    'phone': cust.phone or '',
                    'total_purchases': 0,
                    'total_spent': 0.0,
                    'purchase_count': 0,
                    'last_purchase': s.sale_date,
                }
                customers[key] = entry

            entry['total_purchases'] += s.quantity
            try:
                entry['total_spent'] += float(s.total_price)
            except Exception:
                pass
            entry['purchase_count'] += 1
            if s.sale_date and s.sale_date > entry['last_purchase']:
                entry['last_purchase'] = s.sale_date

    order_qs = Order.objects.filter(pharmacy=user).exclude(status__in=('rejected', 'cancelled'))
    for o in order_qs:
        phone = (o.customer_phone or '').strip() or None
        name = (o.customer_name or '').strip() or None
        key = _norm_key(None, phone, name) or (f"anon_{phone or name or o.id}")
        entry = customers.get(key)
        if not entry:
            entry = {
                'id': key,
                'name': name or (phone or 'Customer'),
                'phone': phone or '',
                'total_purchases': 0,
                'total_spent': 0.0,
                'purchase_count': 0,
                'last_purchase': o.created_at,
            }
            customers[key] = entry


        try:
            items = OrderItem.objects.filter(order=o)
            qty_sum = sum([it.quantity for it in items])
            price_sum = sum([float(it.subtotal or 0) for it in items])
        except Exception:
            qty_sum = 0
            price_sum = 0.0

        entry['total_purchases'] += qty_sum
        entry['total_spent'] += price_sum
        entry['purchase_count'] += 1
        if o.created_at and o.created_at > entry['last_purchase']:
            entry['last_purchase'] = o.created_at
    result = sorted(customers.values(), key=lambda x: x['total_spent'], reverse=True)
    for r in result:
        if hasattr(r['last_purchase'], 'isoformat'):
            r['last_purchase'] = r['last_purchase'].isoformat()

    return Response(result)


@api_view(['GET', 'POST'])
def medicine_list(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            medicines = Medicine.objects.filter(stock_quantity__gt=0)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search) |
                    Q(category__icontains=search)
                )
        elif request.user.user_type == 'patient':
            medicines = Medicine.objects.filter(stock_quantity__gt=0)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search) |
                    Q(category__icontains=search)
                )
            print(f"Patient search: '{search}', Found: {medicines.count()} medicines")  
        else:
            medicines = Medicine.objects.filter(pharmacy=request.user)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search)
                )
            print(f"Pharmacy view: Found {medicines.count()} medicines")  
        
        serializer = MedicineSerializer(medicines, many=True)
        data = serializer.data
        try:
            lat = float(request.query_params.get('latitude')) if request.query_params.get('latitude') else None
            lon = float(request.query_params.get('longitude')) if request.query_params.get('longitude') else None
        except (ValueError, TypeError):
            lat = lon = None

        enriched = []
        for item in data:
            pharmacy_coords = None
            distance_km = None
            try:
                inv_pharm = Pharmacy.objects.filter(user_id=item.get('pharmacy')).first()
                if inv_pharm:
                    pharmacy_coords = (float(inv_pharm.latitude or 0.0), float(inv_pharm.longitude or 0.0))
            except Exception:
                pharmacy_coords = None

            if lat is not None and lon is not None and pharmacy_coords:
                try:
                    R = 6371.0
                    dlat = math.radians(pharmacy_coords[0] - lat)
                    dlon = math.radians(pharmacy_coords[1] - lon)
                    a = (math.sin(dlat/2) ** 2) + math.cos(math.radians(lat)) * math.cos(math.radians(pharmacy_coords[0])) * (math.sin(dlon/2) ** 2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    distance_km = R * c
                except Exception:
                    distance_km = None

            new_item = dict(item)
            if pharmacy_coords:
                new_item['pharmacy_latitude'] = pharmacy_coords[0]
                new_item['pharmacy_longitude'] = pharmacy_coords[1]
            if distance_km is not None:
                new_item['distance_km'] = round(distance_km, 3)
            enriched.append(new_item)
        if lat is not None and lon is not None:
            enriched.sort(key=lambda x: x.get('distance_km') if x.get('distance_km') is not None else float('inf'))

        return Response(enriched)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.user.user_type != 'pharmacy':
            return Response({'error': 'Only pharmacies can add medicines'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pharmacy=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def medicine_detail(request, pk):
    try:
        if request.user.user_type != 'pharmacy':
            return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)
        medicine = Medicine.objects.get(pk=pk, pharmacy=request.user)
    except Medicine.DoesNotExist:
        return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MedicineSerializer(medicine)
        return Response(serializer.data)

    elif request.method in ('PUT', 'PATCH'):
        serializer = MedicineSerializer(medicine, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        medicine.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_medicines(request):
    if request.user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)
    
    medicines = Medicine.objects.filter(
        pharmacy=request.user,
        stock_quantity__lte=F('minimum_stock')
    )
    serializer = MedicineSerializer(medicines, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_list(request):
    if request.user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        orders = Order.objects.filter(pharmacy=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    return Response({'detail': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_medicine(request, pk):
    """
    Partial/full update for a Medicine.
    URL: /api/inventory/medicines/<pk>/
    """
    med = get_object_or_404(Medicine, pk=pk)
    serializer = MedicineSerializer(med, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    if request.user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        order = Order.objects.get(pk=pk, pharmacy=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
    
        requested_status = request.data.get('status')


        if requested_status in ('approved', 'completed') and order.status == 'pending':
            from .models import Medicine as InventoryMedicine, Notification
            items = OrderItem.objects.filter(order=order)
            try:
                with transaction.atomic():
                    for it in items.select_for_update():
                        med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                        if med.stock_quantity < it.quantity:
                            return Response({'error': f'Insufficient stock for {med.name}'}, status=status.HTTP_400_BAD_REQUEST)

                    for it in items:
                        med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                        med.stock_quantity = med.stock_quantity - it.quantity
                        med.save()

                    order.stock_reserved = True
                    order.status = 'approved'
                    order.save()

                  
                    if order.patient:
                        try:
                            Notification.objects.create(
                                recipient=order.patient,
                                actor=request.user,
                                verb='order_approved',
                                message=f'Your order #{order.id} has been approved by {_display_name(order.pharmacy)}.',
                                data={'order_id': order.id}
                            )
                        except Exception:
                            pass

                serializer = OrderSerializer(order)
                return Response(serializer.data)
            except Exception as e:
                return Response({'error': 'Failed to reserve stock', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

     
        if requested_status == 'rejected' and order.status in ('pending', 'approved'):
            from .models import Medicine as InventoryMedicine
            if order.stock_reserved:
                try:
                    with transaction.atomic():
                        items = OrderItem.objects.select_for_update().filter(order=order)
                        for it in items:
                            med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                            med.stock_quantity = med.stock_quantity + it.quantity
                            med.save()
                        order.stock_reserved = False
                        order.status = 'rejected'
                        order.save()
                    serializer = OrderSerializer(order)
                    return Response(serializer.data)
                except Exception as e:
                    return Response({'error': 'Failed to restore stock', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

     
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    """Place an order as a patient. Payload:
    { "pharmacy_id": 2, "items": [{"medicine_id": 1, "quantity": 2}], "customer_name": "...", "customer_phone": "..." }
    """
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can place orders'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    pharmacy_id = data.get('pharmacy_id')
    items = data.get('items') or []
    customer_name = data.get('customer_name') or request.user.username
    customer_phone = data.get('customer_phone') or ''


    if not customer_phone or str(customer_phone).strip() == '':
        return Response({'error': 'customer_phone is required'}, status=status.HTTP_400_BAD_REQUEST)

    if not pharmacy_id or not items:
        return Response({'error': 'pharmacy_id and items are required'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    try:
        pharmacy_user = User.objects.get(pk=pharmacy_id, user_type='pharmacy')
    except User.DoesNotExist:
        return Response({'error': 'Pharmacy not found'}, status=status.HTTP_404_NOT_FOUND)

    order = Order.objects.create(pharmacy=pharmacy_user, patient=request.user, customer_name=customer_name, customer_phone=customer_phone, total_amount=0, status='pending')

    total = Decimal('0')
    created_items = []
    for it in items:
        med_id = it.get('medicine_id')
        qty = int(it.get('quantity', 0) or 0)
        if qty <= 0:
            continue
        try:
            med = Medicine.objects.get(pk=med_id, pharmacy=pharmacy_user)
        except Medicine.DoesNotExist:
            order.delete()
            return Response({'error': f'Medicine {med_id} not found for this pharmacy'}, status=status.HTTP_400_BAD_REQUEST)

        unit_price = getattr(med, 'unit_price', 0) or 0
        subtotal = Decimal(unit_price) * qty
        OrderItem.objects.create(order=order, medicine=med, quantity=qty, unit_price=unit_price, subtotal=subtotal)
        total += subtotal
        created_items.append({'medicine_id': med.id, 'quantity': qty})

    order.total_amount = total
    order.save()

    try:
        subject = f'New order #{order.id} placed'
        message = f'New order {order.id} has been placed by {_display_name(request.user)}.\nPlease review orders in your dashboard.'
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        recipient = [pharmacy_user.email] if getattr(pharmacy_user, 'email', None) else None
        if recipient and from_email:
            send_mail(subject, message, from_email, recipient, fail_silently=True)
    except Exception:
        pass

    return Response({'order_id': order.id, 'items': created_items, 'total': float(total), 'status': order.status}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_order(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.pharmacy:
        try:
            user_id = getattr(request.user, 'id', None)
            user_type = getattr(request.user, 'user_type', None)
        except Exception:
            user_id = None
            user_type = None
        try:
            order_pharmacy_id = getattr(order.pharmacy, 'id', None)
            order_pharmacy_type = getattr(order.pharmacy, 'user_type', None)
        except Exception:
            order_pharmacy_id = None
            order_pharmacy_type = None
        return Response(
            {
                'error': 'Unauthorized',
                'user_id': user_id,
                'user_type': user_type,
                'order_pharmacy_id': order_pharmacy_id,
                'order_pharmacy_type': order_pharmacy_type,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.status != 'pending':
        return Response({'error': 'Only pending orders can be approved'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import Medicine as InventoryMedicine

    items = OrderItem.objects.filter(order=order)
    try:
        with transaction.atomic():
    
            for it in items.select_for_update():
                med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                if med.stock_quantity < it.quantity:
                    return Response({'error': f'Insufficient stock for {med.name}'}, status=status.HTTP_400_BAD_REQUEST)

        
            for it in items:
                med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                med.stock_quantity = med.stock_quantity - it.quantity
                med.save()

            order.stock_reserved = True
            order.status = 'approved'
            order.save()
    except Exception as e:
        return Response({'error': 'Failed to reserve stock', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
    try:
        from .models import Notification
        if order.patient:
            Notification.objects.create(
                recipient=order.patient,
                actor=request.user,
                verb='order_approved',
                    message=f'Your order #{order.id} has been approved by {_display_name(order.pharmacy)}.',
                data={'order_id': order.id}
            )
    except Exception:
        pass

    return Response({'detail': 'Order approved and stock reserved for delivery'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_order(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.pharmacy:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if order.status not in ('pending', 'approved'):
        return Response({'error': 'Order cannot be rejected at this stage'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import Medicine as InventoryMedicine

    if order.stock_reserved:
        try:
            with transaction.atomic():
                items = OrderItem.objects.select_for_update().filter(order=order)
                for it in items:
                    med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                    med.stock_quantity = med.stock_quantity + it.quantity
                    med.save()
                order.stock_reserved = False
                order.status = 'rejected'
                order.save()
        except Exception as e:
            return Response({'error': 'Failed to restore reserved stock', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        order.status = 'rejected'
        order.save()

     
        try:
            from .models import Notification
            if order.patient:
                Notification.objects.create(
                    recipient=order.patient,
                    actor=request.user,
                    verb='order_rejected',
                    message=f'Your order #{order.id} was rejected by the pharmacy. If you need help, please contact us.',
                    data={'order_id': order.id, 'contact_url': '/#contact'}
                )
        except Exception:

            pass

        return Response({'detail': 'Order rejected and stock restored (if reserved)'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_shipped(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.pharmacy:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if order.status not in ('approved', 'accepted'):
        return Response({'error': "Only approved or patient-accepted orders can be marked shipped"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'shipped'
    order.save()
 
    try:
        from .models import Notification
        if order.patient:
            Notification.objects.create(
                recipient=order.patient,
                actor=request.user,
                verb='order_shipped',
                    message=f'Your order #{order.id} has been shipped by {_display_name(order.pharmacy)}.',
                data={'order_id': order.id}
            )
    except Exception:
        pass

    return Response({'detail': 'Order marked as shipped'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_order_approval(request, order_id):
    """Patient accepts an approved order so pharmacy can proceed to ship/deliver."""
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.patient:
        return Response({'error': 'Only the ordering patient can accept approval'}, status=status.HTTP_403_FORBIDDEN)

    if order.status != 'approved':
        return Response({'error': 'Order must be in approved state to accept'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'accepted'
    order.save()


    try:
        from .models import Notification
        if order.pharmacy:
            Notification.objects.create(
                recipient=order.pharmacy,
                actor=request.user,
                verb='approval_accepted',
                    message=f'Patient {_display_name(request.user)} has accepted approval for order #{order.id}.',
                data={'order_id': order.id}
            )
    except Exception:
        pass

    return Response({'detail': 'Order approval accepted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_order(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.pharmacy:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if order.status == 'completed':
        return Response({'detail': 'Order already completed', 'current_status': order.status})

    if order.status not in ('shipped', 'approved', 'delivered'):
        return Response({'error': 'Only shipped, delivered or approved orders can be marked completed by pharmacy', 'current_status': order.status}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'completed'
    order.save()

    try:
        from .models import Notification
        if order.patient:
            Notification.objects.create(
                recipient=order.patient,
                actor=request.user,
                verb='order_completed_by_pharmacy',
                    message=f'Your order #{order.id} was marked completed by {_display_name(order.pharmacy)}.',
                data={'order_id': order.id}
            )
    except Exception:
        pass

    return Response({'detail': 'Order marked completed and patient notified'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_delivery(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != order.patient:
        return Response({'error': 'Only the ordering patient can confirm delivery'}, status=status.HTTP_403_FORBIDDEN)

    if order.status not in ('shipped', 'delivered', 'completed'):
        return Response({'error': "Order must be 'shipped', 'delivered' or 'completed' before confirming delivery"}, status=status.HTTP_400_BAD_REQUEST)


    from .models import Pharmacy as InventoryPharmacy, Medicine as InventoryMedicine, Customer

    provided_customer_name = request.data.get('customer_name') if isinstance(request.data, dict) else None

    try:
        with transaction.atomic():
            items = OrderItem.objects.select_for_update().filter(order=order)

            try:
                customer_name_val = provided_customer_name or order.customer_name or _display_name(order.patient) or 'Customer'
            except Exception:
                customer_name_val = provided_customer_name or order.customer_name or 'Customer'

            customer_email = getattr(order.patient, 'email', None) if order.patient else None
            customer_phone = order.customer_phone or None
            try:
                customer_obj = _get_or_create_customer(customer_name_val, customer_email, customer_phone)
            except Exception:
                customer_obj = None

            if order.stock_reserved:
              
                for it in items:
                    try:
                       
                        inv_pharm = None
                        try:
                            if getattr(request, 'user', None) and getattr(request.user, 'user_type', '') == 'pharmacy' and request.user == order.pharmacy:
                                inv_pharm = InventoryPharmacy.objects.filter(user=request.user).first()
                        except Exception:
                            inv_pharm = None

                        if not inv_pharm:
                            inv_pharm = InventoryPharmacy.objects.filter(user_id=getattr(order.pharmacy, 'id', None)).first()

                        if not inv_pharm:
                            try:
                                pname = getattr(order.pharmacy, 'name', None) or getattr(order.pharmacy, 'username', None) or (getattr(order.pharmacy, 'email', '') or '').split('@')[0]
                                inv_pharm, _ = InventoryPharmacy.objects.get_or_create(user_id=order.pharmacy.id, defaults={'name': f"{pname} Pharmacy", 'address': '', 'phone': ''})
                            except Exception:
                                inv_pharm = None
                        if inv_pharm:
                            Sale.objects.create(pharmacy=inv_pharm, medicine=it.medicine, quantity=it.quantity, total_price=it.subtotal, customer=customer_obj)
                            try:
                                print(f"confirm_delivery: order={order.id} created sale for inv_pharm_id={getattr(inv_pharm, 'id', None)} medicine={getattr(it.medicine, 'id', None)} qty={it.quantity}")
                            except Exception:
                                pass
                    except Exception:
                     
                        pass
            else:
              
                for it in items:
                    med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                    if med.stock_quantity < it.quantity:
                        return Response({'error': f'Insufficient stock to complete delivery for {med.name}'}, status=status.HTTP_400_BAD_REQUEST)

                for it in items:
                    med = InventoryMedicine.objects.select_for_update().get(pk=it.medicine.id)
                    med.stock_quantity = med.stock_quantity - it.quantity
                    med.save()
                    try:
                        inv_pharm = InventoryPharmacy.objects.filter(user_id=order.pharmacy.id).first()
                        if not inv_pharm:
                            try:
                                pname = getattr(order.pharmacy, 'name', None) or getattr(order.pharmacy, 'username', None) or (getattr(order.pharmacy, 'email', '') or '').split('@')[0]
                                inv_pharm, _ = InventoryPharmacy.objects.get_or_create(user_id=order.pharmacy.id, defaults={'name': f"{pname} Pharmacy", 'address': '', 'phone': ''})
                            except Exception:
                                inv_pharm = None
                        if inv_pharm:
                            Sale.objects.create(pharmacy=inv_pharm, medicine=it.medicine, quantity=it.quantity, total_price=it.subtotal, customer=customer_obj)
                    except Exception:
                        pass

        
            if provided_customer_name:
                order.customer_name = provided_customer_name
            order.status = 'completed'
            order.save()

         
            try:
                from .models import Notification
          
                if order.pharmacy:
                    customer_name = provided_customer_name or order.customer_name or _display_name(order.patient)
                    Notification.objects.create(
                        recipient=order.pharmacy,
                        actor=order.patient,
                        verb='order_confirmed_received',
                        message=f'Order #{order.id} was received by {customer_name}.',
                        data={'order_id': order.id, 'customer_name': customer_name}
                    )
            except Exception:
                pass

    except Exception as e:
        return Response({'error': 'Failed to confirm delivery', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Delivery confirmed, sale recorded and pharmacy notified'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """List orders placed by the authenticated patient."""
    if request.user.user_type != 'patient':
        return Response({'error': 'Patient access only'}, status=status.HTTP_403_FORBIDDEN)

    orders = Order.objects.filter(patient=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """List notifications for the authenticated user (both patients and pharmacies)."""
    from .models import Notification
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    data = [
        {
            'id': n.id,
            'verb': n.verb,
            'message': n.message,
            'data': n.data,
            'read': n.read,
            'created_at': n.created_at,
        }
        for n in notifications
    ]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, pk):
    from .models import Notification
    try:
        n = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

    n.read = True
    n.save()
    return Response({'detail': 'marked read'})
@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def sell_medicine(request):
    """
    Expected JSON:
    { "medicine_id": 1, "quantity": 2, "customer_name": "Name", "customer_phone": "0999...", "prescription": null }
    """
    data = request.data
    med_id = data.get('medicine_id')
    qty = int(data.get('quantity', 0) or 0)
    customer_name = data.get('customer_name') or ''
    customer_phone = data.get('customer_phone') or ''
    prescription = data.get('prescription', None)

    if not med_id or qty <= 0:
        return Response({'detail': 'medicine_id and positive quantity required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        med = Medicine.objects.select_for_update().get(id=med_id)
    except Medicine.DoesNotExist:
        return Response({'detail': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)

    if med.stock_quantity < qty:
        return Response({'detail': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import Pharmacy as InventoryPharmacy, Customer as InventoryCustomer

    with transaction.atomic():

        med.stock_quantity = med.stock_quantity - qty
        med.save()

        # Use consistent helper to find/create a Customer record to avoid duplicates
        try:
            customer_obj = _get_or_create_customer(customer_name or None, None, customer_phone or None)
        except Exception:
            customer_obj = None

    
        inv_pharm = None
        try:
            if getattr(request, 'user', None) and getattr(request.user, 'user_type', '') == 'pharmacy':
                inv_pharm = InventoryPharmacy.objects.filter(user=request.user).first()
        except Exception:
            inv_pharm = None

        if not inv_pharm:
            inv_pharm = InventoryPharmacy.objects.filter(user_id=getattr(med, 'pharmacy', None) and getattr(med.pharmacy, 'id', None)).first()

        if not inv_pharm:
            try:
                user_obj = med.pharmacy
                uname = getattr(user_obj, 'name', None) or getattr(user_obj, 'username', None) or (getattr(user_obj, 'email', '') or '').split('@')[0]
                inv_pharm, _ = InventoryPharmacy.objects.get_or_create(user_id=med.pharmacy.id, defaults={'name': f"{uname} Pharmacy", 'address': '', 'phone': ''})
            except Exception:
                inv_pharm = None

        subtotal = (float(getattr(med, 'unit_price', 0) or 0) * qty)
        sale = None
        try:
            if inv_pharm:
                sale = Sale.objects.create(pharmacy=inv_pharm, medicine=med, quantity=qty, total_price=subtotal, customer=customer_obj)
                try:
                    print(f"sell_medicine: user={getattr(request, 'user', None) and getattr(request.user, 'id', None)} inv_pharm_id={getattr(inv_pharm, 'id', None)} sale_id={getattr(sale, 'id', None)}")
                except Exception:
                    pass
        except Exception as e:
          
            raise

    resp = {
        'sale_id': sale.id if sale else None,
        'medicine_id': med.id,
        'quantity': qty,
        'remaining_stock': med.stock_quantity,
    }
    return Response(resp, status=status.HTTP_201_CREATED)