from rest_framework import viewsets, permissions
from .models import Kpi, PlantillaKpi, AsignacionKpi, ResultadoKpi, EvaluacionDesempeno
from .serializers import (
    KpiSerializer, PlantillaKpiSerializer, AsignacionKpiSerializer, 
    ResultadoKpiSerializer, EvaluacionDesempenoSerializer
)

class BasePerformanceViewSet(viewsets.ModelViewSet):
    """
    Clase base para no repetir código. 
    Asegura que solo veas y crees datos de TU empresa.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si no tiene perfil de empleado (ej. SuperAdmin puro), devolvemos nada o todo según lógica
        if not hasattr(user, 'empleado_perfil'):
            return self.queryset.none()
        return self.queryset.filter(empresa=user.empleado_perfil.empresa)

    def perform_create(self, serializer):
        # Asigna automáticamente la empresa del usuario logueado
        serializer.save(empresa=self.request.user.empleado_perfil.empresa)

# --- VIEWSETS REALES ---

class KpiViewSet(BasePerformanceViewSet):
    queryset = Kpi.objects.all()
    serializer_class = KpiSerializer

class PlantillaKpiViewSet(BasePerformanceViewSet):
    queryset = PlantillaKpi.objects.all()
    serializer_class = PlantillaKpiSerializer

class AsignacionKpiViewSet(BasePerformanceViewSet):
    queryset = AsignacionKpi.objects.all()
    serializer_class = AsignacionKpiSerializer

class ResultadoKpiViewSet(BasePerformanceViewSet):
    queryset = ResultadoKpi.objects.all()
    serializer_class = ResultadoKpiSerializer

class EvaluacionDesempenoViewSet(BasePerformanceViewSet):
    queryset = EvaluacionDesempeno.objects.all()
    serializer_class = EvaluacionDesempenoSerializer