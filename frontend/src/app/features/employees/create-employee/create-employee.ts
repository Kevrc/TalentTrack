import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-create-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.css',
})
export class CreateEmployee implements OnInit {
  employeeService = inject(EmployeeService);
  router = inject(Router);
  unidades: any[] = [];
  puestos: any[] = [];
  managers: any[] = [];
  form = {
    nombres: '',
    apellidos: '',
    documento: '',
    email: '',
    password: '',
    rol: 'EMPLEADO',
    fecha_ingreso: new Date().toISOString().split('T')[0], // Hoy
    // Para el MVP, si no tenemos listas desplegables, déjamos null estos campos
    puesto: '',
    unidad: '',
    manager: '',
  };

  cargando = false;

  ngOnInit() {
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    // Cargar las 3 listas en paralelo
    this.employeeService.getUnidades().subscribe((data) => (this.unidades = data));
    this.employeeService.getPuestos().subscribe((data) => (this.puestos = data));
    this.employeeService.getManagers().subscribe((data) => (this.managers = data));
  }
  onSubmit() {
    this.cargando = true;
    const payload = {
      ...this.form,
      puesto: this.form.puesto || null,
      unidad: this.form.unidad || null,
      manager: this.form.manager || null,
    };
    this.employeeService.crearEmpleado(payload).subscribe({
      next: () => {
        alert('Empleado creado exitosamente');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear empleado');
        this.cargando = false;
      },
    });
  }
}
