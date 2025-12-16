import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AttendanceService } from '../../attendance/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeavesService } from '../../leaves/services/leaves.service';
@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe], // DatePipe necesario para formatear horas en la tabla
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css',
})
export class ManagerDashboard implements OnInit {
  // Inyecciones
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);
  public authService = inject(AuthService);
  private leavesService = inject(LeavesService);
  solicitudesPendientes: any[] = [];
  // Estado
  equipoLogs: any[] = [];
  cargando = true;
  errorMsg = '';

  ngOnInit() {
    this.cargarDatosEquipo();
    this.cargarPendientes();
  }

  cargarDatosEquipo() {
    this.cargando = true;
    this.attendanceService.getAsistenciaEquipo().subscribe({
      next: (data) => {
        this.equipoLogs = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando equipo:', err);
        this.errorMsg = 'No se pudo cargar la información del equipo.';
        this.cargando = false;
      },
    });
  }

  // Navegación Personal
  irAMarcar() {
    this.router.navigate(['/marcar']);
  }

  irAHistorial() {
    this.router.navigate(['/historial']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  cargarPendientes() {
    this.leavesService.getPendientesEquipo().subscribe({
      next: (data) => (this.solicitudesPendientes = data),
      error: (err) => console.error('Error cargando solicitudes:', err),
    });
  }

  gestionarSolicitud(id: string, accion: 'APROBADO' | 'RECHAZADO') {
    if (!confirm(`¿Estás seguro de ${accion} esta solicitud?`)) return;

    this.leavesService.responderSolicitud(id, accion).subscribe({
      next: () => {
        alert(`Solicitud ${accion} correctamente.`);
        this.cargarPendientes(); // Recargar la lista para que desaparezca
      },
      error: (err) => alert('Error al procesar la solicitud.'),
    });
  }
}
