#!/usr/bin/env python3
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','pharmatrack_backend.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Medicine
from rest_framework.test import APIRequestFactory, force_authenticate
from inventory.views import sell_medicine

User = get_user_model()

import argparse

parser = argparse.ArgumentParser(description='Run an internal authenticated sell request for a pharmacy email')
parser.add_argument('--email', '-e', default='test_pharmacy_for_sell@example.com', help='Pharmacy user email to use')
args = parser.parse_args()

email = args.email
user = User.objects.filter(email=email).first()
if not user:
    print('User not found:', email)
    sys.exit(1)

# create a medicine for this user if missing
med = Medicine.objects.filter(pharmacy=user).first()
if not med:
    med = Medicine.objects.create(
        pharmacy=user,
        name='HTTP Test Med',
        generic_name='HTM',
        manufacturer='TestCo',
        category='Test',
        dosage='10mg',
        unit_price='5.00',
        stock_quantity=50,
        minimum_stock=1,
        expiry_date='2099-01-01',
        description='HTTP internal test'
    )
    print('Created medicine id', med.id)

factory = APIRequestFactory()
# Prepare payload matching sell_medicine
payload = {'medicine_id': med.id, 'quantity': 1, 'customer_name': 'API Test', 'customer_phone': '078999000'}
request = factory.post('/api/inventory/sell/', payload, format='json')
force_authenticate(request, user=user)

resp = sell_medicine(request)
print('Status code:', getattr(resp, 'status_code', None))
try:
    print('Response data:', resp.data)
except Exception:
    print('Could not print resp.data')

# Show resulting Sales for user's InventoryPharmacy
from inventory.models import Pharmacy as InventoryPharmacy, Sale
inv = InventoryPharmacy.objects.filter(user=user).first()
print('InventoryPharmacy id:', getattr(inv, 'id', None))
if inv:
    sales = list(Sale.objects.filter(pharmacy=inv).values('id','medicine_id','quantity','total_price','customer_id','sale_date'))
    print('Sales for inv:', sales)
else:
    print('No InventoryPharmacy for user')

print('Done')
