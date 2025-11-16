from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register_user, login_user, me, pending_pharmacies, admin_approve_pharmacy, admin_reject_pharmacy

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
    path('pending/', pending_pharmacies, name='pending_pharmacies'),
    path('pending/<int:user_id>/approve/', admin_approve_pharmacy, name='admin_approve_pharmacy'),
    path('pending/<int:user_id>/reject/', admin_reject_pharmacy, name='admin_reject_pharmacy'),
]