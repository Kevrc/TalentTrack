from django.urls import path
from .views import MarcarAsistenciaView, HistorialAsistenciaView, AsistenciaEquipoView

urlpatterns = [
    path('marcar/', MarcarAsistenciaView.as_view(), name='marcar-asistencia'),
    path('historial/', HistorialAsistenciaView.as_view(), name='historial-asistencia'),
    path('equipo/', AsistenciaEquipoView.as_view(), name='equipo-asistencia'),
]