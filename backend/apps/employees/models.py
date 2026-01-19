import uuid
from django.db import models
from apps.core.models import Empresa, UnidadOrganizacional, Puesto

# --- ENUMERADOS ---
# Según catálogo sugerido en el PDF (Sección 9) [cite: 378, 379]
class EstadoEmpleado(models.TextChoices):
    ACTIVO = 'ACTIVO', 'Activo'
    SUSPENDIDO = 'SUSPENDIDO', 'Suspendido'
    BAJA = 'BAJA', 'Baja'

class TipoContrato(models.TextChoices):
    INDEFINIDO = 'INDEFINIDO', 'Indefinido'
    PLAZO_FIJO = 'PLAZO', 'Plazo Fijo'
    TEMPORAL = 'TEMPORAL', 'Temporal / Eventual'
    PRACTICANTE = 'PRACTICANTE', 'Practicante / Pasante'

class TipoDocumento(models.TextChoices):
    CONTRATO = 'CONTRATO', 'Contrato Firmado'
    ANEXO = 'ANEXO', 'Anexo / Adenda'
    CERTIFICADO = 'CERTIFICADO', 'Certificado Médico/Estudios'
    OTRO = 'OTRO', 'Otro Documento'

# --- MODELOS ---

class Empleado(models.Model):
    """
    Entidad central del sistema de RRHH.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='empleados')
    
    # Datos Personales [cite: 218, 219]
    nombres = models.CharField(max_length=150)
    apellidos = models.CharField(max_length=150)
    documento = models.CharField(max_length=20, help_text="Cédula, DNI o Pasaporte", db_index=True)
    
    email = models.EmailField(unique=True, help_text="Correo corporativo o personal principal")
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    
    fecha_nacimiento = models.DateField(null=True, blank=True)
    fecha_ingreso = models.DateField(help_text="Fecha de inicio de labores")
    
    # Relaciones Organizacionales [cite: 221]
    unidad = models.ForeignKey(
        UnidadOrganizacional, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='empleados_unidad'
    )
    puesto = models.ForeignKey(
        Puesto, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='empleados_puesto'
    )
    # Relación recursiva para el Jefe Inmediato (Manager)
    manager = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='subordinados'
    )
    
    foto_url = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    estado = models.CharField(
        max_length=20, 
        choices=EstadoEmpleado.choices, 
        default=EstadoEmpleado.ACTIVO
    )

    class Meta:
        ordering = ['apellidos', 'nombres']
        # Constraint: No repetir documento dentro de la misma empresa (Multitenancy seguro)
        unique_together = ('empresa', 'documento')

    def __str__(self):
        return f"{self.apellidos} {self.nombres}"


class Contrato(models.Model):
    """
    Historial contractual del empleado.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='contratos')
    
    tipo = models.CharField(max_length=20, choices=TipoContrato.choices) # [cite: 224]
    
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    
    salario_base = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # [cite: 226]
    jornada_semanal_horas = models.PositiveIntegerField(default=40)
    
    # Referencia Lazy a 'attendance.Turno' para evitar importación circular
    # (El modulo employees necesita attendance, y attendance necesita employees)
    turno_base = models.ForeignKey(
        'attendance.Turno', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='contratos_asociados'
    )
    
    estado = models.BooleanField(default=True, help_text="Contrato vigente")

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.empleado.apellidos}"


class DocumentoEmpleado(models.Model):
    """
    Carpeta digital del empleado (Expediente). [cite: 228]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='documentos')
    
    tipo = models.CharField(max_length=20, choices=TipoDocumento.choices)
    archivo_url = models.FileField(upload_to='expedientes_empleados/')
    observaciones = models.TextField(null=True, blank=True)
    
    cargado_el = models.DateTimeField(auto_now_add=True)
    vigente = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tipo} - {self.empleado.apellidos}"