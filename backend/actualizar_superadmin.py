"""
Script para actualizar el usuario SuperAdmin
Marca primer_login_completado = True
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Usuario

# Actualizar todos los usuarios SUPERADMIN
usuarios_superadmin = Usuario.objects.filter(rol='SUPERADMIN')

for user in usuarios_superadmin:
    user.primer_login_completado = True
    user.save()
    print(f'✅ Usuario {user.email} actualizado - primer_login_completado = True')

if not usuarios_superadmin.exists():
    print('⚠️  No se encontró ningún usuario SUPERADMIN')
else:
    print(f'\n🎉 {usuarios_superadmin.count()} usuario(s) SUPERADMIN actualizados')
