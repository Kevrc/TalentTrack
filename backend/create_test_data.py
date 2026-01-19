import os
import sys
import django

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Empresa
from employees.models import Empleado
from leaves.models import TipoAusencia, SolicitudAusencia
from datetime import date, timedelta

Usuario = get_user_model()

# 1. Crear empresa
empresa, _ = Empresa.objects.get_or_create(
    razon_social='Empresa Test S.A.',
    defaults={
        'nombre_comercial': 'Empresa Test',
        'ruc_nit': '123456789',
        'pais': 'Colombia',
        'moneda': 'COP'
    }
)
print(f"✓ Empresa: {empresa.nombre_comercial}")

# 2. Crear usuario manager
user_manager, _ = Usuario.objects.get_or_create(
    email='manager@test.com',
    defaults={
        'first_name': 'Juan',
        'last_name': 'Manager',
        'rol': 'MANAGER',
        'empresa': empresa
    }
)
print(f"✓ Manager User: {user_manager.email}")

# 3. Crear usuario empleado
user_empleado, _ = Usuario.objects.get_or_create(
    email='empleado@test.com',
    defaults={
        'first_name': 'Carlos',
        'last_name': 'Empleado',
        'rol': 'EMPLEADO',
        'empresa': empresa
    }
)
print(f"✓ Empleado User: {user_empleado.email}")

# 3b. Crear usuario RRHH
user_rrhh, _ = Usuario.objects.get_or_create(
    email='rrhh@test.com',
    defaults={
        'first_name': 'Ana',
        'last_name': 'RRHH',
        'rol': 'RRHH',
        'empresa': empresa
    }
)
print(f"✓ RRHH User: {user_rrhh.email}")

# 4. Crear empleado manager
manager_emp, _ = Empleado.objects.get_or_create(
    email='manager@test.com',
    empresa=empresa,
    defaults={
        'nombres': 'Juan',
        'apellidos': 'Manager',
        'documento': '12345',
        'fecha_ingreso': date(2020, 1, 1),
        'estado': 'ACTIVO',
    }
)
print(f"✓ Manager Empleado: {manager_emp.email}")

# Vincular usuario con empleado
user_manager.empleado_perfil = manager_emp
user_manager.save()

# 5. Crear empleado subordinado
empleado, _ = Empleado.objects.get_or_create(
    email='empleado@test.com',
    empresa=empresa,
    defaults={
        'nombres': 'Carlos',
        'apellidos': 'Empleado',
        'documento': '54321',
        'fecha_ingreso': date(2021, 1, 1),
        'estado': 'ACTIVO',
        'manager': manager_emp,
    }
)
print(f"✓ Empleado: {empleado.email} (Manager: {empleado.manager.email})")

# Vincular usuario con empleado
user_empleado.empleado_perfil = empleado
user_empleado.save()

# 6. Crear empleado RRHH
rrhh_emp, _ = Empleado.objects.get_or_create(
    email='rrhh@test.com',
    empresa=empresa,
    defaults={
        'nombres': 'Ana',
        'apellidos': 'RRHH',
        'documento': '99999',
        'fecha_ingreso': date(2020, 6, 1),
        'estado': 'ACTIVO',
    }
)
print(f"✓ RRHH Empleado: {rrhh_emp.email}")

# Vincular usuario con empleado
user_rrhh.empleado_perfil = rrhh_emp
user_rrhh.save()

# 7. Crear tipos de ausencia
tipo_vacaciones, _ = TipoAusencia.objects.get_or_create(
    empresa=empresa,
    nombre='Vacaciones',
    defaults={'afecta_sueldo': False, 'requiere_soporte': False}
)
print(f"✓ Tipo: {tipo_vacaciones.nombre}")

tipo_enfermedad, _ = TipoAusencia.objects.get_or_create(
    empresa=empresa,
    nombre='Enfermedad',
    defaults={'afecta_sueldo': False, 'requiere_soporte': True}
)
print(f"✓ Tipo: {tipo_enfermedad.nombre}")

# 8. Crear solicitudes de prueba
hoy = date.today()

# Solicitud del empleado (PENDIENTE)
sol_pendiente, created = SolicitudAusencia.objects.get_or_create(
    empresa=empresa,
    empleado=empleado,
    tipo_ausencia=tipo_vacaciones,
    fecha_inicio=hoy + timedelta(days=5),
    defaults={
        'fecha_fin': hoy + timedelta(days=10),
        'motivo': 'Vacaciones planeadas',
        'dias_solicitados': 6,
        'estado': 'PENDIENTE',
    }
)
if created:
    print(f"✓ Solicitud PENDIENTE del empleado creada")

# Solicitud del empleado (APROBADO)
sol_aprobado, created = SolicitudAusencia.objects.get_or_create(
    empresa=empresa,
    empleado=empleado,
    tipo_ausencia=tipo_enfermedad,
    fecha_inicio=hoy - timedelta(days=10),
    defaults={
        'fecha_fin': hoy - timedelta(days=8),
        'motivo': 'Enfermedad',
        'dias_solicitados': 3,
        'estado': 'APROBADO',
        'aprobado_por': manager_emp,
    }
)
if created:
    print(f"✓ Solicitud APROBADO del empleado creada")

# Solicitud del manager (PENDIENTE) - Para que RRHH pueda aprobar/rechazar
sol_manager_pendiente, created = SolicitudAusencia.objects.get_or_create(
    empresa=empresa,
    empleado=manager_emp,
    tipo_ausencia=tipo_vacaciones,
    fecha_inicio=hoy + timedelta(days=15),
    defaults={
        'fecha_fin': hoy + timedelta(days=20),
        'motivo': 'Vacaciones del manager',
        'dias_solicitados': 6,
        'estado': 'PENDIENTE',
    }
)
if created:
    print(f"✓ Solicitud PENDIENTE del manager creada")

print("\n✅ Todos los datos de prueba creados correctamente!")
print(f"\nCredenciales de prueba:")
print(f"Manager: manager@test.com / manager123")
print(f"Empleado: empleado@test.com / empleado123")
print(f"RRHH: rrhh@test.com / rrhh123")
print(f"\n📌 Solicitudes totales: {SolicitudAusencia.objects.all().count()}")
