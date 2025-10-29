from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal

from .models import Medicine, Order,Pharmacy,Sale,OrderItem
from .serializers import MedicineSerializer, OrderSerializer,SellRequestSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    if user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=403)

    medicines = Medicine.objects.filter(pharmacy=user)
    orders = Order.objects.filter(pharmacy=user, status='completed')

    today = timezone.now().date()
    today_sales = orders.filter(created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0
    expired_items = medicines.filter(expiry_date__lt=today).count()
    low_stock_items = medicines.filter(stock_quantity__lte=F('minimum_stock')).count()
    total_medicines = medicines.count()

    start = today - timedelta(days=6)
    by_day = (
        orders.filter(created_at__date__range=(start, today))
        .values('created_at__date')
        .annotate(total=Sum('total_amount'))
    )
    totals_map = {row['created_at__date']: float(row['total'] or 0) for row in by_day}
    weekly_sales = [float(totals_map.get(start + timedelta(days=i), 0)) for i in range(7)]

    return Response({
        'today_sales': float(today_sales),
        'expired_items': expired_items,
        'low_stock_items': low_stock_items,
        'total_medicines': total_medicines,
        'weekly_sales': weekly_sales,
    })


@api_view(['GET', 'POST'])
def medicine_list(request):
    if request.method == 'GET':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Allow unauthenticated users to search (for public search)
            medicines = Medicine.objects.filter(stock_quantity__gt=0)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search) |
                    Q(category__icontains=search)
                )
        elif request.user.user_type == 'patient':
            # Patient can see all available medicines from all pharmacies
            medicines = Medicine.objects.filter(stock_quantity__gt=0)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search) |
                    Q(category__icontains=search)
                )
            print(f"Patient search: '{search}', Found: {medicines.count()} medicines")  # Debug
        else:
            # Pharmacy sees only their own medicines
            medicines = Medicine.objects.filter(pharmacy=request.user)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search)
                )
            print(f"Pharmacy view: Found {medicines.count()} medicines")  # Debug
        
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Only pharmacy can add medicines
        if request.user.user_type != 'pharmacy':
            return Response({'error': 'Only pharmacies can add medicines'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pharmacy=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medicine_detail(request, pk):
    try:
        # Pharmacy can only access their own medicines
        if request.user.user_type != 'pharmacy':
            return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)
            
        medicine = Medicine.objects.get(pk=pk, pharmacy=request.user)
    except Medicine.DoesNotExist:
        return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MedicineSerializer(medicine)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
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
        orders = Order.objects.filter(pharmacy=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pharmacy=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
def sell_medicine(request):
    """
    POST /api/inventory/sell/
    payload: { medicine_id, quantity, customer: {name, phone, email?} }
    Only pharmacies may call this endpoint.
    """
    if request.user.user_type != 'pharmacy':
        return Response({'error': 'Pharmacy access only'}, status=status.HTTP_403_FORBIDDEN)

    serializer = SellRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    med_id = serializer.validated_data['medicine_id']
    qty = serializer.validated_data['quantity']
    cust_data = serializer.validated_data.get('customer', {}) or {}

    with transaction.atomic():
        # Lock the medicine row to avoid race conditions
        med_qs = Medicine.objects.select_for_update().filter(pk=med_id, pharmacy=request.user)
        med = get_object_or_404(med_qs)

        if med.stock_quantity < qty:
            return Response({'detail': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)

        # Decrement stock and update timestamp
        med.stock_quantity -= qty
        med.updated_at = timezone.now()
        med.save(update_fields=['stock_quantity', 'updated_at'])

        # Create (or get) Pharmacy instance for Sale model (Sale.pharmacy is Pharmacy model)
        sale_pharmacy, _ = Pharmacy.objects.get_or_create(
            user=med.pharmacy,
            defaults={'name': getattr(med.pharmacy, 'username', 'Pharmacy'), 'address': '', 'phone': ''}
        )

        # Create Sale record
        total_price = (med.unit_price or Decimal('0.00')) * Decimal(qty)
        Sale.objects.create(
            pharmacy=sale_pharmacy,
            medicine=med,
            quantity=qty,
            total_price=total_price
        )

        # Create Order and OrderItem (Order.pharmacy uses User)
        cust_name = cust_data.get('name') or cust_data.get('email') or "Guest"
        cust_phone = cust_data.get('phone', '')

        order = Order.objects.create(
            pharmacy=med.pharmacy,  # med.pharmacy is a User in your models
            customer_name=cust_name,
            customer_phone=cust_phone,
            total_amount=total_price,
            status='completed'
        )

        OrderItem.objects.create(
            order=order,
            medicine=med,
            quantity=qty,
            unit_price=med.unit_price,
            subtotal=total_price
        )

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)