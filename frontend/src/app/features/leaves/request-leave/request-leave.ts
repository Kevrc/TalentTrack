import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { Router } from '@angular/router';
import { LeavesService, TipoAusencia } from '../services/leaves.service';

@Component({
  selector: 'app-request-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-leave.html',
  styleUrl: './request-leave.css',
})
export class RequestLeave implements OnInit {
  leavesService = inject(LeavesService);
  router = inject(Router);

  tipos: TipoAusencia[] = [];

  // Modelo del formulario
  solicitud = {
    tipo_ausencia: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
  };

  archivoSeleccionado: File | null = null;
  cargando = false;
  mensajeError = '';

  ngOnInit() {
    this.cargarTipos();
  }

  cargarTipos() {
    this.leavesService.getTiposAusencia().subscribe({
      next: (data) => (this.tipos = data),
      error: (err) => console.error('Error cargando tipos:', err),
    });
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  onSubmit() {
    // Validaciones básicas
    if (
      !this.solicitud.tipo_ausencia ||
      !this.solicitud.fecha_inicio ||
      !this.solicitud.fecha_fin
    ) {
      this.mensajeError = 'Por favor completa los campos obligatorios.';
      return;
    }

    if (this.solicitud.fecha_inicio > this.solicitud.fecha_fin) {
      this.mensajeError = 'La fecha de inicio no puede ser mayor a la fecha fin.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // Preparar objeto para el servicio
    const payload = {
      ...this.solicitud,
      adjunto: this.archivoSeleccionado || undefined,
    };

    this.leavesService.crearSolicitud(payload).subscribe({
      next: () => {
        alert('Solicitud enviada correctamente. Tu manager la revisará.');
        this.router.navigate(['/home']); // Volver al dashboard
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.mensajeError = 'Ocurrió un error al enviar la solicitud.';
      },
    });
  }
}
