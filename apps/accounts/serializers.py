from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.accounts.models import LoginHistory, DeviceTracking

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'tenant', 'email', 'first_name', 'last_name', 'preferred_language', 'is_active', 'is_staff')
        read_only_fields = ('id', 'is_staff')


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'tenant', 'email', 'password', 'first_name', 'last_name', 'preferred_language')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            tenant=validated_data.get('tenant'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            preferred_language=validated_data.get('preferred_language', 'en')
        )
        return user


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = '__all__'


class DeviceTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceTracking
        fields = '__all__'
