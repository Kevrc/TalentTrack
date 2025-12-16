import uuid
from django.db import models
from core.models import Empresa
from employees.models import Empleado

# Catálogos de estado [cite: 201]
class EstadoSolicitud(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    APROBADO = 'APROBADO', 'Aprobado'
    RECHAZADO = 'RECHAZADO', 'Rechazado'
    CANCELADO = 'CANCELADO', 'Cancelado'

class TipoAusencia(models.Model):
    """
    Catálogo de tipos de permiso (Vacaciones, Enfermedad, Calamidad).
    [cite: 89-91]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    afecta_sueldo = models.BooleanField(default=False)
    requiere_soporte = models.BooleanField(default=False) # Si requiere adjuntar archivo
    
    def __str__(self):
        return self.nombre

class SolicitudAusencia(models.Model):
    """
    La petición que hace el empleado.
    [cite: 100-106]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='solicitudes')
    tipo_ausencia = models.ForeignKey(TipoAusencia, on_delete=models.PROTECT)
    
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias_solicitados = models.PositiveIntegerField(default=1) # Calculado
    
    motivo = models.TextField()
    estado = models.CharField(
        max_length=20, 
        choices=EstadoSolicitud.choices, 
        default=EstadoSolicitud.PENDIENTE
    )
    
    # Archivo opcional (Certificado médico, etc.)
    adjunto_url = models.FileField(upload_to='ausencias_soportes/', null=True, blank=True)
    
    creada_el = models.DateTimeField(auto_now_add=True)
    
    # Auditoría de aprobación (simplificado para MVP)
    aprobado_por = models.ForeignKey(
        Empleado, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='solicitudes_aprobadas'
    )
    fecha_resolucion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.empleado.nombres} - {self.tipo_ausencia.nombre} ({self.estado})"

class SaldoVacaciones(models.Model):
    """
    Control de días disponibles por año.
    [cite: 110-112]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='saldos_vacaciones')
    
    periodo = models.CharField(max_length=4, help_text="Ej: 2025")
    dias_asignados = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    dias_tomados = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    @property
    def dias_disponibles(self):
        return self.dias_asignados - self.dias_tomados

    class Meta:
        unique_together = ('empleado', 'periodo')