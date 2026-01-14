import uuid
from django.db import models
from core.models import Empresa
from employees.models import Empleado  # Asegúrate de haber creado este archivo según el paso anterior

# --- ENUMERADOS (Catálogos útiles del PDF) ---
class TipoEvento(models.TextChoices):
    CHECK_IN = 'CHECK_IN', 'Entrada'
    CHECK_OUT = 'CHECK_OUT', 'Salida'
    PAUSA_IN = 'PAUSA_IN', 'Inicio Pausa'
    PAUSA_OUT = 'PAUSA_OUT', 'Fin Pausa'

class FuenteMarcacion(models.TextChoices):
    APP = 'APP', 'Aplicación Móvil'
    WEB = 'WEB', 'Plataforma Web'
    LECTOR = 'LECTOR', 'Lector Biométrico/Físico'

class TipoGeocerca(models.TextChoices):
    CIRCULO = 'CIRCULO', 'Circular (Radio)'
    POLIGONO = 'POLIGONO', 'Polígono'

class EstadoJornada(models.TextChoices):
    COMPLETO = 'COMPLETO', 'Completo'
    INCOMPLETO = 'INCOMPLETO', 'Incompleto'
    SIN_REGISTROS = 'SIN_REGISTROS', 'Sin Registros'
    AUSENTE = 'AUSENTE', 'Ausente'

# --- MODELOS DE CONFIGURACIÓN ---

class Turno(models.Model):
    """
    Define los horarios teóricos (Plantilla).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='turnos')
    nombre = models.CharField(max_length=100)
    
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    
    # Almacena lista de enteros [1, 2, 3, 4, 5] para Lun-Vie
    dias_semana = models.JSONField(default=list, help_text="Lista de días: 1=Lunes, 7=Domingo")
    
    tolerancia_minutos = models.PositiveIntegerField(default=5)
    requiere_gps = models.BooleanField(default=True)
    requiere_foto = models.BooleanField(default=False)
    
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.hora_inicio} - {self.hora_fin})"

class AsignacionTurno(models.Model):
    """
    Vincula un empleado con un turno en un periodo de tiempo.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='asignaciones_turno')
    turno = models.ForeignKey(Turno, on_delete=models.CASCADE)
    
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    es_rotativo = models.BooleanField(default=False)

    class Meta:
        # Un empleado no debería tener dos turnos activos al mismo tiempo (regla de negocio sugerida)
        unique_together = ('empleado', 'fecha_inicio') 

class Geocerca(models.Model):
    """
    Zonas permitidas para marcar asistencia.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='geocercas')
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TipoGeocerca.choices, default=TipoGeocerca.CIRCULO)
    
    # Almacena { "lat": -4.00, "lng": -79.00, "radio": 50 } o lista de puntos
    coordenadas = models.JSONField()
    
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

# --- MODELOS TRANSACCIONALES (CORE MVP) ---

class EventoAsistencia(models.Model):
    """
    Registro individual de marcación (Check-in/Check-out).
    Tabla de alto volumen.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, db_index=True) # Index para multi-tenancy
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='marcaciones', db_index=True)
    
    tipo = models.CharField(max_length=20, choices=TipoEvento.choices)
    registrado_el = models.DateTimeField(auto_now_add=True, db_index=True) # Fecha real del servidor
    fecha_hora_dispositivo = models.DateTimeField(help_text="Hora enviada por el celular/web")
    
    fuente = models.CharField(max_length=20, choices=FuenteMarcacion.choices, default=FuenteMarcacion.APP)
    
    # Datos Geoespaciales
    gps_lat = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True) # Precisión GPS
    gps_lng = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    dentro_geocerca = models.BooleanField(default=False) # Calculado al recibir el evento
    
    foto_url = models.ImageField(upload_to='asistencia_evidence/', null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    observacion = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-registrado_el']
        indexes = [
            models.Index(fields=['empresa', 'registrado_el']), # Optimización para reportes
        ]

    def __str__(self):
        return f"{self.empleado.apellidos} - {self.tipo} ({self.registrado_el})"

class JornadaCalculada(models.Model):
    """
    Resumen diario procesado. Esto evita recalcular todo cada vez que se abre el dashboard.
    Se llena mediante tareas programadas o señales.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='jornadas')
    fecha = models.DateField(db_index=True)
    
    hora_primera_entrada = models.DateTimeField(null=True, blank=True)
    hora_ultima_salida = models.DateTimeField(null=True, blank=True)
    
    # Cálculos en minutos para facilitar KPIs numéricos
    minutos_trabajados = models.IntegerField(default=0)
    minutos_tardanza = models.IntegerField(default=0)
    minutos_extra = models.IntegerField(default=0)
    
    estado = models.CharField(
        max_length=20, 
        choices=EstadoJornada.choices, 
        default=EstadoJornada.SIN_REGISTROS
    )

    class Meta:
        unique_together = ('empleado', 'fecha') # Solo un registro de jornada por día por empleado
        ordering = ['-fecha']