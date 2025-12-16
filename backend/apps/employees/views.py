from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import NuevoEmpleadoSerializer, ListEmpleadoSerializer, UpdateEmpleadoSerializer
from .models import Empleado
from leaves.serializers import EmpleadoNameSerializer
from django.db.models import Q
class CrearEmpleadoView(generics.CreateAPIView):
    serializer_class = NuevoEmpleadoSerializer
    # Solo RRHH o SuperAdmin pueden crear empleados
    permission_classes = [permissions.IsAuthenticated] 
    
    # Nota: Aquí deberíamos agregar un permiso personalizado tipo IsAdminOrRRHH
    # Por ahora IsAuthenticated basta para el MVP.

class ManagerListView(generics.ListAPIView):
    serializer_class = EmpleadoNameSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Listamos todos los empleados activos para ser seleccionados como jefe
        return Empleado.objects.all()


class EmployeeListView(generics.ListAPIView):
    serializer_class = ListEmpleadoSerializer # Usamos este para ver todos los datos por ahora
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Obtenemos el perfil de empleado del usuario logueado
        try:
            perfil = Empleado.objects.get(email=user.email)
        except Empleado.DoesNotExist:
            return Empleado.objects.none() # Si no es empleado, no ve nada

        queryset = Empleado.objects.none()

        # --- LÓGICA DE PERMISOS ---
        
        # CASO A: RRHH o SUPERADMIN -> Ven TODA la empresa
        if user.rol in ['RRHH', 'SUPERADMIN']:
            queryset = Empleado.objects.filter(empresa=perfil.empresa)
            
        # CASO B: MANAGER -> Ve solo a sus SUBORDINADOS directos
        elif user.rol == 'MANAGER':
            queryset = Empleado.objects.filter(manager=perfil)
            
        # CASO C: EMPLEADO -> Quizás solo se ve a sí mismo (opcional)
        else:
            queryset = Empleado.objects.filter(id=perfil.id)

        # --- LÓGICA DE BUSCADOR ---
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(nombres__icontains=search_query) | 
                Q(apellidos__icontains=search_query) |
                Q(documento__icontains=search_query) |
                Q(puesto__nombre__icontains=search_query)
            )

        return queryset.order_by('-fecha_ingreso')
    

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    # Truco: Usamos un serializer para LEER (GET) y otro para ESCRIBIR (PUT)
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateEmpleadoSerializer
        return ListEmpleadoSerializer # Para GET devuelve el objeto completo anidado

    def get_queryset(self):
        # Aquí podrías poner seguridad extra (ej: que un Manager no edite a otro Manager)
        # Por ahora, devolvemos todos los empleados.
        return Empleado.objects.all()