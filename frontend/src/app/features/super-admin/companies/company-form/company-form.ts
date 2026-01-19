import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService, EmpresaCreate } from '../../../../core/services/company.service';
import { CatalogService, CatalogoGlobal } from '../../../../core/services/catalog.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-form.html',
  styleUrls: ['./company-form.css'],
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  empresaForm!: FormGroup;
  empresaId: string | null = null;
  esEdicion = false;
  cargando = false;
  guardando = false;
  error: string | null = null;

  paises: CatalogoGlobal[] = [];
  monedas: CatalogoGlobal[] = [];
  cargandoCatalogos = true;

  ngOnInit() {
    this.empresaId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!this.empresaId;

    this.inicializarFormulario();
    this.cargarCatalogos();

    if (this.esEdicion) {
      this.cargarEmpresa();
    }
  }

  inicializarFormulario() {
    this.empresaForm = this.fb.group({
      razon_social: ['', [Validators.required, Validators.maxLength(200)]],
      nombre_comercial: ['', [Validators.required, Validators.maxLength(200)]],
      ruc_nit: ['', [Validators.required, Validators.maxLength(20)]],
      pais: [null, Validators.required],
      moneda: [null, Validators.required],
      direccion: ['', Validators.maxLength(500)],
      telefono: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      sitio_web: ['', Validators.maxLength(200)],
      // Datos del Admin RRHH
      admin_rrhh_email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      admin_rrhh_primer_nombre: ['', [Validators.required, Validators.maxLength(50)]],
      admin_rrhh_primer_apellido: ['', [Validators.required, Validators.maxLength(50)]],
      admin_rrhh_segundo_apellido: ['', Validators.maxLength(50)],
      admin_rrhh_telefono: ['', Validators.maxLength(20)],
    });
  }

  cargarCatalogos() {
    this.cargandoCatalogos = true;

    this.catalogService.getPaises().subscribe({
      next: (paises) => {
        this.paises = paises;
      },
      error: (err) => {
        console.error('Error al cargar países:', err);
      },
    });

    this.catalogService.getMonedas().subscribe({
      next: (monedas) => {
        this.monedas = monedas;
        this.cargandoCatalogos = false;
      },
      error: (err) => {
        console.error('Error al cargar monedas:', err);
        this.cargandoCatalogos = false;
      },
    });
  }

  cargarEmpresa() {
    if (!this.empresaId) return;

    this.cargando = true;
    this.error = null;

    this.companyService.getCompany(this.empresaId).subscribe({
      next: (empresa) => {
        this.empresaForm.patchValue({
          razon_social: empresa.razon_social,
          nombre_comercial: empresa.nombre_comercial,
          ruc_nit: empresa.ruc_nit,
          pais: empresa.pais,
          moneda: empresa.moneda,
          direccion: empresa.direccion || '',
          telefono: empresa.telefono || '',
          email: empresa.email || '',
          sitio_web: empresa.sitio_web || '',
          admin_rrhh_email: empresa.admin_rrhh?.email || '',
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar empresa:', err);
        this.error = 'No se pudo cargar la empresa';
        this.cargando = false;
      },
    });
  }

  guardar() {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = null;

    const empresaData: EmpresaCreate = this.empresaForm.value;

    const operacion = this.esEdicion
      ? this.companyService.updateCompany(this.empresaId!, empresaData)
      : this.companyService.createCompany(empresaData);

    operacion.subscribe({
      next: () => {
        this.router.navigate(['/super-admin/empresas']);
      },
      error: (err) => {
        console.error('Error al guardar empresa:', err);
        console.error('Error completo:', JSON.stringify(err, null, 2));
        this.error = err.error?.detail || err.error?.message || JSON.stringify(err.error) || 'Error al guardar la empresa. Verifica los datos e intenta de nuevo.';
        this.guardando = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/super-admin/empresas']);
  }

  getErrorMessage(campo: string): string {
    const control = this.empresaForm.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['maxLength']) return `Máximo ${control.errors['maxLength'].requiredLength} caracteres`;

    return '';
  }
}
