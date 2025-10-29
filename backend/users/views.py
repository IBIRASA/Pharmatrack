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

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {'message': 'User created successfully'},
            status=status.HTTP_201_CREATED
        )
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
    
    # Authenticate user
    user = authenticate(request, username=email, password=password)
    
    if user is not None:
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
        {'detail': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user info"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)