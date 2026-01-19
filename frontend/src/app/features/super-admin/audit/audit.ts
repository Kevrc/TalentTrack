import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, LogAuditoria } from '../../../core/services/audit.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrls: ['./audit.css'],
})
export class AuditComponent implements OnInit {
  private auditService = inject(AuditService);

  registros: LogAuditoria[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit() {
    this.cargarAuditoria();
  }

  cargarAuditoria() {
    this.cargando = true;
    this.error = null;

    this.auditService.getAuditLogs().subscribe({
      next: (datos: LogAuditoria[]) => {
        this.registros = datos;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar auditoría:', err);
        this.error = 'No se pudo cargar el registro de auditoría';
        this.cargando = false;
      },
    });
  }

  getAccionBadgeClass(accion: string): string {
    switch (accion) {
      case 'CREAR_EMPRESA_CON_RRHH':
        return 'badge-success';
      case 'EDITAR_EMPRESA':
        return 'badge-info';
      case 'ELIMINAR_EMPRESA':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  }

  getAccionLabel(accion: string): string {
    switch (accion) {
      case 'CREAR_EMPRESA_CON_RRHH':
        return '✓ Crear Empresa';
      case 'EDITAR_EMPRESA':
        return '✎ Editar Empresa';
      case 'ELIMINAR_EMPRESA':
        return '✕ Eliminar Empresa';
      default:
        return accion;
    }
  }
}
