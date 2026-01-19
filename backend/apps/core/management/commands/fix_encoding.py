# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.core.models import CatalogoGlobal


class Command(BaseCommand):
    help = 'Corrige la codificación de caracteres en los catálogos'

    def handle(self, *args, **options):
        # Mapeo de países con sus nombres correctos
        paises_correctos = {
            'M??xico': 'México',
            'Panam??': 'Panamá',
            'Per??': 'Perú',
        }

        # Corregir países
        for nombre_incorrecto, nombre_correcto in paises_correctos.items():
            try:
                catalogo = CatalogoGlobal.objects.get(nombre=nombre_incorrecto, tipo='PAIS')
                catalogo.nombre = nombre_correcto
                catalogo.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Corregido: {nombre_incorrecto} → {nombre_correcto}')
                )
            except CatalogoGlobal.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'⚠ No encontrado: {nombre_incorrecto}')
                )

        # Mapeo de monedas con sus nombres correctos
        monedas_correctas = {
            'Guaran?? Paraguayo': 'Guaraní Paraguayo',
            'Lempira Hondure??o': 'Lempira Hondureño',
        }

        # Corregir monedas
        for nombre_incorrecto, nombre_correcto in monedas_correctas.items():
            try:
                catalogo = CatalogoGlobal.objects.get(nombre=nombre_incorrecto, tipo='MONEDA')
                catalogo.nombre = nombre_correcto
                catalogo.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Corregido: {nombre_incorrecto} → {nombre_correcto}')
                )
            except CatalogoGlobal.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'⚠ No encontrado: {nombre_incorrecto}')
                )

        self.stdout.write(self.style.SUCCESS('\n✅ Proceso completado'))
