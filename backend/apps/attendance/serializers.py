from rest_framework import serializers
from .models import EventoAsistencia, TipoEvento, FuenteMarcacion, Empleado

# 1. Mini-Serializer para mostrar datos humanos (Nombre y Foto)
class EmpleadoResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['id', 'nombres', 'apellidos', 'foto_url', 'puesto']
# 2. Serializer Principal actualizado
class EventoAsistenciaSerializer(serializers.ModelSerializer):
    # Campo nuevo: 'empleado_info'. 
    # source='empleado' le dice a Django: "Saca los datos del campo 'empleado' de la BD"
    # read_only=True asegura que esto solo sirve para LEER (GET), no afecta al POST.
    empleado_info = EmpleadoResumenSerializer(source='empleado', read_only=True)

    class Meta:
        model = EventoAsistencia
        fields = [
            'id', 
            'tipo',
            'fecha_hora_dispositivo',
            'registrado_el', 
            'gps_lat', 
            'gps_lng', 
            'foto_url',
            'observacion',
            'empleado_info'
        ]
        read_only_fields = ['id', 'registrado_el']    
        
    def validate(self, data):
        """
        Validación extra: Si es CHECK_IN y la empresa requiere foto,
        podrías validar aquí que foto_url no sea nulo.
        """
        # Ejemplo: data.get('foto_url') es None... lanzar error si es obligatorio
        return data 
class EventoAsistenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoAsistencia
        fields = [
            'id', 
            'tipo',                # CHECK_IN, CHECK_OUT, etc.
            'fecha_hora_dispositivo', 
            'gps_lat', 
            'gps_lng', 
            'foto_url',           
            'observacion'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        
        return data