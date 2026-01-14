import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard {
  // Inyectamos servicios
  authService = inject(AuthService); // Público para usarlo en el HTML (currentUser)
  private router = inject(Router);

  irAMarcar() {
    this.router.navigate(['/marcar']);
  }

  irAHistorial() {
    this.router.navigate(['/historial']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  irASolicitarPermiso() {
    this.router.navigate(['/solicitar-permiso']);
  }
}
