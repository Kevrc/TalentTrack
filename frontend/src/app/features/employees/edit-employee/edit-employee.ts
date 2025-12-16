import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css',
})
export class EditEmployee implements OnInit {
  employeeService = inject(EmployeeService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  empleadoId = '';
  cargando = true;

  // Listas para los selects
  unidades: any[] = [];
  puestos: any[] = [];
  managers: any[] = [];

  form: any = {
    nombres: '',
    apellidos: '',
    documento: '',
    puesto: '',
    unidad: '',
    manager: '',
    fecha_ingreso: '',
  };

  ngOnInit() {
    this.empleadoId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarCatalogos();

    if (this.empleadoId) {
      this.cargarDatosEmpleado();
    }
  }

  cargarCatalogos() {
    // Reutilizamos la lógica de carga de catálogos
    this.employeeService.getUnidades().subscribe((d) => (this.unidades = d));
    this.employeeService.getPuestos().subscribe((d) => (this.puestos = d));
    this.employeeService.getManagers().subscribe((d) => (this.managers = d));
  }

  cargarDatosEmpleado() {
    this.employeeService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (data) => {
        // Mapeamos los datos que llegan al formulario
        this.form = {
          nombres: data.nombres,
          apellidos: data.apellidos,
          documento: data.documento,
          fecha_ingreso: data.fecha_ingreso,
          // OJO: Como el GET devuelve objetos completos (puesto: {id:1, nombre:..}),
          // debemos extraer solo el ID para el <select>
          puesto: data.puesto?.id || '',
          unidad: data.unidad?.id || '',
          manager: data.manager?.id || '', // Asumiendo que manager viene igual
        };
        this.cargando = false;
      },
      error: (err) => {
        alert('Error cargando empleado');
        this.router.navigate(['/directorio']);
      },
    });
  }

  onSubmit() {
    this.cargando = true;

    // Convertir vacíos a null para evitar errores de FK
    const payload = {
      ...this.form,
      puesto: this.form.puesto || null,
      unidad: this.form.unidad || null,
      manager: this.form.manager || null,
    };

    this.employeeService.actualizarEmpleado(this.empleadoId, payload).subscribe({
      next: () => {
        alert('Empleado actualizado correctamente');
        this.router.navigate(['/directorio']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar cambios');
        this.cargando = false;
      },
    });
  }
}
