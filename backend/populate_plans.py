import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.plans.models import Plan

# Delete existing plans to avoid duplicates
Plan.objects.all().delete()

# Create default plans
plans_data = [
    {
        'name': 'Básico',
        'price': 49.00,
        'currency': 'USD',
        'max_users': 5,
        'features': ['Gestión de asistencia básica', 'Reportes simples', 'Soporte por email'],
        'status': 'active',
    },
    {
        'name': 'Profesional',
        'price': 149.00,
        'currency': 'USD',
        'max_users': 50,
        'features': ['Gestión avanzada', 'Análisis de desempeño', 'Soporte prioritario', 'Integraciones básicas'],
        'status': 'active',
    },
    {
        'name': 'Empresarial',
        'price': 499.00,
        'currency': 'USD',
        'max_users': 500,
        'features': ['Características ilimitadas', 'Analytics completo', 'Soporte 24/7', 'Integraciones personalizadas', 'SSO'],
        'status': 'active',
    },
]

for plan_data in plans_data:
    plan, created = Plan.objects.get_or_create(
        name=plan_data['name'],
        defaults={
            'price': plan_data['price'],
            'currency': plan_data['currency'],
            'max_users': plan_data['max_users'],
            'features': plan_data['features'],
            'status': plan_data['status'],
        }
    )
    status = 'Created' if created else 'Already exists'
    print(f"{plan.name}: {status}")

print("\nPlans populated successfully!")
