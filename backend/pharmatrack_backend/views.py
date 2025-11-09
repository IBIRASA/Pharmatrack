from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

@api_view(['POST'])
def create_sale(request):
    data = request.data
    med = get_object_or_404(Medicine, pk=data.get('medicine_id'))
    qty = int(data.get('quantity', 0))

    if qty <= 0:
        return Response({'detail': 'Invalid quantity'}, status=400)

    with transaction.atomic():
        if med.stock_quantity < qty:
            return Response({'detail': 'Insufficient stock'}, status=400)
        med.stock_quantity -= qty
        med.save()
        order = Order.objects.create(medicine=med, quantity=qty, total_price=data.get('total_price') or 0, ...)
    return Response({
        'order': OrderSerializer(order).data,
        'updated_medicine': MedicineSerializer(med).data
    })