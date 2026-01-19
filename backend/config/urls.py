from django.contrib import admin
from django.urls import path, include,re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Importaciones para JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Documentación Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="TalentTrack API",
        default_version='v1',
        description="Documentación oficial del backend TalentTrack",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de Autenticación (Login)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Tus apps
    path('api/users/', include('users.urls')),
    path('api/attendance/', include('attendance.urls')), 
    path('api/leaves/', include('leaves.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/core/', include('core.urls')),
    path('api/performance/', include('performance.urls')),
    path('api/tasks/', include('tasks.urls')),
      # Swagger UI
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Redoc UI
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]