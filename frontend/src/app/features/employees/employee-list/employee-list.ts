import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList implements OnInit {
  employeeService = inject(EmployeeService);
  router = inject(Router);

  empleados: any[] = [];
  terminoBusqueda: string = '';
  cargando = false;

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.cargando = true;
    this.employeeService.getEmpleados(this.terminoBusqueda).subscribe({
      next: (data) => {
        this.empleados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      },
    });
  }

  buscar() {
    // Pequeño debounce manual o búsqueda directa al presionar Enter
    this.cargarEmpleados();
  }

  irANuevo() {
    this.router.navigate(['/admin/nuevo-empleado']);
  }
  irAEditar(id: string) {
    this.router.navigate(['/admin/perfil-empleado', id]);
  }

  eliminar(id: string) {
    if (confirm('¿Estás seguro de dar de baja a este empleado?')) {
      this.employeeService.eliminarEmpleado(id).subscribe(() => {
        this.cargarEmpleados(); // Recargar tabla
      });
    }
  }
}
