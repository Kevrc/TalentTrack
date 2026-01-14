from django.contrib import admin
from .models import TipoAusencia, SolicitudAusencia

# Register your models here.
admin.site.register(TipoAusencia)
admin.site.register(SolicitudAusencia)