from rest_framework import serializers
from .models import Medicine, Order


class MedicineSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    pharmacy_name = serializers.CharField(source='pharmacy.username', read_only=True)
    pharmacy_id = serializers.IntegerField(source='pharmacy.id', read_only=True)
    pharmacy_email = serializers.EmailField(source='pharmacy.email', read_only=True)
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'pharmacy', 'pharmacy_name', 'pharmacy_id', 'pharmacy_email',
            'name', 'generic_name', 'manufacturer', 'category', 'dosage',
            'unit_price', 'stock_quantity', 'minimum_stock', 'expiry_date',
            'description', 'is_low_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pharmacy', 'pharmacy_name', 'pharmacy_id', 'pharmacy_email', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'pharmacy', 'customer_name', 'customer_phone', 'total_amount', 'status', 'created_at', 'updated_at']
        read_only_fields = ['pharmacy', 'created_at', 'updated_at']