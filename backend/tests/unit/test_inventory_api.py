from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from inventory import views as inv_views
from inventory.models import Medicine, Pharmacy as InventoryPharmacy, Customer, Sale
from datetime import date, timedelta


class InventoryAPITestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        # create a pharmacy user
        self.pharm_user = User.objects.create_user(username='pharm1', email='pharm1@example.com', password='pass', user_type='pharmacy')
        # create inventory pharmacy profile
        self.inv_pharm = InventoryPharmacy.objects.create(user=self.pharm_user, name='Test Pharmacy', address='123', phone='000')

        # create a medicine owned by the pharmacy user
        self.medicine = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='TestMed',
            generic_name='TM',
            manufacturer='Acme',
            category='Analgesic',
            dosage='100mg',
            unit_price='5.00',
            stock_quantity=10,
            minimum_stock=1,
            expiry_date=date.today() + timedelta(days=365),
            description='Test',
        )

        self.client = APIClient()

    def test_get_or_create_customer_creates_by_email(self):
        c = inv_views._get_or_create_customer('Alice', 'alice@example.com', None)
        self.assertIsNotNone(c)
        self.assertEqual(c.email, 'alice@example.com')

    def test_sell_medicine_creates_sale_and_reduces_stock(self):
        self.client.force_authenticate(user=self.pharm_user)
        url = '/api/inventory/sell/'
        payload = {
            'medicine_id': self.medicine.id,
            'quantity': 2,
            'customer_name': 'Bob',
            'customer_phone': '0777000000',
        }

        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn('sale_id', data)

        # reload medicine and verify stock reduced
        m = Medicine.objects.get(pk=self.medicine.id)
        self.assertEqual(m.stock_quantity, 8)

        # sale exists and linked to inventory pharmacy
        sale = Sale.objects.filter(id=data.get('sale_id')).first()
        self.assertIsNotNone(sale)
        self.assertEqual(sale.pharmacy.id, self.inv_pharm.id)

        # customer should have been created or linked
        self.assertIsNotNone(sale.customer)
