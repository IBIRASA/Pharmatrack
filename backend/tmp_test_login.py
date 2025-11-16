from django.contrib.auth import get_user_model
from django.test import Client
from users.models import Pharmacy as UsersPharmacy

User = get_user_model()

email = 'test-login-pharmacy@example.com'
pwd = 'TestPass123'

user, created = User.objects.get_or_create(email=email, defaults={'username': email.split('@')[0], 'user_type': 'pharmacy'})
if created:
    user.set_password(pwd)
    user.is_active = True
    user.save()
    print('Created user', user.email)
else:
    # ensure password matches for test
    user.set_password(pwd)
    user.is_active = True
    user.save()
    print('Updated password for', user.email)

ph, pc = UsersPharmacy.objects.get_or_create(user=user, defaults={'name': 'Test Pharmacy', 'is_verified': True})
if not pc:
    ph.is_verified = True
    ph.save()
    print('Set pharmacy verified for', user.email)

c = Client()
resp = c.post('/api/users/login/', {'email': email, 'password': pwd}, content_type='application/json')
print('Response status:', resp.status_code)
print('Response body:', resp.content.decode())
