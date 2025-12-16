from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Empleado
from django.db import transaction
from core.serializers import PuestoSerializer, UnidadSerializer
User = get_user_model()

class NuevoEmpleadoSerializer(serializers.ModelSerializer):
    # Campos extra que no están en el modelo Empleado, sino en User
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=['ADMIN', 'RRHH', 'MANAGER', 'EMPLEADO'],
                                  write_only=True)

    class Meta:
        model = Empleado
        fields = [
            'nombres', 'apellidos', 'documento', 'fecha_ingreso',
            'puesto', 'unidad', 'manager', # Datos laborales
            'email', 'password', 'rol'     # Datos de acceso
        ]

    def create(self, validated_data):
        # Separamos los datos del Usuario y del Empleado
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        rol = validated_data.pop('rol')
        
        # Usamos transaction.atomic para asegurar que se crean los dos o ninguno
        with transaction.atomic():
            # 1. Crear Usuario
            user = User.objects.create_user(email=email, password=password, rol=rol)
            
            # 2. Asignar empresa (la del admin que crea el registro)
            # Nota: Esto se pasará desde la vista, aquí asumimos que ya viene en el contexto o lo forzamos
            request = self.context.get('request')
            admin_empleado = Empleado.objects.get(email=request.user.email)
            user.empresa = admin_empleado.empresa
            user.save()

            # 3. Crear Empleado
            empleado = Empleado.objects.create(
                empresa=admin_empleado.empresa,
                email=email, # Vinculamos por email
                **validated_data
            )

            # 4. Vincular perfil inverso
            user.empleado_perfil = empleado
            user.save()

            return empleado
        

class ListEmpleadoSerializer(serializers.ModelSerializer):
    # Al declarar estos campos con sus serializadores, Django anida el objeto completo
    puesto = PuestoSerializer(read_only=True)
    unidad = UnidadSerializer(read_only=True)

    class Meta:
        model = Empleado
        fields = [
            'id', 
            'nombres', 
            'apellidos', 
            'email', 
            'documento', 
            'fecha_ingreso', 
            'puesto',  # Ahora devolverá {id: 1, nombre: "Dev"}
            'unidad',  # Ahora devolverá {id: 1, nombre: "IT"}
            'foto_url' # Si tienes este campo
        ]

        
# Serializer para ACTUALIZAR datos (sin tocar usuario/password)
class UpdateEmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = [
            'nombres', 'apellidos', 'documento', 
            'puesto', 'unidad', 'manager', 
            'fecha_ingreso'
        ]