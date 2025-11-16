import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','pharmatrack_backend.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
from inventory.models import Pharmacy as InventoryPharmacy, Sale, Order, Medicine
from django.db.models import F
from django.utils import timezone
from django.db.models import Sum

User = get_user_model()

import argparse

parser = argparse.ArgumentParser(description='Check dashboard aggregates for a pharmacy email')
parser.add_argument('--email', '-e', default='test_pharmacy_for_sell@example.com', help='Pharmacy user email to check')
args = parser.parse_args()
email = args.email
try:
    user = User.objects.get(email=email)
except Exception as e:
    print('User not found', email)
    raise

inv = InventoryPharmacy.objects.filter(user=user).first()
print('InventoryPharmacy id:', getattr(inv,'id',None))

# medicines reference the User account
medicines = Medicine.objects.filter(pharmacy=user)
completed_orders = Order.objects.filter(pharmacy=user, status='completed')

sales_qs = Sale.objects.filter(pharmacy=inv) if inv else Sale.objects.none()

today = timezone.now().date()
orders_today_total = completed_orders.filter(created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0
sales_today_total = sales_qs.filter(sale_date__date=today).aggregate(total=Sum('total_price'))['total'] or 0

print('today_sales (orders+sales):', float(orders_today_total + sales_today_total))
print('total_medicines:', medicines.count())
print('low_stock_items:', medicines.filter(stock_quantity__lte=F('minimum_stock')).count() if medicines.exists() else 0)

print('total_orders:', Order.objects.filter(pharmacy=user).count())
print('total_sales_count (orders+sales):', completed_orders.count(), sales_qs.count())
print('total_revenue (orders+sales):', float((completed_orders.aggregate(total=Sum('total_amount'))['total'] or 0) + (sales_qs.aggregate(total=Sum('total_price'))['total'] or 0)))

print('Done')
