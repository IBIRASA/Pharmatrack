from rest_framework import serializers
from .models import Medicine, Order,OrderItem


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
    def validate_stock_quantity(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("stock_quantity cannot be negative")
        return value

class SellRequestSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    customer = serializers.DictField(child=serializers.CharField(), required=False)

class OrderItemSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'medicine', 'quantity', 'unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'pharmacy', 'patient', 'customer_name', 'customer_phone', 'total_amount', 'status', 'created_at', 'updated_at']
        read_only_fields = ['pharmacy', 'patient', 'created_at', 'updated_at']