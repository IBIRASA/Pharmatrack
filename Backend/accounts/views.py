from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from .models import User
from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(APIView):
    """
    Handles user registration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Automatically generate token after registration
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                "message": "User registered successfully",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                },
                "token": token.key
            }, status=status.HTTP_201_CREATED)

        # Return validation errors if invalid
        return Response({
            "message": "Registration failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Handles user login and authentication.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            password = serializer.validated_data.get('password')

            # Authenticate user
            user = authenticate(username=username, password=password)

            if user:
                # Get or create authentication token
                token, created = Token.objects.get_or_create(user=user)

                return Response({
                    "message": "Login successful",
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                    "token": token.key
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "message": "Invalid username or password"
                }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "message": "Invalid data provided",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    """
    Returns a list of all registered users.
    This should typically be restricted to admin users.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = RegisterSerializer(users, many=True)
        return Response({
            "count": users.count(),
            "users": serializer.data
        }, status=status.HTTP_200_OK)
