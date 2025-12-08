from rest_framework import serializers
from django.contrib.auth import get_user_model
from employees.models import Empleado
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
        fields = ['id', 'email', 'rol', 'empleado_datos', 'empresa']