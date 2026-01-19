from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.employees.models import Empleado
# Obtiene tu modelo 'Usuario' dinámicamente
User = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'rol', 'empresa']
        # La contraseña solo se escribe, nunca se devuelve en la respuesta
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Usamos create_user para que la contraseña se guarde encriptada (hash)
        user = User.objects.create_user(**validated_data)
        return user

class EmpleadoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['id', 'nombres', 'apellidos', 'foto_url', 'puesto']

class UserProfileSerializer(serializers.ModelSerializer):
    empleado_datos = EmpleadoSimpleSerializer(source='empleado_perfil', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'primer_nombre', 'primer_apellido', 'segundo_apellido', 
                  'telefono', 'rol', 'empleado_datos', 'empresa', 'primer_login_completado']


class CompletarPerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para que el usuario complete su perfil en el primer login
    """
    class Meta:
        model = User
        fields = ['primer_nombre', 'primer_apellido', 'segundo_apellido', 'telefono']
        extra_kwargs = {
            'primer_nombre': {'required': True},
            'primer_apellido': {'required': True},
            'segundo_apellido': {'required': False},
            'telefono': {'required': False},
        }

    def validate_primer_nombre(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres")
        return value

    def validate_primer_apellido(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El apellido debe tener al menos 2 caracteres")
        return value

    def validate_telefono(self, value):
        if value and len(value.strip()) < 9:
            raise serializers.ValidationError("El teléfono debe tener al menos 9 dígitos")
        return value
