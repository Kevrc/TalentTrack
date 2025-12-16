from django.urls import path
from .views import TipoAusenciaListView, SolicitudListCreateView, SolicitudesPendientesManagerView, ResponderSolicitudView

urlpatterns = [
    path('tipos/', TipoAusenciaListView.as_view(), name='tipos-ausencia'),
    path('solicitudes/', SolicitudListCreateView.as_view(), name='mis-solicitudes'),
    path('pendientes/', SolicitudesPendientesManagerView.as_view(), name='manager-pendientes'),
    path('responder/<uuid:pk>/', ResponderSolicitudView.as_view(), name='manager-responder'),
]