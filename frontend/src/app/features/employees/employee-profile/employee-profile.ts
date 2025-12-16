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
  activeTab = 'general'; // Pestaña activa por defecto

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatos(id);
    }
  }

  cargarDatos(id: string) {
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
    this.router.navigate(['/directorio']);
  }
}
