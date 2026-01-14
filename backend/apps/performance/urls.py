from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    KpiViewSet, PlantillaKpiViewSet, AsignacionKpiViewSet, 
    ResultadoKpiViewSet, EvaluacionDesempenoViewSet
)

router = DefaultRouter()
router.register(r'kpis', KpiViewSet, basename='kpis')
router.register(r'plantillas', PlantillaKpiViewSet, basename='plantillas')
router.register(r'asignaciones', AsignacionKpiViewSet, basename='asignaciones')
router.register(r'resultados', ResultadoKpiViewSet, basename='resultados')
router.register(r'evaluaciones', EvaluacionDesempenoViewSet, basename='evaluaciones')

urlpatterns = [
    path('', include(router.urls)),
]