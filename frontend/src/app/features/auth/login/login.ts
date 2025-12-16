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
      next: (userProfile) => {
        if (userProfile.rol === 'SUPERADMIN' || userProfile.rol === 'RRHH') {
          this.router.navigate(['/admin']);
        } else if (userProfile.rol === 'MANAGER') {
          this.router.navigate(['/manager']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas');
      },
    });
  }
}
