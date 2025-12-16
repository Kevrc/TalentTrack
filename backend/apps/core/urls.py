from django.urls import path
from .views import UnidadListView, PuestoListView

urlpatterns = [
    path('unidades/', UnidadListView.as_view()),
    path('puestos/', PuestoListView.as_view()),
]