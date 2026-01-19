from django.urls import path
from .views import TipoAusenciaListView, SolicitudListCreateView, SolicitudesPendientesManagerView, ResponderSolicitudView, SolicitudesEmpresaRRHHView

urlpatterns = [
    path('tipos/', TipoAusenciaListView.as_view(), name='tipos-ausencia'),
    path('solicitudes/', SolicitudListCreateView.as_view(), name='mis-solicitudes'),
    path('pendientes/', SolicitudesPendientesManagerView.as_view(), name='manager-pendientes'),
    path('empresa/', SolicitudesEmpresaRRHHView.as_view(), name='rrhh-empresa'),
    path('responder/<uuid:pk>/', ResponderSolicitudView.as_view(), name='manager-responder'),
]