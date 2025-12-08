import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  // Datos simulados para los KPIs (Valores por defecto)
  stats = {
    empleadosActivos: 0,
    ausenciasHoy: 0,
    porcentajeAsistencia: 0,
  };

  cargando = true;

  ngOnInit() {
    this.cargarMetricas();
  }

  cargarMetricas() {
    // TODO: Reemplazar esto con una llamada real al backend
    // Ejemplo: this.adminService.getStats().subscribe(...)

    setTimeout(() => {
      // Simulamos que el backend responde esto:
      this.stats = {
        empleadosActivos: 24, // Dato duro por ahora
        ausenciasHoy: 3,
        porcentajeAsistencia: 92,
      };
      this.cargando = false;
    }, 800);
  }

  // Navegación a futuros módulos
  gestionarEmpleados() {
    // this.router.navigate(['/empleados']); // Aún no creamos esta ruta
    alert('Módulo de Gestión de Empleados en construcción');
  }

  verReportes() {
    alert('Módulo de Reportes en construcción');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
