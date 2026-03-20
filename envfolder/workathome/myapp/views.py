from urllib import request

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book, register
from .serializers import BookSerializer, LoginSerializer, RegisterSerializer
from django.contrib.auth import authenticate
from rest_framework import status

@api_view(['GET'])
def Home(request):
    books = Book.objects.all()
    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)

@api_view(['POST', 'GET'])
def create_book(request):
    if request.method == 'GET':
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST','GET'])
def register_user(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'GET':
        users = register.objects.all()
        serializer = RegisterSerializer(users, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    try:
        user = register.objects.get(email__iexact=email)  # ✅ FIX
    except register.DoesNotExist:
        return Response({"error": "User not found"}, status=400)

    if user.password != password:
        return Response({"error": "Incorrect password"}, status=400)

    return Response({
        "message": "Login successful!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }, status=200)
    
@api_view(['GET'])
def all_users(request):
    users = register.objects.all()
    serializer = RegisterSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is not None and user.is_staff:
        return Response({"message": "Admin login successful"}, status=status.HTTP_200_OK)

    return Response({"error": "Invalid admin credentials"}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def admin_dashboard(request):
    users = register.objects.all()
    serializer = RegisterSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_user(request, id):
    try:
        user = register.objects.get(id=id)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
    except register.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_user(request, id):
    try:
        user = register.objects.get(id=id)
    except register.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = RegisterSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def all_bookings(request):
    bookings = Book.objects.all()
    print(bookings)
    serializer = BookSerializer(bookings, many=True)
    return Response(serializer.data)