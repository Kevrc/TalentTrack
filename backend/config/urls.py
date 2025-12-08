from django.contrib import admin
from django.urls import path, include
# Importaciones para JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de Autenticación (Login)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Tus apps
    path('api/users/', include('users.urls')),
    path('api/attendance/', include('attendance.urls')), 
    # path('api/employees/', include('employees.urls')), # Cuando crees urls.py en employees
]