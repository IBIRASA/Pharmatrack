from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from inventory.models import Medicine, Order, OrderItem, Pharmacy as InventoryPharmacy
from datetime import date, timedelta


class PatientOrderTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()

        # create a pharmacy user and inventory pharmacy
        self.pharm_user = User.objects.create_user(username='pharm1', email='pharm1@example.com', password='pass', user_type='pharmacy')
        self.inv_pharm = InventoryPharmacy.objects.create(user=self.pharm_user, name='P1', address='x', phone='000')

        # medicine offered by this pharmacy (pharmacy field is User)
        self.medicine = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='TestMed',
            generic_name='T',
            manufacturer='M',
            category='C',
            dosage='10mg',
            unit_price='3.00',
            stock_quantity=5,
            minimum_stock=1,
            expiry_date=date.today() + timedelta(days=365),
            description='d',
        )

        # patient user
        self.patient = User.objects.create_user(username='patient1', email='p1@example.com', password='ppass', user_type='patient')

    def test_place_order_requires_patient(self):
        # try placing order as anonymous -> should get 401
        url = '/api/inventory/orders/place/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 401)

        # try placing as pharmacy user (not a patient)
        self.client.force_authenticate(user=self.pharm_user)
        payload = {'pharmacy_id': self.pharm_user.id, 'items': [{'medicine_id': self.medicine.id, 'quantity': 1}], 'customer_phone': '0777'}
        resp2 = self.client.post(url, payload, format='json')
        self.assertEqual(resp2.status_code, 403)

    def test_place_order_missing_phone(self):
        self.client.force_authenticate(user=self.patient)
        url = '/api/inventory/orders/place/'
        payload = {'pharmacy_id': self.pharm_user.id, 'items': [{'medicine_id': self.medicine.id, 'quantity': 1}], 'customer_name': 'Alice'}
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('customer_phone', str(resp.json()).lower())

    def test_place_order_success_creates_order(self):
        self.client.force_authenticate(user=self.patient)
        url = '/api/inventory/orders/place/'
        payload = {'pharmacy_id': self.pharm_user.id, 'items': [{'medicine_id': self.medicine.id, 'quantity': 2}], 'customer_name': 'Alice', 'customer_phone': '0777000'}
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn('order_id', data)
        # verify order exists
        order = Order.objects.filter(pk=data.get('order_id')).first()
        self.assertIsNotNone(order)
        self.assertEqual(order.total_amount, float(data.get('total')))
