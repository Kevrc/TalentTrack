import uuid
from django.db import models

# Definición de opciones (Enumerados) según el documento [cite: 378]
class EstadoGeneral(models.TextChoices):
    ACTIVO = 'ACTIVO', 'Activo'
    INACTIVO = 'INACTIVO', 'Inactivo'

class EstadoEmpleado(models.TextChoices):
    ACTIVO = 'ACTIVO', 'Activo'
    SUSPENDIDO = 'SUSPENDIDO', 'Suspendido'
    BAJA = 'BAJA', 'Baja'

class TipoUnidad(models.TextChoices):
    SEDE = 'SEDE', 'Sede'
    AREA = 'AREA', 'Área'
    DEPTO = 'DEPTO', 'Departamento'

# 1. Modelo Empresa (Núcleo Multiempresa) [cite: 197]
class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    razon_social = models.CharField(max_length=150) # [cite: 199]
    nombre_comercial = models.CharField(max_length=150)
    ruc_nit = models.CharField(max_length=20, verbose_name="RUC/NIT")
    # Para pais y moneda se pueden usar choices o tablas aparte, aquí simplificado como texto
    pais = models.CharField(max_length=50) 
    moneda = models.CharField(max_length=10, default='USD')
    logo_url = models.ImageField(upload_to='logos_empresas/', null=True, blank=True)
    estado = models.CharField(
        max_length=20, 
        choices=EstadoGeneral.choices, 
        default=EstadoGeneral.ACTIVO
    )
    creada_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre_comercial

# 2. Modelo Unidad Organizacional (Sucursal/Depto) [cite: 200]
class UnidadOrganizacional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='unidades') # [cite: 201]
    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=20, choices=TipoUnidad.choices) # [cite: 202]
    # Relación recursiva para jerarquías (ej: Área -> Departamento) [cite: 203]
    padre = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_unidades')
    ubicacion = models.CharField(max_length=200, null=True, blank=True)
    estado = models.CharField(choices=EstadoGeneral.choices, default=EstadoGeneral.ACTIVO, max_length=20)
    creada_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.empresa.nombre_comercial})"

# 3. Modelo Puesto (Cargo) [cite: 204]
class Puesto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='puestos')
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True) # Texto largo [cite: 206]
    unidad = models.ForeignKey(UnidadOrganizacional, on_delete=models.SET_NULL, null=True, related_name='puestos_asignados')
    nivel = models.CharField(max_length=50, null=True, blank=True) # Ej: Junior, Senior, Gerente
    
    def __str__(self):
        return self.nombre

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