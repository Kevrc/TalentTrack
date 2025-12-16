from django.urls import path
from .views import CrearEmpleadoView, ManagerListView, EmployeeListView, EmployeeDetailView

urlpatterns = [
    path('nuevo/', CrearEmpleadoView.as_view(), name='crear-empleado'),
    path('managers/', ManagerListView.as_view(), name='listar-managers'),
    path('', EmployeeListView.as_view(), name='listar-empleados'),
    path('<uuid:pk>/', EmployeeDetailView.as_view(), name='empleado-detalle'),
]