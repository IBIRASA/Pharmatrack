from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from inventory.models import Pharmacy as InventoryPharmacy
from users.models import Pharmacy as UserPharmacy


class UsersAPITestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()
        # create a pharmacy user (unverified by default)
        self.pharmacy_user = User.objects.create_user(username='pharm-test', email='pharm-test@example.com', password='secret123', user_type='pharmacy')
        # ensure inventory profile exists
        InventoryPharmacy.objects.create(user=self.pharmacy_user, name='PharmTest', address='addr', phone='000')
        # ensure users.Pharmacy profile exists (unverified by default)
        UserPharmacy.objects.create(user=self.pharmacy_user, name='PharmTest', phone='000', address='addr')

        # admin user
        self.admin = User.objects.create_user(username='admin', email='admin@example.com', password='adminpass', user_type='patient')
        self.admin.is_staff = True
        self.admin.is_superuser = True
        self.admin.save()

    def test_register_pharmacy_returns_pending_message(self):
        url = '/api/users/register/'
        payload = {
            'email': 'newpharm@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'user_type': 'pharmacy',
            'name': 'New Pharm'
        }
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn('Awaiting admin approval', str(body.get('message', '')))

    def test_login_pharmacy_blocked_before_approval(self):
        url = '/api/users/login/'
        payload = {'email': self.pharmacy_user.email, 'password': 'secret123'}
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 403)
        self.assertIn('pending approval', resp.json().get('detail', '').lower())

    def test_admin_can_approve_and_pharmacy_can_login(self):
        # admin approve endpoint
        self.client.force_authenticate(user=self.admin)
        url = f'/api/users/pending/{self.pharmacy_user.id}/approve/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 200)

        # now attempt login as pharmacy
        self.client.force_authenticate(user=None)
        login_url = '/api/users/login/'
        resp2 = self.client.post(login_url, {'email': self.pharmacy_user.email, 'password': 'secret123'}, format='json')
        self.assertEqual(resp2.status_code, 200)
        data = resp2.json()
        self.assertIn('token', data)
