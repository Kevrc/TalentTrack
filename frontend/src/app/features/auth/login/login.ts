import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importante para usar ngModel
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';

  // login.component.ts

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (userProfile) => {
        // LÓGICA DE REDIRECCIÓN POR ROL
        if (userProfile.rol === 'RRHH' || userProfile.rol === 'SUPERADMIN') {
          this.router.navigate(['/admin']);
        } else if (userProfile.rol === 'MANAGER') {
          this.router.navigate(['/manager']);
        } else {
          // Empleados y Managers (por ahora) van al home normal
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Credenciales incorrectas';
      },
    });
  }
}
