# # users/serializers.py
# from rest_framework import serializers
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'email', 'user_type', 'phone', 'address')
#         read_only_fields = ('id',)

# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, min_length=6)
#     password2 = serializers.CharField(write_only=True, min_length=6)

#     class Meta:
#         model = User
#         fields = ('username', 'email', 'password', 'password2', 'user_type', 'phone', 'address')

#     def validate(self, data):
#         if data['password'] != data['password2']:
#             raise serializers.ValidationError("Passwords don't match")
#         return data

#     def create(self, validated_data):
#         validated_data.pop('password2')
#         user = User.objects.create_user(**validated_data)
#         return user

# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField(write_only=True)
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Patient, Pharmacy

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=['patient', 'pharmacy'])
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists"})
        
        return data

    def create(self, validated_data):
        # Remove password_confirm as it's not needed
        validated_data.pop('password_confirm')
        
        # Extract fields
        email = validated_data['email']
        password = validated_data['password']
        user_type = validated_data['user_type']
        name = validated_data.get('name', '')
        phone = validated_data.get('phone', '')
        address = validated_data.get('address', '')

        # Create user with a username (required by AbstractUser)
        username = email.split('@')[0]  
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type
        )

        # Create profile based on user type
        if user_type == 'patient':
            Patient.objects.create(
                user=user,
                name=name,
                phone=phone
            )
        elif user_type == 'pharmacy':
            Pharmacy.objects.create(
                user=user,
                name=name,
                phone=phone,
                address=address
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'user_type', 'name', 'phone']

    def get_name(self, obj):
        if obj.user_type == 'patient' and hasattr(obj, 'patient_profile'):
            return obj.patient_profile.name
        elif obj.user_type == 'pharmacy' and hasattr(obj, 'pharmacy_profile'):
            return obj.pharmacy_profile.name
        return obj.email

    def get_phone(self, obj):
        if obj.user_type == 'patient' and hasattr(obj, 'patient_profile'):
            return obj.patient_profile.phone
        elif obj.user_type == 'pharmacy' and hasattr(obj, 'pharmacy_profile'):
            return obj.pharmacy_profile.phone
        return None