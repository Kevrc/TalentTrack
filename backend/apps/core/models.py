import uuid
from django.db import models

# ==========================
# ENUMERADOS (Choices)
# ==========================

class EstadoGeneral(models.TextChoices):
    ACTIVO = 'ACTIVO', 'Activo'
    INACTIVO = 'INACTIVO', 'Inactivo'


class TipoUnidad(models.TextChoices):
    SEDE = 'SEDE', 'Sede'
    AREA = 'AREA', 'Área'
    DEPTO = 'DEPTO', 'Departamento'


# ==========================
# CATÁLOGO GLOBAL (SuperAdmin)
# ==========================

class CatalogoGlobal(models.Model):
    """
    Catálogo administrado por el SuperAdmin.
    Usado para Países, Monedas, etc.
    """
    TIPO_CHOICES = (
        ('PAIS', 'País'),
        ('MONEDA', 'Moneda'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    codigo = models.CharField(max_length=10, help_text="Ej: USD, EC")
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ('tipo', 'codigo')
        ordering = ['tipo', 'nombre']

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"


# ==========================
# EMPRESA (Multiempresa)
# ==========================

class Empresa(models.Model):
    """
    Empresa registrada en la plataforma.
    Gestionada por el SuperAdmin.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    razon_social = models.CharField(max_length=150)
    nombre_comercial = models.CharField(max_length=150)
    ruc_nit = models.CharField(max_length=20, verbose_name="RUC/NIT")

    pais = models.ForeignKey(
        CatalogoGlobal,
        on_delete=models.SET_NULL,
        null=True,
        related_name='empresas_pais',
        limit_choices_to={'tipo': 'PAIS'}
    )

    moneda = models.ForeignKey(
        CatalogoGlobal,
        on_delete=models.SET_NULL,
        null=True,
        related_name='empresas_moneda',
        limit_choices_to={'tipo': 'MONEDA'}
    )

    # ----- Contacto -----
    direccion = models.TextField(blank=True, null=True, max_length=500)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    sitio_web = models.URLField(blank=True, null=True)

    # Ubicación opcional para visualización en mapa
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    logo_url = models.ImageField(
        upload_to='logos_empresas/',
        null=True,
        blank=True
    )

    estado = models.CharField(
        max_length=20,
        choices=EstadoGeneral.choices,
        default=EstadoGeneral.ACTIVO
    )

    creada_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre_comercial']

    def __str__(self):
        return self.nombre_comercial


# ==========================
# UNIDAD ORGANIZACIONAL
# ==========================

class UnidadOrganizacional(models.Model):
    """
    Representa sedes, áreas o departamentos de una empresa.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='unidades'
    )
    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=20, choices=TipoUnidad.choices)

    padre = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_unidades'
    )

    ubicacion = models.CharField(max_length=200, null=True, blank=True)

    estado = models.CharField(
        max_length=20,
        choices=EstadoGeneral.choices,
        default=EstadoGeneral.ACTIVO
    )

    creada_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['empresa', 'estado']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.empresa.nombre_comercial})"


# ==========================
# PUESTO (CARGO)
# ==========================

class Puesto(models.Model):
    """
    Cargo o puesto dentro de una unidad organizacional.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='puestos'
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True)

    unidad = models.ForeignKey(
        UnidadOrganizacional,
        on_delete=models.SET_NULL,
        null=True,
        related_name='puestos_asignados'
    )

    nivel = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['empresa']),
        ]

    def __str__(self):
        return f"{self.nombre} - {self.empresa.nombre_comercial}"

# ==========================
# AUDITORÍA DEL SISTEMA
# ==========================

class LogAuditoria(models.Model):
    """
    Registro de acciones críticas realizadas en el sistema.
    Usado principalmente por el SuperAdmin.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Quién realizó la acción
    usuario = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        related_name='logs_auditoria'
    )

    # Acción realizada
    accion = models.CharField(
        max_length=100,
        help_text="Ej: CREAR_EMPRESA, EDITAR_EMPRESA, CREAR_CATALOGO"
    )

    # Entidad afectada
    entidad = models.CharField(
        max_length=100,
        help_text="Ej: Empresa, CatalogoGlobal"
    )

    # ID de la entidad afectada
    entidad_id = models.UUIDField()

    # Información adicional
    detalles = models.JSONField(null=True, blank=True)

    # Fecha de la acción
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.fecha}] {self.accion} - {self.entidad}"

# 4. Modelo Empleado [cite: 216]

# class Empleado(models.Model):
 #   id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
 #   empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='empleados')
    
    # Datos Personales [cite: 218, 219]
 #   nombres = models.CharField(max_length=150)
 #   apellidos = models.CharField(max_length=150)
  #  documento = models.CharField(max_length=20, help_text="Cédula, DNI o Pasaporte")
   # email = models.EmailField(unique=True)
   # telefono = models.CharField(max_length=20, null=True, blank=True)
   # direccion = models.TextField(null=True, blank=True)
    
    # Fechas [cite: 220]
  #  fecha_nacimiento = models.DateField(null=True, blank=True)
  #  fecha_ingreso = models.DateField()
    
    # Relaciones Organizacionales 
  #  unidad = models.ForeignKey(UnidadOrganizacional, on_delete=models.SET_NULL, null=True, related_name='empleados')
  #  puesto = models.ForeignKey(Puesto, on_delete=models.SET_NULL, null=True, related_name='empleados')
    # Auto-referencia para el jefe directo (Manager)
  #  manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinados')
    
  #  foto_url = models.ImageField(upload_to='fotos_empleados/', null=True, blank=True)
  #  estado = models.CharField(
   #     max_length=20, 
    #    choices=EstadoEmpleado.choices, 
    #    default=EstadoEmpleado.ACTIVO
    #)

  #  class Meta:
        # Constraint para evitar emails duplicados, aunque ya tiene unique=True, 
        # esto refuerza la integridad a nivel DB
   #     ordering = ['apellidos', 'nombres']

   # def __str__(self):
    #    return f"{self.apellidos} {self.nombres}"