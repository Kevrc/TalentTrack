import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-profile.html',
  styleUrls: ['./employee-profile.css'],
})
export class EmployeeProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  empleado: any = null;
  cargando = true;
  activeTab = 'general';
  esMiPerfil = false; // Para saber si ocultar botones de "volver" o editar

  ngOnInit() {
    // 1. Intentamos leer el ID de la URL (Caso Admin viendo a otro)
    const idUrl = this.route.snapshot.paramMap.get('id');

    if (idUrl) {
      this.esMiPerfil = false;
      this.cargarDatos(idUrl);
    } else {
      // 2. Si no hay ID en la URL, asumimos que quiero ver MI propio perfil
      this.cargarMiPerfil();
    }
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

  cargarDatos(id: string) {
    this.cargando = true; // Aseguramos mostrar spinner
    this.employeeService.getEmpleadoPorId(id).subscribe({
      next: (data) => {
        this.empleado = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      },
    });
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
}
