from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
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
    """
    Return dashboard stats including dynamic low_stock_count.
    """
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
            print(f"Patient search: '{search}', Found: {medicines.count()} medicines")  
        else:
            # Pharmacy sees only their own medicines
            medicines = Medicine.objects.filter(pharmacy=request.user)
            search = request.query_params.get('search', '')
            if search:
                medicines = medicines.filter(
                    Q(name__icontains=search) | 
                    Q(generic_name__icontains=search)
                )
            print(f"Pharmacy view: Found {medicines.count()} medicines")  
        
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

# ...existing code...
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
# ...existing code...


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
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def sell_medicine(request):
    """
    Expected JSON:
    { "medicine_id": 1, "quantity": 2, "customer_name": "Name", "customer_phone": "0999...", "prescription": null }
    """
    data = request.data
    med_id = data.get('medicine_id')
    qty = int(data.get('quantity', 0))
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

    with transaction.atomic():
        # create order (adjust field names to match your Order model)
        order = Order.objects.create(
            customer_name=customer_name,
            customer_phone=customer_phone,
            prescription=prescription,
            total=0  # will update after creating items
        )

        unit_price = getattr(med, 'unit_price', 0) or 0
        try:
            unit_price = float(unit_price)
        except Exception:
            unit_price = 0.0

        subtotal = unit_price * qty
        OrderItem.objects.create(
            order=order,
            medicine=med,
            quantity=qty,
            unit_price=unit_price,
            subtotal=subtotal
        )

        # decrement stock
        med.stock_quantity = med.stock_quantity - qty
        med.save()

        # update order total if Order has 'total' field
        if hasattr(order, 'total'):
            order.total = subtotal
            order.save()

    resp = {
        'order_id': order.id,
        'medicine_id': med.id,
        'quantity': qty,
        'remaining_stock': med.stock_quantity,
    }
    return Response(resp, status=status.HTTP_201_CREATED)