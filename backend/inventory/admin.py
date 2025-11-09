from django.contrib import admin
from .models import Medicine, Order, OrderItem

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'dosage', 'pharmacy', 'stock_quantity', 'minimum_stock', 'is_low_stock', 'unit_price']
    list_filter = ['category', 'pharmacy']
    search_fields = ['name', 'generic_name', 'manufacturer']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'pharmacy', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name', 'customer_email']
    inlines = [OrderItemInline]
