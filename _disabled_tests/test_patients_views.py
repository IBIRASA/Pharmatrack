import unittest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from users.models import Pharmacy
from inventory.models import Medicine
from decimal import Decimal

User = get_user_model()

class PatientsViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='pat@test.com', name='Pat', password='pass123')
        self.client.force_authenticate(user=self.user)
        self.pharmacy_user = User.objects.create_user(email='pharm@test.com', name='Pharm', password='pass123')
        self.pharmacy = Pharmacy.objects.create(
            user=self.pharmacy_user,
            license_number='LIC1',
            latitude=40.0,
            longitude=-74.0,
            address='123 Street',
            phone='+123456789'
        )
        self.medicine = Medicine.objects.create(
            name='Paracetamol',
            price=Decimal('5.00'),
            stock_quantity=10,
            pharmacy=self.pharmacy
        )

    def test_search_requires_name(self):
        resp = self.client.get('/api/patients/search-medicine/')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('error', resp.data)

    def test_search_returns_results(self):
        resp = self.client.get('/api/patients/search-medicine/?name=Para')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('results', resp.data)
        self.assertGreaterEqual(len(resp.data['results']), 1)

    def test_nearby_requires_coords(self):
        resp = self.client.get('/api/patients/nearby-pharmacies/')
        self.assertEqual(resp.status_code, 400)

    def test_nearby_with_coords(self):
        resp = self.client.get('/api/patients/nearby-pharmacies/?latitude=40&longitude=-74&radius=100')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('results', resp.data)