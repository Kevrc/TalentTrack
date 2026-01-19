import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-profile.html',
  styleUrls: ['./employee-profile.css'],
})
export class EmployeeProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  empleado: any = null;
  currentUser: any = null;
  cargando = true;
  activeTab = 'general';
  esMiPerfil = false; // Para saber si ocultar botones de "volver" o editar
  puedeEditar = false;
  private fb = inject(FormBuilder);
  
  showModal = false;
  editForm!: FormGroup;
  seccionEditando: string = '';
  constructor() {
    // Inicializamos el formulario con validaciones
    this.editForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      genero: [''],
      fecha_nacimiento: [''],
      estado_civil: [''],
      nacionalidad: [''],
      telefono: ['', [Validators.pattern('^[0-9]+$')]],
      direccion: [''],
      ciudad: ['']
    });
  }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    const idUrl = this.route.snapshot.paramMap.get('id');

    if (idUrl) {
      this.cargarDatos(idUrl);
    } else {
      this.cargarMiPerfil();
    }
  }
  cargarDatos(id: string) {
    this.cargando = true;
    this.employeeService.getEmpleadoPorId(id).subscribe({
      next: (data) => {
        this.empleado = data;
        this.verificarPermisosEdicion();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  verificarPermisosEdicion() {
    if (!this.currentUser || !this.empleado) return;

    // 1. Es su propio perfil?
    const esDueño = this.currentUser.id === this.empleado.id_usuario; 
    
    // 2. Es RRHH o Admin?
    const esAdmin = this.currentUser.rol === 'RRHH' || this.currentUser.rol === 'ADMIN';

    this.esMiPerfil = esDueño;
    this.puedeEditar = esDueño || esAdmin;
  }
  

  cargarMiPerfil() {
    this.esMiPerfil = true;
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const user = JSON.parse(userStr);

      // OJO: Aquí depende de tu backend.
      // Si eres Empleado, tu ID de empleado suele estar dentro de 'empleado_datos' o es el mismo 'id'.
      // Ajusta esta línea según tu estructura JSON:
      const miId = user.empleado_datos ? user.empleado_datos.id : user.id;

      if (miId && user.rol !== 'SUPERADMIN') {
        this.cargarDatos(miId);
      } else {
        // Caso SuperAdmin (no tiene perfil de empleado)
        this.cargando = false;
        alert('El SuperAdmin no tiene ficha de empleado asociada.');
        this.router.navigate(['/admin/dashboard']);
      }
    } else {
      // No hay sesión
      this.router.navigate(['/login']);
    }
  }


  cambiarTab(tab: string) {
    this.activeTab = tab;
  }

  volver() {
    // Si es mi perfil, volver me lleva al Home, si soy admin viendo otro, al directorio
    if (this.esMiPerfil) {
      this.router.navigate(['/portal/home']);
    } else {
      this.router.navigate(['/admin/directorio']);
    }
  }

  abrirEdicion(seccion: string) {
    this.seccionEditando = seccion;
    this.showModal = true;

    // "Parcheamos" el formulario con los datos actuales del empleado
    this.editForm.patchValue({
      nombres: this.empleado.nombres,
      apellidos: this.empleado.apellidos,
      genero: this.empleado.genero,
      fecha_nacimiento: this.empleado.fecha_nacimiento,
      estado_civil: this.empleado.estado_civil,
      nacionalidad: this.empleado.nacionalidad,
      telefono: this.empleado.telefono,
      direccion: this.empleado.direccion,
      ciudad: this.empleado.ciudad
    });
  }

  guardarCambios() {
    if (this.editForm.valid) {
      const datosActualizados = { ...this.empleado, ...this.editForm.value };
      
      this.employeeService.actualizarEmpleado(this.empleado.id, datosActualizados).subscribe({
        next: (res) => {
          this.empleado = datosActualizados; // Actualización local rápida
          this.cerrarModal();
          // Opcional: Mostrar una notificación de éxito
        },
        error: (err) => console.error("Error al actualizar", err)
      });
    }
  }

  cerrarModal() {
    this.showModal = false;
  }

}
