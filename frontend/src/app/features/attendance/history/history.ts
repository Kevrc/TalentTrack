import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../services/attendance.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryComponent implements OnInit {
  attendanceService = inject(AttendanceService);
  historial: any[] = [];
  cargando = true;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.attendanceService.getHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      },
    });
  }
}
