from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from inventory.models import Medicine, Pharmacy as InventoryPharmacy
from datetime import date, timedelta


class ExpiringMedicinesTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()
        
        # Create a pharmacy user
        self.pharm_user = User.objects.create_user(
            username='pharm1', 
            email='pharm1@example.com', 
            password='pass', 
            user_type='pharmacy'
        )
        
        # Create inventory pharmacy profile
        self.inv_pharm = InventoryPharmacy.objects.create(
            user=self.pharm_user, 
            name='Test Pharmacy', 
            address='123 Main St', 
            phone='555-0123'
        )

        # Create medicines with different expiry dates
        today = date.today()
        
        # Medicine expiring in 30 days (should be included)
        self.expiring_soon = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='ExpiringMed',
            generic_name='EM',
            manufacturer='Acme',
            category='Analgesic',
            dosage='100mg',
            unit_price='5.00',
            stock_quantity=10,
            minimum_stock=1,
            expiry_date=today + timedelta(days=30),
            description='Medicine expiring soon',
        )
        
        # Medicine expiring in 90 days (should NOT be included)
        self.not_expiring_soon = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='NotExpiringMed',
            generic_name='NEM',
            manufacturer='Acme',
            category='Analgesic',
            dosage='200mg',
            unit_price='7.00',
            stock_quantity=15,
            minimum_stock=2,
            expiry_date=today + timedelta(days=90),
            description='Medicine not expiring soon',
        )
        
        # Already expired medicine (should NOT be included)
        self.expired_med = Medicine.objects.create(
            pharmacy=self.pharm_user,
            name='ExpiredMed',
            generic_name='EXPM',
            manufacturer='Acme',
            category='Analgesic',
            dosage='50mg',
            unit_price='3.00',
            stock_quantity=5,
            minimum_stock=1,
            expiry_date=today - timedelta(days=10),
            description='Already expired medicine',
        )

    def test_expiring_medicines_endpoint_requires_authentication(self):
        """Test that the endpoint requires authentication"""
        url = '/api/inventory/medicines/expiring-soon/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_expiring_medicines_endpoint_requires_pharmacy_user(self):
        """Test that the endpoint requires a pharmacy user"""
        User = get_user_model()
        patient_user = User.objects.create_user(
            username='patient1', 
            email='patient1@example.com', 
            password='pass', 
            user_type='patient'
        )
        
        self.client.force_authenticate(user=patient_user)
        url = '/api/inventory/medicines/expiring-soon/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 403)

    def test_expiring_medicines_returns_correct_medicines(self):
        """Test that only medicines expiring within 60 days are returned"""
        self.client.force_authenticate(user=self.pharm_user)
        url = '/api/inventory/medicines/expiring-soon/'
        resp = self.client.get(url)
        
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        # Should return only one medicine (the one expiring in 30 days)
        self.assertEqual(len(data), 1)
        
        # Verify it's the correct medicine
        medicine_data = data[0]
        self.assertEqual(medicine_data['name'], 'ExpiringMed')
        self.assertEqual(medicine_data['days_until_expiry'], 30)
        self.assertEqual(medicine_data['expiration_level'], 'warning')
        self.assertTrue(medicine_data['is_expiring_soon'])

    def test_expiring_medicines_includes_expiry_metadata(self):
        """Test that the response includes expiry-related metadata"""
        self.client.force_authenticate(user=self.pharm_user)
        url = '/api/inventory/medicines/expiring-soon/'
        resp = self.client.get(url)
        
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        medicine_data = data[0]
        
        # Check that expiry metadata is included
        self.assertIn('days_until_expiry', medicine_data)
        self.assertIn('expiration_level', medicine_data)
        self.assertIn('expiration_message', medicine_data)
        self.assertIn('is_expiring_soon', medicine_data)
        
        # Verify the values are correct
        self.assertEqual(medicine_data['days_until_expiry'], 30)
        self.assertEqual(medicine_data['expiration_level'], 'warning')
        self.assertEqual(medicine_data['expiration_message'], 'Expires in 30 days')
        self.assertTrue(medicine_data['is_expiring_soon'])