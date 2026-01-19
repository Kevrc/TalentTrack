from rest_framework import serializers
from .models import Tarea

class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = '__all__'
        extra_kwargs = {
            'creado_por': {'read_only': True} # Se asigna automáticamente en la vista
        }