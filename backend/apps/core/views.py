from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UnidadOrganizacional, Puesto
from .serializers import UnidadSerializer, PuestoSerializer

class UnidadListView(generics.ListAPIView):
    serializer_class = UnidadSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UnidadOrganizacional.objects.all() # En prod filtrar por empresa

class PuestoListView(generics.ListAPIView):
    serializer_class = PuestoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Puesto.objects.all()