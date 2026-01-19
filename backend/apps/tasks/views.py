from rest_framework import viewsets
from django.db.models import Q 
from .models import Tarea
from .serializers import TareaSerializer

class TaskViewSet(viewsets.ModelViewSet): 
    serializer_class = TareaSerializer

    def get_queryset(self):
        user = self.request.user
        # Filtramos para que vean tareas donde están involucrados
        return Tarea.objects.filter(
            Q(asignado_a__email=user.email) | Q(creado_por__email=user.email)
        )

    def perform_create(self, serializer):
        
        serializer.save(creado_por=self.request.user)