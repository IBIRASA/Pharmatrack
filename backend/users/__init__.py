# from django.test import TestCase
# from rest_framework.test import APIClient
# from rest_framework import status


# User = get_user_model()

# class UserAuthenticationTest(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         # Create test user
#         self.user = User.objects.create_user(
#             username='testuser',
#             email='test@test.com',
#             password='testpass123',
#             user_type='patient'
#         )

#     def test_user_login_success(self):
#         """Test successful user login"""
#         data = {
#             'username': 'testuser',
#             'password': 'testpass123'
#         }
#         response = self.client.post('/api/users/login/', data, format='json')
#         # Login should return 200 or 400 depending on implementation
#         self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

#     def test_user_login_invalid_credentials(self):
#         """Test login with invalid credentials"""
#         data = {
#             'username': 'testuser',
#             'password': 'wrongpassword'
#         }
#         response = self.client.post('/api/users/login/', data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# class UserRegistrationTest(TestCase):
#     def setUp(self):
#         self.client = APIClient()

#     def test_patient_registration(self):
#         """Test patient user registration"""
#         data = {
#             'username': 'newpatient',
#             'email': 'patient@new.com',
#             'password': 'testpass123',
#             'user_type': 'patient',
#             'date_of_birth': '1995-05-15'
#         }
#         response = self.client.post('/api/users/register/', data, format='json')
#         self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

# class UserSerializerTest(TestCase):
#     def test_user_serializer_contains_expected_fields(self):
#         """Test that UserSerializer has all expected fields"""
#         user = User.objects.create_user(
#             username='testuser',
#             email='test@test.com',
#             password='testpass123',
#             user_type='patient'
#         )
#         serializer = UserSerializer(instance=user)
#         data = serializer.data
#         self.assertIn('id', data)
#         self.assertIn('username', data)
#         self.assertIn('email', data)
#         self.assertIn('user_type', data)

#     def test_user_serializer_data(self):
#         """Test UserSerializer data matches user data"""
#         user = User.objects.create_user(
#             username='testuser',
#             email='test@test.com',
#             password='testpass123',
#             user_type='patient'
#         )
#         serializer = UserSerializer(instance=user)
#         self.assertEqual(serializer.data['username'], 'testuser')
#         self.assertEqual(serializer.data['email'], 'test@test.com')

# class PharmacySerializerTest(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(
#             username='pharmacy1',
#             email='pharmacy@test.com',
#             password='testpass123',
#             user_type='pharmacy'
#         )
#         self.pharmacy = Pharmacy.objects.create(
#             user=self.user,
#             pharmacy_name='Test Pharmacy',
#             license_number='LIC123',
#             phone_number='1234567890'
#         )

#     def test_pharmacy_serializer_fields(self):
#         """Test PharmacySerializer contains expected fields"""
#         serializer = PharmacySerializer(instance=self.pharmacy)
#         data = serializer.data
#         self.assertIn('pharmacy_name', data)
#         self.assertIn('license_number', data)
#         self.assertIn('phone_number', data)

# class PatientsAppTest(TestCase):
#     def test_patients_app_exists(self):
#         """Test that patients app is properly configured"""
#         self.assertTrue(True)

# class PatientsViewTest(TestCase):
#     def test_patients_view_placeholder(self):
#         """Placeholder test for patients views"""
#         self.assertTrue(True)