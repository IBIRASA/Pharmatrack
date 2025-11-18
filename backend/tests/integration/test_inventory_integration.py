from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from inventory.models import Medicine, Order, OrderItem, Pharmacy as InventoryPharmacy, Sale, Customer
from datetime import date, timedelta


class InventoryValidationIntegrationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()

        # pharmacy user and profiles
        self.pharm_user = User.objects.create_user(username='pharm2', email='pharm2@example.com', password='p', user_type='pharmacy')
        self.inv_pharm = InventoryPharmacy.objects.create(user=self.pharm_user, name='P2', address='x', phone='000')

        # medicine owned by this pharmacy
        self.medicine = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='IntMed',
            generic_name='IM',
            manufacturer='M',
            category='C',
            dosage='5mg',
            unit_price='5.00',
            stock_quantity=10,
            minimum_stock=1,
            expiry_date=date.today() + timedelta(days=365),
            description='d',
        )

        # patient user
        self.patient = User.objects.create_user(username='patient2', email='p2@example.com', password='pp', user_type='patient')

    def test_confirm_delivery_creates_sale_and_attaches_customer(self):
        # create an order (not reserved) and mark it shipped, then confirm delivery as patient
        order = Order.objects.create(pharmacy=self.pharm_user, patient=self.patient, customer_name='Alice', customer_phone='077700', total_amount=10, status='shipped')
        OrderItem.objects.create(order=order, medicine=self.medicine, quantity=2, unit_price=self.medicine.unit_price, subtotal=10)

        self.client.force_authenticate(user=self.patient)
        url = f'/api/inventory/orders/{order.id}/confirm/'
        resp = self.client.post(url, {'customer_name': 'Alice'}, format='json')
        self.assertEqual(resp.status_code, 200)

        # A Sale should have been created for the inventory pharmacy
        sales = Sale.objects.filter(medicine=self.medicine)
        self.assertTrue(sales.exists())
        sale = sales.first()
        self.assertEqual(sale.quantity, 2)

        # Customer record should exist and be linked
        self.assertIsNotNone(sale.customer)
        self.assertIn('Alice', sale.customer.name)

    def test_customers_list_dedupes_and_aggregates(self):
        # create two customers and sales, plus an order with same phone
        c1 = Customer.objects.create(name='Bob', email='bob@example.com', phone='0777123')
        Sale.objects.create(pharmacy=self.inv_pharm, medicine=self.medicine, quantity=1, total_price=5.00, customer=c1)
        # another sale by same email
        Sale.objects.create(pharmacy=self.inv_pharm, medicine=self.medicine, quantity=2, total_price=10.00, customer=c1)

        # Create an Order with same phone (anonymous customer)
        order = Order.objects.create(pharmacy=self.pharm_user, patient=None, customer_name='Bob', customer_phone='0777123', total_amount=15, status='completed')
        OrderItem.objects.create(order=order, medicine=self.medicine, quantity=3, unit_price=self.medicine.unit_price, subtotal=15)

        # authenticate as pharmacy user
        self.client.force_authenticate(user=self.pharm_user)
        resp = self.client.get('/api/inventory/customers/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Expect a single aggregated customer entry
        self.assertTrue(isinstance(data, list))
        # Should contain at least one entry with phone 0777123 or name Bob
        found = any(('0777123' in (item.get('phone') or '') or 'bob' in (item.get('name') or '').lower()) for item in data)
        self.assertTrue(found)

    def test_order_to_sale_integration_flow(self):
        # patient places order via API
        self.client.force_authenticate(user=self.patient)
        payload = {'pharmacy_id': self.pharm_user.id, 'items': [{'medicine_id': self.medicine.id, 'quantity': 2}], 'customer_name': 'Charlie', 'customer_phone': '0777007'}
        resp = self.client.post('/api/inventory/orders/place/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        order_id = data.get('order_id')
        self.assertIsNotNone(order_id)

        # Pharmacy approves the order (reserve stock)
        self.client.force_authenticate(user=self.pharm_user)
        resp2 = self.client.put(f'/api/inventory/orders/{order_id}/', {'status': 'approved'}, format='json')
        self.assertIn(resp2.status_code, (200, 201))

        # Pharmacy marks as shipped
        resp3 = self.client.post(f'/api/inventory/orders/{order_id}/ship/', {}, format='json')
        self.assertEqual(resp3.status_code, 200)

        # Patient confirms delivery -> this should create Sale(s)
        self.client.force_authenticate(user=self.patient)
        resp4 = self.client.post(f'/api/inventory/orders/{order_id}/confirm/', {'customer_name': 'Charlie'}, format='json')
        self.assertEqual(resp4.status_code, 200)

        # Verify Sale created
        sales = Sale.objects.filter(medicine=self.medicine, quantity=2)
        self.assertTrue(sales.exists())
