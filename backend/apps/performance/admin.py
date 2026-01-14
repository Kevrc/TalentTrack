from django.contrib import admin
from .models import Kpi, PlantillaKpi, AsignacionKpi, ResultadoKpi, EvaluacionDesempeno

admin.site.register(Kpi)
admin.site.register(PlantillaKpi)
admin.site.register(AsignacionKpi)
admin.site.register(ResultadoKpi)
admin.site.register(EvaluacionDesempeno)