from django.contrib import admin
from .models import User, Pharmacy, Patient


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
	list_display = ('name', 'user', 'phone', 'latitude', 'longitude', 'is_verified', 'created_at')
	search_fields = ('name', 'user__email', 'user__username')
	list_filter = ('is_verified',)


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
	list_display = ('email', 'username', 'user_type', 'is_active', 'is_staff', 'is_superuser')
	search_fields = ('email', 'username')


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
	list_display = ('name', 'user', 'phone', 'created_at')
	search_fields = ('name', 'user__email')
