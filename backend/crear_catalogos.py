"""
Script para crear catálogos iniciales (Países y Monedas)
Ejecutar con: python manage.py shell < crear_catalogos.py
"""
from apps.core.models import CatalogoGlobal

# Limpiar catálogos existentes
CatalogoGlobal.objects.all().delete()

# ============================
# PAÍSES (Latinoamérica)
# ============================
paises = [
    ('EC', 'Ecuador'),
    ('PE', 'Perú'),
    ('CO', 'Colombia'),
    ('MX', 'México'),
    ('BR', 'Brasil'),
    ('AR', 'Argentina'),
    ('CL', 'Chile'),
    ('BO', 'Bolivia'),
    ('PY', 'Paraguay'),
    ('UY', 'Uruguay'),
    ('VE', 'Venezuela'),
    ('PA', 'Panamá'),
    ('CR', 'Costa Rica'),
    ('GT', 'Guatemala'),
    ('SV', 'El Salvador'),
    ('HN', 'Honduras'),
    ('NI', 'Nicaragua'),
    ('DO', 'República Dominicana'),
    ('CU', 'Cuba'),
    ('US', 'Estados Unidos'),
    ('ES', 'España'),
]

for codigo, nombre in paises:
    CatalogoGlobal.objects.create(
        tipo='PAIS',
        codigo=codigo,
        nombre=nombre,
        activo=True
    )
    print(f"✅ País creado: {nombre} ({codigo})")

print("\n" + "="*50 + "\n")

# ============================
# MONEDAS
# ============================
monedas = [
    ('USD', 'Dólar Americano'),
    ('EUR', 'Euro'),
    ('MXN', 'Peso Mexicano'),
    ('BRL', 'Real Brasileño'),
    ('ARS', 'Peso Argentino'),
    ('CLP', 'Peso Chileno'),
    ('COP', 'Peso Colombiano'),
    ('PEN', 'Sol Peruano'),
    ('PYG', 'Guaraní Paraguayo'),
    ('UYU', 'Peso Uruguayo'),
    ('BOB', 'Boliviano'),
    ('VES', 'Bolívar Venezolano'),
    ('PAB', 'Balboa Panameño'),
    ('CRC', 'Colón Costarricense'),
    ('GTQ', 'Quetzal Guatemalteco'),
    ('SVC', 'Colón Salvadoreño'),
    ('HNL', 'Lempira Hondureño'),
    ('NIO', 'Córdoba Nicaragüeño'),
    ('DOP', 'Peso Dominicano'),
    ('CUP', 'Peso Cubano'),
]

for codigo, nombre in monedas:
    CatalogoGlobal.objects.create(
        tipo='MONEDA',
        codigo=codigo,
        nombre=nombre,
        activo=True
    )
    print(f"✅ Moneda creada: {nombre} ({codigo})")

print("\n✅ ¡Catálogos creados exitosamente!")
print(f"\n📊 Totales:")
print(f"   Países: {CatalogoGlobal.objects.filter(tipo='PAIS').count()}")
print(f"   Monedas: {CatalogoGlobal.objects.filter(tipo='MONEDA').count()}")
