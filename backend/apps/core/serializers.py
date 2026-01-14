from rest_framework import serializers
from .models import UnidadOrganizacional, Puesto

class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadOrganizacional
        fields = ['id', 'nombre', 'tipo']

class PuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = ['id', 'nombre']