import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../services/attendance.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {
  asistenciasFiltradas: any[] = [];
  datosOriginales: any[] = [];
  filtroNombre: string = '';
  loading: boolean = true;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.attendanceService.getHistorial().subscribe({
      next: (data: any) => {
        const registros = data.results || data || [];
        
        // Ordenamos por fecha_hora_dispositivo de forma descendente (más reciente primero)
        this.datosOriginales = registros.sort((a: any, b: any) => {
          return new Date(b.fecha_hora_dispositivo).getTime() - new Date(a.fecha_hora_dispositivo).getTime();
        });

        this.asistenciasFiltradas = [...this.datosOriginales];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getIniciales(reg: any): string {
    if (reg?.empleado_nombre && reg?.empleado_apellido) {
      return (reg.empleado_nombre[0] + reg.empleado_apellido[0]).toUpperCase();
    }
    return '??';
  }

  filtrar() {
    const term = this.filtroNombre.toLowerCase();
    this.asistenciasFiltradas = this.datosOriginales.filter(a => 
      `${a.empleado_nombre} ${a.empleado_apellido}`.toLowerCase().includes(term)
    );
  }

  // Mapeo exacto según tus modelos: CHECK_IN, CHECK_OUT, etc.
  getBadgeClass(tipo: string) {
    if (tipo === 'CHECK_IN') return 'badge-entrada';
    if (tipo === 'CHECK_OUT') return 'badge-salida';
    return 'badge-pausa';
  }

  getLabelTipo(tipo: string): string {
    const etiquetas: any = {
      'CHECK_IN': 'Entrada',
      'CHECK_OUT': 'Salida',
      'PAUSA_IN': 'Pausa',
      'PAUSA_OUT': 'Retorno'
    };
    return etiquetas[tipo] || tipo;
  }
}