from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import TipoAusencia, SolicitudAusencia
from .serializers import TipoAusenciaSerializer, SolicitudAusenciaSerializer, ResolverSolicitudSerializer
from apps.employees.models import Empleado
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
        
        # Validar que RRHH/SUPERADMIN no puedan crear solicitudes
        if self.request.user.rol in ['SUPERADMIN', 'RRHH']:
            raise PermissionDenied("Los usuarios de RRHH no pueden solicitar vacaciones.")
        
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

class SolicitudesEmpresaRRHHView(generics.ListAPIView):
    """
    Lista TODAS las solicitudes de TODOS los empleados de la empresa (para RRHH),
    incluyendo solicitudes de managers (excepto la del propio RRHH).
    El filtrado por estado se hace en el frontend.
    """
    serializer_class = SolicitudAusenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            # Buscamos al empleado que corresponde al usuario logueado (el RRHH)
            empleado_rrhh = Empleado.objects.get(email=user.email)
            
            # Retornamos TODAS las solicitudes de la empresa EXCEPTO las del propio RRHH
            return SolicitudAusencia.objects.filter(
                empresa=empleado_rrhh.empresa
            ).exclude(
                empleado=empleado_rrhh
            ).order_by('-creada_el')
        except Empleado.DoesNotExist:
            return SolicitudAusencia.objects.none()