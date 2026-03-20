from rest_framework import serializers
from .models import Book, register

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = register
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(max_length=100)
    class Meta:
        fields = ['email', 'password']