from rest_framework import serializers
from .models import TipoAusencia, SolicitudAusencia, SaldoVacaciones
from apps.attendance.serializers import EmpleadoResumenSerializer
from apps.employees.models import Empleado
class EmpleadoNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['id', 'nombres', 'apellidos', 'foto_url']

# --- 2. Serializer de Tipos ---
class TipoAusenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAusencia
        fields = ['id', 'nombre', 'requiere_soporte']

# --- 3. Serializer Principal de Solicitudes ---
class SolicitudAusenciaSerializer(serializers.ModelSerializer):
    nombre_tipo = serializers.CharField(source='tipo_ausencia.nombre', read_only=True)
    # Aquí usamos la clase definida arriba
    empleado = EmpleadoNameSerializer(read_only=True) 

    class Meta:
        model = SolicitudAusencia
        fields = [
            'id', 
            'tipo_ausencia', 
            'nombre_tipo',
            'fecha_inicio', 
            'fecha_fin', 
            'dias_solicitados',
            'motivo', 
            'estado', 
            'adjunto_url', 
            'creada_el',
            'empleado',     
            'aprobado_por', 
            'fecha_resolucion'
        ]
        read_only_fields = [
            'id', 'estado', 'dias_solicitados', 'creada_el', 
            'aprobado_por', 'fecha_resolucion'
        ]

    def validate(self, data):
        if data['fecha_inicio'] > data['fecha_fin']:
            raise serializers.ValidationError("La fecha de inicio no puede ser posterior a la fecha fin.")
        return data

# --- 4. Serializer para Responder ---
class ResolverSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudAusencia
        fields = ['estado'] 

    def validate_estado(self, value):
        if value not in ['APROBADO', 'RECHAZADO']:
            raise serializers.ValidationError("Solo puedes APROBAR o RECHAZAR.")
        return value