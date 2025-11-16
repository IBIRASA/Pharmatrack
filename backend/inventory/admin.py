from django.contrib import admin
from .models import Medicine, Order, OrderItem, Sale, Customer

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
    list_display = ['id', 'customer_name', 'patient', 'pharmacy', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name', 'pharmacy__username']
    inlines = [OrderItemInline]


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'pharmacy', 'medicine', 'quantity', 'total_price', 'customer', 'sale_date']
    list_filter = ['sale_date', 'pharmacy']
    search_fields = ['medicine__name', 'customer__name']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email', 'phone']
