from datetime import datetime, timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Empresa,
    CatalogoGlobal,
    UnidadOrganizacional,
    Puesto,
    LogAuditoria
)
from apps.attendance.models import EventoAsistencia
from .serializers import (
    EmpresaSerializer,
    CatalogoGlobalSerializer,
    UnidadSerializer,
    PuestoSerializer,
    LogAuditoriaSerializer
)

# ==========================
# PERMISO SUPER ADMIN
# ==========================

class IsSuperUser(permissions.BasePermission):
    """
    Permiso que permite acceso solo a SuperAdmin.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )

# ==========================
# SUPER ADMIN - CATÁLOGOS
# ==========================

class CatalogoGlobalViewSet(viewsets.ModelViewSet):
    """
    Gestión de Países y Monedas.
    - SuperAdmin: CRUD completo
    - Usuarios normales: solo catálogos activos (GET)
    """
    serializer_class = CatalogoGlobalSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Obtener queryset base según permisos
        if user.is_superuser:
            queryset = CatalogoGlobal.objects.all()
        else:
            queryset = CatalogoGlobal.objects.filter(activo=True)
        
        # Filtrar por tipo si se pasa como parámetro
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsSuperUser()]

# ==========================
# SUPER ADMIN - EMPRESAS
# ==========================

class EmpresaViewSet(viewsets.ModelViewSet):
    """
    CRUD de Empresas.
    Escritura solo para SuperAdmin.
    """
    serializer_class = EmpresaSerializer
    queryset = Empresa.objects.all().order_by('-creada_el')

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsSuperUser()]

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar empresa y registrar en auditoría.
        """
        instance = self.get_object()
        empresa_id = instance.id
        detalles = {
            'empresa_id': str(empresa_id),
            'nombre_comercial': instance.nombre_comercial,
            'razon_social': instance.razon_social,
            'ruc_nit': instance.ruc_nit,
            'pais_id': str(instance.pais.id) if instance.pais else None,
            'moneda_id': str(instance.moneda.id) if instance.moneda else None,
            'estado': instance.estado,
        }

        # Ejecutar eliminación
        self.perform_destroy(instance)

        # Registrar auditoría
        LogAuditoria.objects.create(
            usuario=request.user,
            accion='ELIMINAR_EMPRESA',
            entidad='Empresa',
            entidad_id=empresa_id,
            detalles=detalles,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, *args, **kwargs):
        """
        Actualización parcial de empresa. Si cambia el estado, registrar auditoría.
        """
        instance = self.get_object()
        estado_anterior = instance.estado

        response = super().partial_update(request, *args, **kwargs)

        # Refrescar desde DB para ver el estado actualizado
        instance.refresh_from_db()

        if 'estado' in request.data and estado_anterior != instance.estado:
            LogAuditoria.objects.create(
                usuario=request.user,
                accion='CAMBIAR_ESTADO_EMPRESA',
                entidad='Empresa',
                entidad_id=instance.id,
                detalles={
                    'empresa_id': str(instance.id),
                    'nombre_comercial': instance.nombre_comercial,
                    'estado_anterior': estado_anterior,
                    'estado_nuevo': instance.estado,
                },
            )

        return response

# ==========================
# UNIDADES ORGANIZACIONALES
# ==========================

class UnidadViewSet(viewsets.ModelViewSet):
    """
    Gestión de Unidades Organizacionales.
    Multitenencia aplicada por empresa.
    """
    serializer_class = UnidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return UnidadOrganizacional.objects.all()

        return UnidadOrganizacional.objects.filter(
            empresa=user.empresa,
            estado='ACTIVO'
        )

# ==========================
# PUESTOS (CARGOS)
# ==========================

class PuestoViewSet(viewsets.ModelViewSet):
    """
    Gestión de Puestos.
    Multitenencia aplicada por empresa.
    """
    serializer_class = PuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Puesto.objects.all()

        return Puesto.objects.filter(
            empresa=user.empresa
        )

# ==========================
# AUDITORÍA DEL SISTEMA
# ==========================

class LogAuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Logs de auditoría del sistema.
    Solo lectura para SuperAdmin.
    Ordena por fecha descendente (más recientes primero).
    """
    serializer_class = LogAuditoriaSerializer
    permission_classes = [IsSuperUser]
    
    def get_queryset(self):
        # SuperAdmin ve todos los logs
        return LogAuditoria.objects.all().order_by('-fecha')


# ==========================
# SUPER ADMIN - DASHBOARD STATS
# ==========================

class DashboardStatsView(APIView):
    """
    Endpoint de métricas globales para el Dashboard del SuperAdmin.
    Incluye KPIs de empresas y actividad de asistencia.
    """
    permission_classes = [IsSuperUser]

    def get(self, request):
        ahora = timezone.now()
        tz = timezone.get_current_timezone()

        # --- KPIs de empresas ---
        total_empresas = Empresa.objects.count()
        empresas_activas = Empresa.objects.filter(estado='ACTIVO').count()
        empresas_inactivas = Empresa.objects.filter(estado='INACTIVO').count()

        # Mes actual
        inicio_mes = timezone.datetime(ahora.year, ahora.month, 1, tzinfo=tz)
        nuevas_mes = Empresa.objects.filter(creada_el__gte=inicio_mes).count()

        # Mes anterior para cálculos de tendencia
        if ahora.month == 1:
            inicio_mes_anterior = timezone.datetime(ahora.year - 1, 12, 1, tzinfo=tz)
            fin_mes_anterior = timezone.datetime(ahora.year, 1, 1, tzinfo=tz)
        else:
            inicio_mes_anterior = timezone.datetime(ahora.year, ahora.month - 1, 1, tzinfo=tz)
            fin_mes_anterior = inicio_mes

        # Totales mes anterior
        total_empresas_mes_anterior = Empresa.objects.filter(creada_el__lt=inicio_mes).count()
        empresas_activas_mes_anterior = Empresa.objects.filter(estado='ACTIVO', creada_el__lt=inicio_mes).count()
        nuevas_mes_anterior = Empresa.objects.filter(
            creada_el__gte=inicio_mes_anterior,
            creada_el__lt=fin_mes_anterior
        ).count()

        # Calcular tendencias (variación porcentual)
        def calcular_tendencia(actual, anterior):
            if anterior == 0:
                return 100.0 if actual > 0 else 0.0
            return round(((actual - anterior) / anterior) * 100, 1)

        tendencia_total = calcular_tendencia(total_empresas, total_empresas_mes_anterior)
        tendencia_activas = calcular_tendencia(empresas_activas, empresas_activas_mes_anterior)
        tendencia_nuevas = calcular_tendencia(nuevas_mes, nuevas_mes_anterior)

        # --- Empresas creadas y eliminadas por día (últimos 12 meses, organizado por mes) ---
        empresas_por_mes_dict = {}
        current_year = ahora.year
        current_month = ahora.month
        
        for i in range(12):
            # Iteramos del mes más antiguo al actual
            offset = 11 - i
            m = current_month - offset
            y = current_year
            while m <= 0:
                m += 12
                y -= 1
            
            mes_key = f"{y}-{str(m).zfill(2)}"
            empresas_por_mes_dict[mes_key] = []
            
            # Primer día del mes
            primer_dia_mes = timezone.datetime(y, m, 1, tzinfo=tz)
            # Último día del mes o hoy si es el mes actual
            if m == current_month and y == current_year:
                ultimo_dia = ahora.date()
            else:
                if m == 12:
                    ultimo_dia = timezone.datetime(y + 1, 1, 1, tzinfo=tz).date() - timedelta(days=1)
                else:
                    ultimo_dia = timezone.datetime(y, m + 1, 1, tzinfo=tz).date() - timedelta(days=1)
            
            # Iterar por cada día del mes
            dias_en_mes = (ultimo_dia - primer_dia_mes.date()).days + 1
            for j in range(dias_en_mes):
                fecha = (primer_dia_mes + timedelta(days=j)).date()
                start = timezone.datetime.combine(fecha, timezone.datetime.min.time(), tzinfo=tz)
                end = timezone.datetime.combine(fecha + timedelta(days=1), timezone.datetime.min.time(), tzinfo=tz)

                creadas = Empresa.objects.filter(creada_el__gte=start, creada_el__lt=end).count()
                eliminadas = LogAuditoria.objects.filter(
                    accion='ELIMINAR_EMPRESA',
                    entidad='Empresa',
                    fecha__gte=start,
                    fecha__lt=end
                ).count()
                
                empresas_por_mes_dict[mes_key].append({
                    'mes': fecha.strftime('%d/%m'),
                    'creadas': creadas,
                    'eliminadas': eliminadas,
                })
        
        # Convertir a lista ordenada por mes para devolver
        meses = []
        for mes_key in sorted(empresas_por_mes_dict.keys()):
            meses.append({
                'periodo': mes_key,
                'datos': empresas_por_mes_dict[mes_key]
            })

        # --- Asistencia / actividad (últimos 30 días) ---
        hace_30 = ahora - timedelta(days=30)
        eventos = EventoAsistencia.objects.filter(registrado_el__gte=hace_30)
        total_eventos = eventos.count()
        empresas_con_eventos = eventos.values('empresa').distinct().count()

        actividad_promedio_diaria = round(total_eventos / 30, 2) if total_eventos else 0.0
        asistencia_promedio_global = round(total_eventos / max(empresas_con_eventos, 1), 2) if total_eventos else 0.0

        top_empresas = list(
            eventos.values('empresa__id', 'empresa__nombre_comercial')
            .annotate(total_eventos=Count('id'))
            .order_by('-total_eventos')[:5]
        )

        # Distribución por tipo de evento
        eventos_por_tipo = list(
            eventos.values('tipo')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        # Actividad diaria (últimos 14 días)
        hace_14 = ahora - timedelta(days=14)
        actividad_diaria_qs = (
            EventoAsistencia.objects.filter(registrado_el__date__gte=hace_14.date())
            .annotate(dia=TruncDate('registrado_el'))
            .values('dia')
            .annotate(total=Count('id'))
            .order_by('dia')
        )
        actividad_diaria = [
            {
                'fecha': item['dia'].strftime('%Y-%m-%d'),
                'total': item['total'],
            }
            for item in actividad_diaria_qs
        ]

        empresas_estado = {
            'activas': empresas_activas,
            'inactivas': empresas_inactivas,
        }

        data = {
            'kpis': {
                'empresas_total': total_empresas,
                'empresas_activas': empresas_activas,
                'empresas_inactivas': empresas_inactivas,
                'nuevas_mes': nuevas_mes,
                'asistencia_promedio_global': asistencia_promedio_global,
                'actividad_promedio_diaria': actividad_promedio_diaria,
                'eventos_totales_30d': total_eventos,
                'empresas_con_eventos_30d': empresas_con_eventos,
                'tendencia_total': tendencia_total,
                'tendencia_activas': tendencia_activas,
                'tendencia_nuevas': tendencia_nuevas,
            },
            'empresas_por_mes': meses,
            'empresas_estado': empresas_estado,
            'top_empresas_activas': [
                {
                    'empresa_id': item['empresa__id'],
                    'nombre_comercial': item['empresa__nombre_comercial'],
                    'total_eventos': item['total_eventos'],
                }
                for item in top_empresas
            ],
            'eventos_por_tipo': eventos_por_tipo,
            'actividad_diaria': actividad_diaria,
        }

        return Response(data)
