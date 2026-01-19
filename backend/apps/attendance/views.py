from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date
from .models import EventoAsistencia
from .serializers import EventoAsistenciaSerializer
from apps.employees.models import Empleado

class MarcarAsistenciaView(generics.CreateAPIView):
    queryset = EventoAsistencia.objects.all()
    serializer_class = EventoAsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Importante: Habilita la recepción de archivos (fotos)
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        user = self.request.user
        
        # 1. Buscar el perfil de empleado asociado al usuario logueado
        # Asumimos que tu modelo Usuario tiene una relación o forma de llegar a Empleado
        # Si usaste el modelo Empleado que te di, y Usuario es un modelo aparte,
        # necesitarás buscar: Empleado.objects.get(email=user.email) o similar.
        # Aquí asumo que existe un vínculo directo o por email:
        empleado = get_object_or_404(Empleado, email=user.email)

        # 2. Lógica básica de Geocerca (Placeholder para el MVP)
        # Aquí calcularías la distancia entre gps_lat/lng y las geocercas de la empresa
        esta_dentro = False 
        # TODO: Implementar función `calcular_geocerca(empleado.empresa, lat, lng)`

        # 3. Guardar el registro inyectando los datos de contexto
        serializer.save(
            empresa=empleado.empresa,
            empleado=empleado,
            dentro_geocerca=esta_dentro,
            fuente='APP', # O determinar según User-Agent
            ip=self.get_client_ip(self.request)
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
class AsistenciaEquipoView(generics.ListAPIView):
    """
    Devuelve la asistencia de HOY de los subordinados del Manager logueado.
    """
    serializer_class = EventoAsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            # 1. Identificar quién es el Manager (el usuario logueado)
            manager_empleado = Empleado.objects.get(email=user.email)
            
            # 2. Buscar empleados cuyo 'manager' sea este usuario
            subordinados_ids = Empleado.objects.filter(manager=manager_empleado).values_list('id', flat=True)
            
            # 3. Filtrar asistencias: Solo de subordinados y solo de HOY
            return EventoAsistencia.objects.filter(
                empleado_id__in=subordinados_ids,
                registrado_el__date=date.today()
            ).order_by('-registrado_el')
            
        except Empleado.DoesNotExist:
            return EventoAsistencia.objects.none()
        
class HistorialAsistenciaView(generics.ListAPIView):
    """
    Devuelve el historial de asistencia del empleado logueado.
    """
    serializer_class = EventoAsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            # 1. Identificar el empleado logueado
            empleado = Empleado.objects.get(email=user.email)
            
            # 2. Filtrar asistencias de este empleado, ordenadas por fecha descendente
            return EventoAsistencia.objects.filter(
                empleado=empleado
            ).order_by('-registrado_el')
            
        except Empleado.DoesNotExist:
            return EventoAsistencia.objects.none()