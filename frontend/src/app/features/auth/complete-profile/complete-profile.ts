import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.css'],
})
export class CompleteProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  perfilForm!: FormGroup;
  cargando = false;
  error: string | null = null;

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.perfilForm = this.fb.group({
      primer_nombre: ['', [Validators.required, Validators.minLength(2)]],
      primer_apellido: ['', [Validators.required, Validators.minLength(2)]],
      segundo_apellido: [''],
      telefono: [''],
    });
  }

  guardar() {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;

    this.authService.completarPerfilInicial(this.perfilForm.value).subscribe({
      next: () => {
        // Redirigir al dashboard según el rol
        const rol = this.authService.getUserRole();
        
        if (rol === 'SUPERADMIN') {
          this.router.navigate(['/super-admin/dashboard']);
        } else if (rol === 'RRHH') {
          this.router.navigate(['/rrhh/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error al completar perfil:', err);
        this.error = err.error?.detail || 'Error al guardar el perfil. Intenta de nuevo.';
        this.cargando = false;
      },
    });
  }

  getErrorMessage(campo: string): string {
    const control = this.perfilForm.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['minLength']) return `Mínimo ${control.errors['minLength'].requiredLength} caracteres`;

    return '';
  }
}
