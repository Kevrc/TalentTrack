from rest_framework import serializers
from django.db import transaction
from django.utils.crypto import get_random_string

from .models import Empresa, CatalogoGlobal, UnidadOrganizacional, Puesto, LogAuditoria
from apps.users.models import Usuario, UserRole
from apps.users.email_service import enviar_credenciales_rrhh


# ==========================
# CATÁLOGOS GLOBALES
# ==========================

class CatalogoGlobalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogoGlobal
        fields = '__all__'


# ==========================
# EMPRESA + ADMIN RRHH
# ==========================

class EmpresaSerializer(serializers.ModelSerializer):
    # Campos extra para mostrar info legible
    pais_nombre = serializers.CharField(source='pais.nombre', read_only=True)
    moneda_codigo = serializers.CharField(source='moneda.codigo', read_only=True)

    # Campos para recibir datos completos del admin RRHH desde frontend
    admin_rrhh_email = serializers.EmailField(write_only=True, required=True)
    admin_rrhh_primer_nombre = serializers.CharField(write_only=True, required=True, max_length=50)
    admin_rrhh_primer_apellido = serializers.CharField(write_only=True, required=True, max_length=50)
    admin_rrhh_segundo_apellido = serializers.CharField(write_only=True, required=False, max_length=50, allow_blank=True)
    admin_rrhh_telefono = serializers.CharField(write_only=True, required=False, max_length=20, allow_blank=True)

    class Meta:
        model = Empresa
        fields = ('id', 'razon_social', 'nombre_comercial', 'ruc_nit', 'pais', 'moneda',
                  'direccion', 'telefono', 'email', 'sitio_web', 'latitud', 'longitud', 'logo_url', 'estado',
                  'creada_el', 'pais_nombre', 'moneda_codigo', 
                  'admin_rrhh_email', 'admin_rrhh_primer_nombre', 'admin_rrhh_primer_apellido',
                  'admin_rrhh_segundo_apellido', 'admin_rrhh_telefono', 'admin_rrhh')

    # Agregamos este campo para lectura
    admin_rrhh = serializers.SerializerMethodField()

    def get_admin_rrhh(self, obj):
        """Obtiene el usuario RRHH de la empresa si existe"""
        from apps.users.models import UserRole
        usuario = obj.usuarios.filter(rol=UserRole.RRHH).first()
        if usuario:
            return {
                'email': usuario.email,
                'primer_nombre': usuario.primer_nombre,
                'primer_apellido': usuario.primer_apellido,
                'segundo_apellido': usuario.segundo_apellido,
                'telefono': usuario.telefono
            }
        return None

    @transaction.atomic
    def create(self, validated_data):
        """
        Crea:
        1. Empresa
        2. Usuario Admin RRHH con datos completos
        3. Registra en LogAuditoria
        """
        # DEBUG: Ver qué datos llegaron
        print("=" * 80)
        print("DATOS RECIBIDOS EN CREATE:")
        print(f"validated_data keys: {validated_data.keys()}")
        print(f"validated_data: {validated_data}")
        print("=" * 80)
        
        # Extraer datos del admin RRHH
        admin_rrhh_email = validated_data.pop('admin_rrhh_email')
        admin_rrhh_primer_nombre = validated_data.pop('admin_rrhh_primer_nombre')
        admin_rrhh_primer_apellido = validated_data.pop('admin_rrhh_primer_apellido')
        admin_rrhh_segundo_apellido = validated_data.pop('admin_rrhh_segundo_apellido', '')
        admin_rrhh_telefono = validated_data.pop('admin_rrhh_telefono', '')

        # 1️⃣ Crear Empresa
        empresa = Empresa.objects.create(**validated_data)

        # 2️⃣ Generar contraseña temporal
        password_temporal = get_random_string(length=10)

        # 3️⃣ Crear Usuario RRHH con datos completos
        usuario_rrhh = Usuario.objects.create_user(
            email=admin_rrhh_email,
            password=password_temporal,
            empresa=empresa,
            rol=UserRole.RRHH,
            primer_nombre=admin_rrhh_primer_nombre,
            primer_apellido=admin_rrhh_primer_apellido,
            segundo_apellido=admin_rrhh_segundo_apellido,
            telefono=admin_rrhh_telefono,
            primer_login_completado=True  # Ya tiene todos los datos, no necesita completar perfil
        )

        # 4️⃣ Registrar en Auditoría
        usuario_superadmin = self.context['request'].user
        LogAuditoria.objects.create(
            usuario=usuario_superadmin,
            accion='CREAR_EMPRESA_CON_RRHH',
            entidad='Empresa',
            entidad_id=empresa.id,
            detalles={
                'empresa_id': str(empresa.id),
                'nombre_comercial': empresa.nombre_comercial,
                'razon_social': empresa.razon_social,
                'ruc_nit': empresa.ruc_nit,
                'pais_id': str(empresa.pais.id) if empresa.pais else None,
                'moneda_id': str(empresa.moneda.id) if empresa.moneda else None,
                'email_rrhh': usuario_rrhh.email,
                'rol_rrhh': 'RRHH',
                'estado': empresa.estado
            }
        )

        # 5️⃣ Enviar email con credenciales
        enviar_credenciales_rrhh(
            usuario_email=usuario_rrhh.email,
            contraseña_temporal=password_temporal,
            nombre_empresa=empresa.nombre_comercial
        )

        # (Log para demostración)
        print(
            f"[SUPERADMIN] Empresa '{empresa.nombre_comercial}' creada "
            f"con Admin RRHH ({admin_rrhh_email}) | Password temporal: {password_temporal}"
        )

        return empresa

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Actualiza la empresa.
        No permite cambiar datos del admin RRHH (ese dato es de solo lectura en edición).
        """
        # Ignorar datos del RRHH si vienen (no se pueden editar desde aquí)
        validated_data.pop('admin_rrhh_email', None)
        validated_data.pop('admin_rrhh_primer_nombre', None)
        validated_data.pop('admin_rrhh_primer_apellido', None)
        validated_data.pop('admin_rrhh_segundo_apellido', None)
        validated_data.pop('admin_rrhh_telefono', None)

        # Actualizar campos de la empresa
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


# ==========================
# UNIDADES
# ==========================

class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadOrganizacional
        fields = '__all__'


# ==========================
# PUESTOS
# ==========================

class PuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = '__all__'

# ==========================
# AUDITORÍA
# ==========================

class LogAuditoriaSerializer(serializers.ModelSerializer):
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    usuario_rol = serializers.CharField(source='usuario.get_rol_display', read_only=True)
    
    class Meta:
        model = LogAuditoria
        fields = [
            'id',
            'usuario',
            'usuario_email',
            'usuario_rol',
            'accion',
            'entidad',
            'entidad_id',
            'detalles',
            'fecha'
        ]
        read_only_fields = ['id', 'usuario', 'usuario_email', 'usuario_rol', 'accion', 'entidad', 'entidad_id', 'detalles', 'fecha']