from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer
from .models import User
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
import os
import secrets

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # If pharmacy user was created, inform them that admin approval is required
        try:
            if getattr(user, 'user_type', '') == 'pharmacy':
                return Response({'message': 'Pharmacy account created. Awaiting admin approval before you can sign in.'}, status=status.HTTP_201_CREATED)
        except Exception:
            pass

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return JWT token"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'detail': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find a user by email (registration may set username != email)
    try:
        user_obj = User.objects.filter(email__iexact=email).first()
    except Exception:
        user_obj = None

    # If a pharmacy user exists but is not verified, return a clear message instead
    try:
        if user_obj and getattr(user_obj, 'user_type', '') == 'pharmacy':
            # Check only the pharmacy_profile.is_verified flag. We will rely on
            # the profile verification state (not user.is_active/is_staff) to
            # gate sign-in for pharmacy users.
            try:
                profile = getattr(user_obj, 'pharmacy_profile', None)
                if profile and not getattr(profile, 'is_verified', True):
                    return Response({'detail': 'Account pending approval. Please wait for an administrator to approve your pharmacy account.'}, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                pass
    except Exception:
        pass

    # Authenticate: prefer direct password check on the found user object (avoids
    # issues when AbstractUser.USERNAME_FIELD != 'username' or when username/email
    # were stored differently). Fall back to Django's authenticate as a secondary
    # attempt for any configured auth backends.
    user = None
    try:
        if user_obj and hasattr(user_obj, 'check_password') and user_obj.check_password(password):
            user = user_obj
            print(f"login_user: password matched for user_obj email={user_obj.email} id={user_obj.id}")
        else:
            # Try authenticate using email (USERNAME_FIELD) as a fallback
            user = authenticate(request, username=email, password=password)
            print(f"login_user: authenticate fallback returned: {user}")
    except Exception as auth_exc:
        print('login_user: authentication exception', auth_exc)
        user = None

    if user is not None:
        # Block login for pharmacies that are not verified by admin
        try:
            if user.user_type == 'pharmacy':
                # Access pharmacy_profile safely and reject if not verified
                if hasattr(user, 'pharmacy_profile') and not user.pharmacy_profile.is_verified:
                    return Response({'detail': 'Account pending approval. Please contact an administrator.'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            # If any error accessing profile, continue authentication flow
            pass

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Return user data and token
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'name': getattr(user, 'name', ''),
                'phone': getattr(user, 'phone', ''),
            }
        }, status=status.HTTP_200_OK)

    return Response(
        {'detail': 'Incorrect email or password'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get or update current user info

    Supports PATCH to allow the frontend settings page to persist profile changes
    (name, phone, address, email). For patient users the Patient profile is updated;
    for pharmacy users the Pharmacy profile is updated. The endpoint returns the
    serialized, up-to-date user data.
    """
    user = request.user

    if request.method == 'PATCH':
        data = request.data or {}
        # Allow updating email on the base user model
        email = data.get('email')
        if email:
            user.email = email
            try:
                user.save()
            except Exception:
                # ignore errors saving email to avoid blocking profile updates
                pass

        # Update profile fields depending on user type
        try:
            if getattr(user, 'user_type', '') == 'patient' and hasattr(user, 'patient_profile'):
                profile = user.patient_profile
                profile.name = data.get('name', profile.name)
                profile.phone = data.get('phone', profile.phone)
                profile.save()
            elif getattr(user, 'user_type', '') == 'pharmacy' and hasattr(user, 'pharmacy_profile'):
                profile = user.pharmacy_profile
                profile.name = data.get('name', profile.name)
                profile.phone = data.get('phone', profile.phone)
                profile.address = data.get('address', profile.address)
                # optional latitude/longitude updates
                if 'latitude' in data:
                    try:
                        profile.latitude = float(data.get('latitude') or profile.latitude)
                    except Exception:
                        pass
                if 'longitude' in data:
                    try:
                        profile.longitude = float(data.get('longitude') or profile.longitude)
                    except Exception:
                        pass
                profile.save()
        except Exception:
            # keep silent on profile save errors but continue to return current state
            pass

        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Default: GET
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def pending_pharmacies(request):
    """List pharmacy users awaiting approval"""
    # Find pharmacy users whose pharmacy_profile.is_verified is False
    qs = User.objects.filter(user_type='pharmacy')
    pending = []
    for u in qs:
        try:
            profile = u.pharmacy_profile
        except Exception:
            profile = None
        if profile and not profile.is_verified:
            pending.append({
                'id': u.id,
                'email': u.email,
                'name': getattr(profile, 'name', getattr(u, 'name', '')),
                'phone': getattr(profile, 'phone', getattr(u, 'phone', '')),
                'address': getattr(profile, 'address', ''),
            })
    return Response(pending)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_approve_pharmacy(request, user_id):
    """Approve a pharmacy registration"""
    user = get_object_or_404(User, pk=user_id, user_type='pharmacy')
    try:
        profile = user.pharmacy_profile
        profile.is_verified = True
        profile.save()
        # Do NOT modify user.is_active or user.is_staff here; approval is based
        # solely on the pharmacy profile's verified flag.
        return Response({'detail': 'Pharmacy approved'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Pharmacy profile not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reject_pharmacy(request, user_id):
    """Reject a pharmacy registration (deactivate user)"""
    user = get_object_or_404(User, pk=user_id, user_type='pharmacy')
    try:
        profile = user.pharmacy_profile
        profile.is_verified = False
        profile.save()
        # Do NOT flip user.is_active here; we will rely on profile.is_verified to
        # indicate approval state. Admins can still deactivate accounts via the
        # user model if they want to block access entirely.
    return Response({'detail': 'Pharmacy rejected'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Pharmacy profile not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_superuser_via_secret(request):
    """Create a Django superuser via a one-time secret stored in the environment.

    Usage: set environment variable ADMIN_CREATION_SECRET on the deployed host to a strong value.
    Then POST to this endpoint with header X-ADMIN-SECRET set to that value and JSON body:
      { "email": "divinebirasaishimwe.com", "username": "divine", "password": "123457890" }

    If password is omitted, a random strong password is generated and returned in the response.
    IMPORTANT: remove this endpoint or unset ADMIN_CREATION_SECRET after use.
    """
    secret_env = os.environ.get('ADMIN_CREATION_SECRET')
    header_secret = request.headers.get('X-ADMIN-SECRET')

    if not secret_env:
        return Response({'detail': 'Admin creation is not enabled on this instance'}, status=status.HTTP_403_FORBIDDEN)

    if not header_secret or header_secret != secret_env:
        return Response({'detail': 'Invalid or missing admin creation secret'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data or {}
    email = data.get('email')
    username = data.get('username') or (email.split('@')[0] if email else None)
    password = data.get('password')

    if not email:
        return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)

    UserModel = get_user_model()
    if UserModel.objects.filter(email__iexact=email).exists():
        return Response({'detail': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if not password:
        # generate a strong temporary password
        password = secrets.token_urlsafe(16)

    try:
        # Use create_superuser if available
        try:
            user = UserModel.objects.create_superuser(username=username, email=email, password=password)
        except TypeError:
            # fallback if create_superuser signature differs
            user = UserModel.objects.create_user(username=username, email=email, password=password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
    except Exception as e:
        return Response({'detail': 'Failed to create superuser', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Superuser created', 'email': email, 'username': username, 'password': password})