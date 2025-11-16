import os
import sys
import django
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','pharmatrack_backend.settings')
django.setup()


from django.contrib.auth import get_user_model
from inventory.models import Pharmacy as InventoryPharmacy, Medicine, Sale, Customer
from django.db import transaction
from django.utils import timezone

User = get_user_model()

import argparse

parser = argparse.ArgumentParser(description='Run a non-HTTP test sale for a pharmacy email')
parser.add_argument('--email', '-e', default='test_pharmacy_for_sell@example.com', help='Pharmacy user email to use for the test')
args = parser.parse_args()

email = args.email
user, created = User.objects.get_or_create(email=email, defaults={'username':'testpharm','user_type':'pharmacy'})
if created:
    print('Created user', user.email)
else:
    print('Using existing user', user.email)
# Ensure user_type is pharmacy
user.user_type = 'pharmacy'
user.save()

# Remove existing inventory pharmacy to test auto-creation
InventoryPharmacy.objects.filter(user=user).delete()
print('Deleted any existing InventoryPharmacy for user')

# Create a medicine for this user
med = Medicine.objects.create(
    pharmacy=user,
    name='TestMed',
    generic_name='TM',
    manufacturer='TestCorp',
    category='Test',
    dosage='10mg',
    unit_price='5.00',
    stock_quantity=100,
    minimum_stock=1,
    expiry_date='2099-01-01',
    description='Test medicine'
)
print('Created medicine', med.id)

qty = 2
customer_name = 'John Doe'
customer_phone = '078000111'

# Perform sale using ORM similar to sell_medicine view (no HTTP)
sale = None
with transaction.atomic():
    med = Medicine.objects.select_for_update().get(id=med.id)
    if med.stock_quantity < qty:
        print('Insufficient stock')
    else:
        med.stock_quantity = med.stock_quantity - qty
        med.save()

        # determine/create customer
        customer_obj = None
        try:
            if customer_phone:
                customer_obj, _ = Customer.objects.get_or_create(phone=customer_phone, defaults={'name': customer_name, 'email': None})
            elif customer_name:
                customer_obj, _ = Customer.objects.get_or_create(name=customer_name, defaults={'phone': ''})
        except Exception:
            customer_obj = None

        # ensure InventoryPharmacy exists
        inv = InventoryPharmacy.objects.filter(user_id=med.pharmacy.id).first()
        if not inv:
            try:
                pname = getattr(med.pharmacy, 'name', None) or getattr(med.pharmacy, 'username', None) or (getattr(med.pharmacy, 'email', '') or '').split('@')[0]
                inv, _ = InventoryPharmacy.objects.get_or_create(user_id=med.pharmacy.id, defaults={'name': f"{pname} Pharmacy", 'address': '', 'phone': ''})
            except Exception:
                inv = None

        if inv:
            sale = Sale.objects.create(pharmacy=inv, medicine=med, quantity=qty, total_price=(float(getattr(med, 'unit_price', 0) or 0) * qty), customer=customer_obj)
            print('Created sale ID', sale.id)

inv = InventoryPharmacy.objects.filter(user=user).first()
print('InventoryPharmacy after sale:', inv and inv.id)

if inv:
    sales = list(Sale.objects.filter(pharmacy=inv).values('id','medicine_id','quantity','total_price','customer_id','sale_date'))
    print('Sales for inv:', json.dumps(sales, default=str))
    customer_ids = [s['customer_id'] for s in sales if s['customer_id']]
    customers = list(Customer.objects.filter(id__in=customer_ids).values('id','name','phone','email'))
    print('Customers created:', json.dumps(customers, default=str))
else:
    print('No InventoryPharmacy found; sale likely not recorded')

# Print remaining stock
med.refresh_from_db()
print('Remaining stock for medicine:', med.stock_quantity)

print('Done')
