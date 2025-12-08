import os
import django
import random
from datetime import datetime, timedelta, time
from django.utils import timezone

# 1. Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# 2. Importar modelos y librerías
from faker import Faker
from django.contrib.auth import get_user_model
from core.models import Empresa, UnidadOrganizacional, Puesto
from employees.models import Empleado
from attendance.models import EventoAsistencia

# Configurar Faker en español
fake = Faker(['es_ES'])
User = get_user_model()

def run():
    print("🚀 Iniciando script de población de datos...")

    # --- LIMPIEZA (Opcional: borra datos anteriores para no duplicar) ---
    print("🧹 Limpiando base de datos antigua...")
    EventoAsistencia.objects.all().delete()
    Empleado.objects.all().delete()
    User.objects.exclude(is_superuser=True).delete() # No borramos al superadmin
    Empresa.objects.all().delete()

    # --- 1. CREAR EMPRESA Y ESTRUCTURA ---
    print("🏢 Creando Empresa y Unidades...")
    empresa = Empresa.objects.create(
        razon_social="Tech Solutions S.A.",
        nombre_comercial="TechSol",
        ruc_nit="1799999999001",
        pais="Ecuador",
        moneda="USD"
    )

    unidad_dev = UnidadOrganizacional.objects.create(
        empresa=empresa, nombre="Desarrollo", tipo="AREA"
    )
    
    puesto_dev = Puesto.objects.create(
        empresa=empresa, nombre="Desarrollador Fullstack", unidad=unidad_dev
    )

    # --- 2. CREAR MANAGER (Jefe) ---
    print("👔 Creando Manager...")
    # Crear Usuario Auth
    user_manager = User.objects.create_user(
        email="manager@techsol.com",
        password="password123",
        rol="MANAGER",
        empresa=empresa
    )
    
    # Crear Perfil Empleado Manager
    empleado_manager = Empleado.objects.create(
        empresa=empresa,
        nombres="Carlos",
        apellidos="Andrade",
        documento=fake.unique.ssn(),
        email=user_manager.email,
        fecha_ingreso=timezone.now().date(),
        puesto=puesto_dev,
        unidad=unidad_dev
    )
    
    # Vincular usuario con empleado
    user_manager.empleado_perfil = empleado_manager
    user_manager.save()

    # --- 3. CREAR EMPLEADOS (Subordinados) ---
    print("👷 Creando Empleados...")
    empleados_list = []
    
    for i in range(5): # Creamos 5 empleados
        email_fake = fake.unique.email()
        
        # Usuario
        user = User.objects.create_user(
            email=email_fake,
            password="password123",
            rol="EMPLEADO",
            empresa=empresa
        )

        # Empleado
        empleado = Empleado.objects.create(
            empresa=empresa,
            nombres=fake.first_name(),
            apellidos=fake.last_name(),
            documento=fake.unique.ssn(),
            email=email_fake,
            fecha_ingreso=timezone.now().date(),
            puesto=puesto_dev,
            unidad=unidad_dev,
            manager=empleado_manager # Asignados al manager creado arriba
        )
        
        user.empleado_perfil = empleado
        user.save()
        empleados_list.append(empleado)

    # --- 4. GENERAR ASISTENCIA (Últimos 7 días) ---
    print("📅 Generando historial de asistencia...")
    
    # Coordenadas base (ej. Quito)
    LAT_BASE = -0.180653
    LNG_BASE = -78.467834

    hoy = timezone.now().date()
    
    # Para cada empleado
    todos_los_empleados = empleados_list + [empleado_manager]
    
    for emp in todos_los_empleados:
        # Iterar últimos 7 días
        for dia_delta in range(7):
            fecha = hoy - timedelta(days=dia_delta)
            
            # Saltar fines de semana (Sábado=5, Domingo=6)
            if fecha.weekday() >= 5:
                continue

            # --- CHECK IN (Aleatorio entre 08:50 y 09:15) ---
            hora_entrada = time(8, 50) 
            minutos_random = random.randint(0, 25)
            dt_entrada = datetime.combine(fecha, hora_entrada) + timedelta(minutes=minutos_random)
            # Convertir a timezone aware
            dt_entrada_aware = timezone.make_aware(dt_entrada)

            EventoAsistencia.objects.create(
                empresa=empresa,
                empleado=emp,
                tipo='CHECK_IN',
                registrado_el=dt_entrada_aware, # Fecha real BD
                fecha_hora_dispositivo=dt_entrada_aware, # Fecha celular
                fuente='APP',
                gps_lat=LAT_BASE + random.uniform(-0.001, 0.001), # Variación pequeña GPS
                gps_lng=LNG_BASE + random.uniform(-0.001, 0.001),
                dentro_geocerca=True
            )

            # --- CHECK OUT (Aleatorio entre 17:55 y 18:30) ---
            hora_salida = time(17, 55)
            minutos_random = random.randint(0, 35)
            dt_salida = datetime.combine(fecha, hora_salida) + timedelta(minutes=minutos_random)
            dt_salida_aware = timezone.make_aware(dt_salida)

            EventoAsistencia.objects.create(
                empresa=empresa,
                empleado=emp,
                tipo='CHECK_OUT',
                registrado_el=dt_salida_aware,
                fecha_hora_dispositivo=dt_salida_aware,
                fuente='APP',
                gps_lat=LAT_BASE + random.uniform(-0.001, 0.001),
                gps_lng=LNG_BASE + random.uniform(-0.001, 0.001),
                dentro_geocerca=True
            )

    print(f"✅ ¡Datos creados exitosamente!")
    print(f"   Manager Login: manager@techsol.com / password123")
    print(f"   Empleados creados: {len(empleados_list)}")

if __name__ == '__main__':
    run()