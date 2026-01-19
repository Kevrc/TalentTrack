from rest_framework import serializers
from .models import EventoAsistencia, TipoEvento, FuenteMarcacion, Empleado

# 1. Mini-Serializer para mostrar datos humanos (Nombre y Foto)
class EmpleadoResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['id', 'nombres', 'apellidos', 'foto_url', 'puesto']
# 2. Serializer Principal actualizado
class EventoAsistenciaSerializer(serializers.ModelSerializer):
    # Relacionamos con los campos exactos del modelo Empleado
    empleado_nombre = serializers.ReadOnlyField(source='empleado.nombres')
    empleado_apellido = serializers.ReadOnlyField(source='empleado.apellidos')
    # Obtenemos el nombre del cargo/puesto
    puesto = serializers.ReadOnlyField(source='empleado.puesto.nombre')

    class Meta:
        model = EventoAsistencia
        fields = [
            'id', 
            'empleado_nombre', 
            'empleado_apellido', 
            'puesto', 
            'tipo',                      
            'fecha_hora_dispositivo',     
            'fuente',                   
            'ip'
        ]