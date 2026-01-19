import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
from django.utils.translation import gettext_lazy as _

# Definición de Roles según el PDF (Pág 2, Roles y Permisos)
class UserRole(models.TextChoices):
    SUPERADMIN = 'SUPERADMIN', 'Super Admin'
    RRHH = 'RRHH', 'Admin RRHH'
    MANAGER = 'MANAGER', 'Manager'
    EMPLEADO = 'EMPLEADO', 'Empleado'
    AUDITOR = 'AUDITOR', 'Auditor'

class Usuario(AbstractUser):
    username = None # Eliminamos el username por defecto
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Login con Email
    email = models.EmailField(_('email address'), unique=True)
    
    # Relación Multiempresa (Opcional para SuperAdmin, obligatorio para el resto)
    # Usamos string 'core.Empresa' para evitar import circular si core importa users
    empresa = models.ForeignKey(
        'core.Empresa', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='usuarios'
    )
    
    # Roles y Seguridad
    rol = models.CharField(
        max_length=20, 
        choices=UserRole.choices, 
        default=UserRole.EMPLEADO
    )
    mfa_habilitado = models.BooleanField(default=False) # [cite: 328]
    
    # Vinculación con perfil de empleado (Opcional, un auditor externo podría no ser empleado)
    # Usamos 'employees.Empleado' como string lazy reference
    empleado_perfil = models.OneToOneField(
        'employees.Empleado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuario_acceso'
    )

    # ----- NUEVO: Perfil del usuario -----
    primer_nombre = models.CharField(max_length=100, blank=True)
    primer_apellido = models.CharField(max_length=100, blank=True)
    segundo_apellido = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    
    # Flag para controlar si debe completar perfil en primer login
    primer_login_completado = models.BooleanField(default=False)
    fecha_primer_login = models.DateTimeField(null=True, blank=True)

    # Configuración del Manager
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # Email y Password son requeridos por defecto

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.get_rol_display()})"
