from django.db import models
from core.models import Empresa
from employees.models import Empleado

# 1. KPI (Catálogo) [cite: 296]
class Kpi(models.Model):
    # Enumerados sugeridos en el PDF [cite: 384]
    UNIDADES = (('%', '%'), ('PUNTOS', 'Puntos'), ('MINUTOS', 'Minutos'), ('HORAS', 'Horas'))
    ORIGEN = (('ASISTENCIA', 'Asistencia'), ('EVALUACION', 'Evaluación'), ('MIXTO', 'Mixto'))

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE) 
    codigo = models.CharField(max_length=50)  
    nombre = models.CharField(max_length=150)  
    descripcion = models.TextField(blank=True) 
    unidad = models.CharField(max_length=20, choices=UNIDADES)
    origen_datos = models.CharField(max_length=20, choices=ORIGEN)
    
    # "Texto largo/JSON, opcional si se calcula desde asistencia" 
    formula = models.TextField(blank=True, null=True) 

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

# 2. PlantillaKPI (Por puesto o área) 
class PlantillaKpi(models.Model):
    APLICA_A = (('PUESTO', 'Puesto'), ('UNIDAD', 'Unidad'), ('EMPLEADO', 'Empleado')) 

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE) 
    nombre = models.CharField(max_length=150) 
    aplica_a = models.CharField(max_length=20, choices=APLICA_A) 
    
    # "JSON: lista de {kpi_id, meta, umbral_rojo, umbral_amarillo}" 
    objetivos = models.JSONField(default=list) 

    def __str__(self):
        return self.nombre

# 3. AsignacionKPI 
class AsignacionKpi(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE) 
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE) 
    plantilla_kpi = models.ForeignKey(PlantillaKpi, on_delete=models.CASCADE) 
    
    desde = models.DateField() 
    hasta = models.DateField(null=True, blank=True) 
    ajustes_personalizados = models.JSONField(blank=True, null=True) 

# 4. ResultadoKPI (Período) 
class ResultadoKpi(models.Model):
    CLASIFICACION = (('VERDE', 'Verde'), ('AMARILLO', 'Amarillo'), ('ROJO', 'Rojo')) 

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE) 
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE) 
    kpi = models.ForeignKey(Kpi, on_delete=models.CASCADE) 
    
    periodo = models.CharField(max_length=20) 
    valor = models.DecimalField(max_digits=10, decimal_places=2) 
    cumplimiento_pct = models.DecimalField(max_digits=5, decimal_places=2) 
    clasificacion = models.CharField(max_length=20, choices=CLASIFICACION) 
    
    calculado_el = models.DateTimeField(auto_now_add=True) 
    fuente = models.CharField(max_length=50) 

# 5. EvaluacionDesempeno 
class EvaluacionDesempeno(models.Model):
    TIPO = (('AUTO', 'Auto'), ('MANAGER', 'Manager'), ('360', '360')) 

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE) 
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='evaluaciones') 
    periodo = models.CharField(max_length=50) 
    tipo = models.CharField(max_length=20, choices=TIPO)
    
    # "JSON: lista de competencias, ítems, ponderaciones" 
    instrumento = models.JSONField(default=dict) 
    
    puntaje_total = models.DecimalField(max_digits=5, decimal_places=2, null=True) 
    comentarios = models.TextField(blank=True) 
    evaluador = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, related_name='evaluaciones_hechas') 
    fecha = models.DateTimeField(auto_now_add=True) 