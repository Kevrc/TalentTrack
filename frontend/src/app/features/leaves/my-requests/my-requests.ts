import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeavesService } from '../services/leaves.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequestsComponent implements OnInit {
  private leavesService = inject(LeavesService);
  private authService = inject(AuthService);

  solicitudes: any[] = [];
  solicitudesFiltradas: any[] = [];
  cargando = true;
  esManager = false;
  esRRHH = false;
  filtroActivo: 'todas' | 'pendiente' | 'aprobado' | 'rechazado' = 'todas';

  constructor() {
    // Usar effect para reaccionar a cambios en currentUser
    effect(() => {
      const usuario = this.authService.currentUser();
      if (usuario) {
        this.esManager = usuario.rol === 'MANAGER';
        this.esRRHH = usuario.rol === 'SUPERADMIN' || usuario.rol === 'RRHH';
        this.cargarSolicitudes();
      }
    });
  }

  ngOnInit() {
    // Verificar si el usuario ya está cargado
    const usuario = this.authService.currentUser();
    if (usuario) {
      this.esManager = usuario.rol === 'MANAGER';
      this.esRRHH = usuario.rol === 'SUPERADMIN' || usuario.rol === 'RRHH';
      this.cargarSolicitudes();
    }
  }

  cargarSolicitudes() {
    let request;

    if (this.esRRHH) {
      request = this.leavesService.getSolicitudesEmpresa();
    } else if (this.esManager) {
      request = this.leavesService.getPendientesEquipo();
    } else {
      request = this.leavesService.getMisSolicitudes();
    }

    request.subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.cargando = false;
      },
    });
  }

  setFiltro(filtro: 'todas' | 'pendiente' | 'aprobado' | 'rechazado') {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroActivo === 'todas') {
      this.solicitudesFiltradas = this.solicitudes;
    } else {
      const estadoFiltro = this.filtroActivo.toUpperCase();
      this.solicitudesFiltradas = this.solicitudes.filter(
        (s) => s.estado === estadoFiltro
      );
    }
  }

  getEstadoClase(estado: string) {
    switch (estado) {
      case 'APROBADO':
        return 'estado aprobado';
      case 'RECHAZADO':
        return 'estado rechazado';
      default:
        return 'estado pendiente';
    }
  }

  aprobar(id: string) {
    this.responder(id, 'APROBADO');
  }

  rechazar(id: string) {
    this.responder(id, 'RECHAZADO');
  }

  private responder(id: string, estado: 'APROBADO' | 'RECHAZADO') {
    this.leavesService.responderSolicitud(id, estado).subscribe({
      next: () => this.cargarSolicitudes(),
      error: (err) => console.error('Error respondiendo solicitud:', err),
    });
  }

  contarPorEstado(estado: string): number {
    return this.solicitudes.filter((s) => s.estado === estado).length;
  }
}
