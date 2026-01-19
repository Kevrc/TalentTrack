import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'], // Apuntando al archivo CSS normal
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = { email: '', password: '' };
  rememberMe = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        // Usamos 'response' porque trae todo (token + user)

        console.log('Respuesta Login:', response); // Para debug

        // --- CORRECCIÓN 1: Guardar Token y Usuario por separado ---

        // 1. Guardar el Token (Asegúrate si tu backend lo llama 'access' o 'token')
        if (response.access) {
          localStorage.setItem('token', response.access);
        } else if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // 2. Guardar el Usuario (Para el Sidebar)
        // Si la respuesta trae el usuario dentro de una propiedad 'user', guarda solo eso.
        // Si la respuesta YA ES el usuario, guarda 'response'.
        const userToSave = response.user || response;
        localStorage.setItem('user', JSON.stringify(userToSave));

        // --- CORRECCIÓN 2: Rutas exactas según tu app.routes.ts ---

        const rol = userToSave.rol || userToSave.role; // Prevenir errores de nombre

        if (rol === 'SUPERADMIN') {
          this.router.navigate(['/super-admin/dashboard']); // ← SuperAdmin
        } else if (rol === 'RRHH') {
          this.router.navigate(['/admin/dashboard']); // ← Admin RRHH
        } else if (rol === 'MANAGER') {
          this.router.navigate(['/manager/dashboard']);
        } else {
          // IMPORTANTE: En tus rutas definimos 'portal' como padre de 'home'
          this.router.navigate(['/portal/home']);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas o error en el servidor');
      },
    });
  }
}
