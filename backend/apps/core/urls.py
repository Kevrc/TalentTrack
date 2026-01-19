from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EmpresaViewSet,
    CatalogoGlobalViewSet,
    UnidadViewSet,
    PuestoViewSet,
    LogAuditoriaViewSet,
    DashboardStatsView
)

# ==========================
# ROUTERS
# ==========================

router = DefaultRouter()

# --- SUPER ADMIN ---
router.register(
    r'superadmin/empresas',
    EmpresaViewSet,
    basename='superadmin-empresas'
)

router.register(
    r'superadmin/catalogos',
    CatalogoGlobalViewSet,
    basename='superadmin-catalogos'
)

# --- CORE / ORGANIZACIÓN ---
router.register(
    r'unidades',
    UnidadViewSet,
    basename='unidades'
)

router.register(
    r'puestos',
    PuestoViewSet,
    basename='puestos'
)

router.register(
    r'superadmin/auditoria',
    LogAuditoriaViewSet,
    basename='superadmin-auditoria'
)

# ==========================
# URL PATTERNS
# ==========================

urlpatterns = [
    path('', include(router.urls)),
    path('superadmin/dashboard/', DashboardStatsView.as_view(), name='superadmin-dashboard'),
]
