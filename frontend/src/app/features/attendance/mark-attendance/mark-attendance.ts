import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../services/attendance.service';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mark-attendance.html',
  styleUrl: './mark-attendance.css',
})
export class MarkAttendanceComponent {
  attendanceService = inject(AttendanceService);

  mensaje = '';
  ubicacion: { lat: number; lng: number } | null = null;
  fotoSeleccionada: File | null = null;
  cargando = false;

  constructor() {
    this.obtenerUbicacion();
  }

  obtenerUbicacion() {
    this.mensaje = 'Obteniendo GPS...';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ubicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.mensaje = 'Ubicación lista.';
        },
        (error) => {
          this.mensaje = 'Error obteniendo GPS: ' + error.message;
        }
      );
    } else {
      this.mensaje = 'Tu navegador no soporta GPS.';
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
    }
  }

  enviarMarcacion(tipo: 'CHECK_IN' | 'CHECK_OUT') {
    if (!this.ubicacion || !this.fotoSeleccionada) {
      alert('Falta ubicación o foto');
      return;
    }

    this.cargando = true;
    this.attendanceService
      .marcarAsistencia(tipo, this.ubicacion.lat, this.ubicacion.lng, this.fotoSeleccionada)
      .subscribe({
        next: (res) => {
          this.cargando = false;
          alert('Asistencia registrada con éxito!');
          console.log(res);
        },
        error: (err) => {
          this.cargando = false;
          console.error(err);
          alert('Error al registrar. Revisa la consola.');
        },
      });
  }
}
