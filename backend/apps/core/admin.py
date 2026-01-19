from django.contrib import admin
from .models import Empresa, CatalogoGlobal, UnidadOrganizacional, Puesto

@admin.register(CatalogoGlobal)
class CatalogoGlobalAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'codigo', 'activo')
    list_filter = ('tipo', 'activo')
    search_fields = ('nombre', 'codigo')

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre_comercial', 'ruc_nit', 'pais', 'estado', 'creada_el')
    list_filter = ('estado', 'pais')
    search_fields = ('nombre_comercial', 'ruc_nit')

# Registramos los otros modelos básicos también
admin.site.register(UnidadOrganizacional)
admin.site.register(Puesto)