from django.db import models
from django.conf import settings

class Tarea(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    color = models.CharField(max_length=7, default='#2563eb')

    asignado_a = models.ForeignKey(
        'employees.Empleado', 
        on_delete=models.CASCADE, 
        related_name='tareas_asignadas'
    )
    
    # El que crea la tarea sí suele ser el User logueado (el jefe)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='tareas_creadas'
    )