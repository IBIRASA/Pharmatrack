import unittest
from django.test import TestCase
from django.contrib.auth import get_user_model
from inventory.models import Medicine, Sale, Order, Customer, Notification
from users.models import Patient, Pharmacy
from decimal import Decimal

User = get_user_model()

def display_name(user):
    return getattr(user, 'name', None) or user.get_full_name() or user.username

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.username, self.user_data['username'])
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_user_email_normalized(self):
        email = 'test@EXAMPLE.COM'
        user = User.objects.create_user(
            username='normuser',
            email=email,
            password='test123'
        )
        self.assertEqual(user.email, email.lower())

    def test_user_invalid_email(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='noemail',
                email='',
                password='test123'
            )

class PatientModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='patient1',
            email='patient@test.com',
            password='pass123'
        )

    def test_create_patient(self):
        patient = Patient.objects.create(
            user=self.user,
            date_of_birth='1990-01-01',
            address='123 Test St'
        )
        self.assertEqual(patient.user, self.user)
        self.assertEqual(str(patient.date_of_birth), '1990-01-01')
        self.assertEqual(patient.address, '123 Test St')

    def test_patient_str_method(self):
        patient = Patient.objects.create(user=self.user)
        self.assertEqual(str(patient), display_name(self.user))

class PharmacyModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='pharmacy1',
            email='pharmacy@test.com',
            password='pass123'
        )

    def test_create_pharmacy(self):
        pharmacy = Pharmacy.objects.create(
            user=self.user,
            license_number='LIC123456',
            phone='+1234567890',
            address='456 Pharmacy Ave',
            is_verified=False
        )
        self.assertEqual(pharmacy.user, self.user)
        self.assertEqual(pharmacy.license_number, 'LIC123456')
        self.assertEqual(pharmacy.phone, '+1234567890')
        self.assertFalse(pharmacy.is_verified)

    def test_pharmacy_str_method(self):
        pharmacy = Pharmacy.objects.create(
            user=self.user,
            license_number='LIC123'
        )
        self.assertEqual(str(pharmacy), display_name(self.user))

class MedicineModelTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(
            username='pharmuser',
            email='pharmacy@test.com',
            password='pass123'
        )
        self.pharmacy = Pharmacy.objects.create(
            user=user,
            license_number='LIC123'
        )

    def test_create_medicine(self):
        medicine = Medicine.objects.create(
            name='Paracetamol',
            generic_name='Acetaminophen',
            description='Pain reliever',
            manufacturer='Test Pharma',
            category='Pain Relief',
            dosage_form='Tablet',
            strength='500mg',
            price=Decimal('5.99'),
            stock_quantity=100,
            reorder_level=20,
            expiry_date='2025-12-31',
            pharmacy=self.pharmacy
        )
        self.assertEqual(medicine.name, 'Paracetamol')
        self.assertEqual(medicine.price, Decimal('5.99'))
        self.assertEqual(medicine.stock_quantity, 100)
        self.assertEqual(medicine.pharmacy, self.pharmacy)

    def test_medicine_str_method(self):
        medicine = Medicine.objects.create(
            name='Aspirin',
            price=Decimal('3.99'),
            stock_quantity=50,
            pharmacy=self.pharmacy
        )
        self.assertIn('Aspirin', str(medicine))

    def test_medicine_in_stock_property(self):
        medicine = Medicine.objects.create(
            name='Test Med',
            price=Decimal('10.00'),
            stock_quantity=10,
            pharmacy=self.pharmacy
        )
        self.assertTrue(getattr(medicine, 'in_stock', medicine.stock_quantity > 0))
        medicine.stock_quantity = 0
        medicine.save()
        self.assertFalse(getattr(medicine, 'in_stock', medicine.stock_quantity > 0))

class OrderModelTest(TestCase):
    def setUp(self):
        pharmacy_user = User.objects.create_user(
            username='phuser',
            email='pharmacy@test.com',
            password='pass123'
        )
        self.pharmacy = Pharmacy.objects.create(
            user=pharmacy_user,
            license_number='LIC123'
        )
        patient_user = User.objects.create_user(
            username='patuser',
            email='patient@test.com',
            password='pass123'
        )
        self.patient = Patient.objects.create(user=patient_user)
        self.medicine = Medicine.objects.create(
            name='Test Medicine',
            price=Decimal('10.00'),
            stock_quantity=100,
            pharmacy=self.pharmacy
        )

    def test_create_order(self):
        order = Order.objects.create(
            medicine=self.medicine,
            quantity=5,
            total_price=Decimal('50.00'),
            customer_name='John Doe',
            customer_email='john@test.com',
            patient=self.patient,
            status='pending'
        )
        self.assertEqual(order.medicine, self.medicine)
        self.assertEqual(order.quantity, 5)
        self.assertEqual(order.total_price, Decimal('50.00'))
        self.assertEqual(order.status, 'pending')

    def test_order_str_method(self):
        order = Order.objects.create(
            medicine=self.medicine,
            quantity=2,
            total_price=Decimal('20.00'),
            customer_name='Jane Doe'
        )
        self.assertIn('Test Medicine', str(order))

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='notifuser',
            email='user@test.com',
            password='pass123'
        )

    def test_create_notification(self):
        notification = Notification.objects.create(
            user=self.user,
            message='Test notification',
            notification_type='order'
        )
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.message, 'Test notification')
        self.assertEqual(notification.notification_type, 'order')
        self.assertFalse(notification.is_read)

    def test_notification_str_method(self):
        notification = Notification.objects.create(
            user=self.user,
            message='Test message'
        )
        self.assertIn(display_name(self.user), str(notification))