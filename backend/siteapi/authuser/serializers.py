
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        error_messages={
            "invalid": "Wprowadź poprawny adres e-mail.",
        }
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'date_of_birth', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ten adres e-mail jest już zajęty.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            date_of_birth=validated_data['date_of_birth']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
