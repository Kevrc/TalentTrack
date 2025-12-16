from rest_framework import serializers
from .models import Kpi, PlantillaKpi, AsignacionKpi, ResultadoKpi, EvaluacionDesempeno

class KpiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kpi
        fields = '__all__'
        read_only_fields = ['empresa']  # La empresa se asigna automática

class PlantillaKpiSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantillaKpi
        fields = '__all__'
        read_only_fields = ['empresa']

class AsignacionKpiSerializer(serializers.ModelSerializer):
    nombre_empleado = serializers.CharField(source='empleado.nombres', read_only=True)
    nombre_plantilla = serializers.CharField(source='plantilla_kpi.nombre', read_only=True)

    class Meta:
        model = AsignacionKpi
        fields = '__all__'
        read_only_fields = ['empresa']

class ResultadoKpiSerializer(serializers.ModelSerializer):
    nombre_kpi = serializers.CharField(source='kpi.nombre', read_only=True)

    class Meta:
        model = ResultadoKpi
        fields = '__all__'
        read_only_fields = ['empresa', 'calculado_el']

class EvaluacionDesempenoSerializer(serializers.ModelSerializer):
    nombre_empleado = serializers.CharField(source='empleado.nombres', read_only=True)
    
    class Meta:
        model = EvaluacionDesempeno
        fields = '__all__'
        read_only_fields = ['empresa', 'fecha']