from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import TipoAusencia, SolicitudAusencia
from .serializers import TipoAusenciaSerializer, SolicitudAusenciaSerializer, ResolverSolicitudSerializer
from employees.models import Empleado
from django.shortcuts import get_object_or_404
from django.utils import timezone
class TipoAusenciaListView(generics.ListAPIView):
    serializer_class = TipoAusenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Asumiendo que el usuario tiene un empleado asociado
        empleado = get_object_or_404(Empleado, email=self.request.user.email)
        return TipoAusencia.objects.filter(empresa=empleado.empresa)

class SolicitudListCreateView(generics.ListCreateAPIView):
    serializer_class = SolicitudAusenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        empleado = get_object_or_404(Empleado, email=self.request.user.email)
        return SolicitudAusencia.objects.filter(empleado=empleado).order_by('-creada_el')

    def perform_create(self, serializer):
        empleado = get_object_or_404(Empleado, email=self.request.user.email)
        
        # Calculamos días simples (diferencia de fechas + 1)
        # Nota: En un sistema real, aquí descontarías fines de semana y feriados.
        inicio = serializer.validated_data['fecha_inicio']
        fin = serializer.validated_data['fecha_fin']
        dias = (fin - inicio).days + 1
        
        serializer.save(
            empresa=empleado.empresa,
            empleado=empleado,
            dias_solicitados=dias,
            estado='PENDIENTE' # Siempre nace pendiente
        )

class SolicitudesPendientesManagerView(generics.ListAPIView):
    """
    Lista las solicitudes PENDIENTES de los subordinados del usuario actual.
    """
    serializer_class = SolicitudAusenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            # Buscamos al empleado que corresponde al usuario logueado (el Manager)
            manager = Empleado.objects.get(email=user.email)
            
            # Filtramos solicitudes donde:
            # 1. El empleado solicitante tiene como jefe a este usuario
            # 2. El estado es PENDIENTE
            return SolicitudAusencia.objects.filter(
                empleado__manager=manager,
                estado='PENDIENTE'
            ).order_by('creada_el')
        except Empleado.DoesNotExist:
            return SolicitudAusencia.objects.none()

class ResponderSolicitudView(generics.UpdateAPIView):
    """
    Permite al Manager aprobar o rechazar una solicitud específica.
    """
    queryset = SolicitudAusencia.objects.all()
    serializer_class = ResolverSolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        # Al guardar, registramos QUIÉN aprobó y CUÁNDO
        manager = get_object_or_404(Empleado, email=self.request.user.email)
        
        serializer.save(
            aprobado_por=manager,
            fecha_resolucion=timezone.now()
        )