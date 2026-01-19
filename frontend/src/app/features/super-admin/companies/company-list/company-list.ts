import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CompanyService, Empresa } from '../../../../core/services/company.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './company-list.html',
  styleUrls: ['./company-list.css'],
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  empresas: Empresa[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.cargando = true;
    this.error = null;

    this.companyService.getCompanies().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.error = 'No se pudieron cargar las empresas. Intenta de nuevo.';
        this.cargando = false;
      },
    });
  }

  crearEmpresa() {
    this.router.navigate(['/super-admin/empresas/nueva']);
  }

  editarEmpresa(id: string) {
    this.router.navigate(['/super-admin/empresas/editar', id]);
  }

  toggleEstado(empresa: Empresa) {
    if (!empresa.id) return;

    const nuevoEstado = empresa.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';

    if (!confirm(`¿Estás seguro de ${accion} la empresa "${empresa.nombre_comercial}"?`)) {
      return;
    }

    this.companyService.toggleStatus(empresa.id, nuevoEstado).subscribe({
      next: (empresaActualizada) => {
        // Actualizar en la lista local
        const index = this.empresas.findIndex((e) => e.id === empresa.id);
        if (index !== -1) {
          this.empresas[index] = empresaActualizada;
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('No se pudo cambiar el estado de la empresa.');
      },
    });
  }

  eliminarEmpresa(empresa: Empresa) {
    if (!empresa.id) return;

    if (!confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre_comercial}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.companyService.deleteCompany(empresa.id).subscribe({
      next: () => {
        // Eliminar de la lista local
        this.empresas = this.empresas.filter((e) => e.id !== empresa.id);
        alert('Empresa eliminada exitosamente');
      },
      error: (err) => {
        console.error('Error al eliminar empresa:', err);
        alert('No se pudo eliminar la empresa. Puede tener registros relacionados.');
      },
    });
  }

  getEstadoBadgeClass(estado: string): string {
    return estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo';
  }
}
