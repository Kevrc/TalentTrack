import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // Asegúrate de la ruta

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html', // Lo moveremos a archivo aparte si prefieres, o inline
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  userPhoto: string = '';
  userName: string = '';
  isOpen = false; // Estado del dropdown
  rol: string = '';
  // --- ESCALABILIDAD: Define tus opciones aquí ---
  menuOptions = [
    { label: 'Mi Perfil', icon: 'user', action: () => this.goToProfile() },
    { label: 'Configuración', icon: 'settings', action: () => this.goToSettings() },
    { type: 'separator' }, // Para poner una línea divisoria
    { label: 'Cerrar Sesión', icon: 'log-out', action: () => this.logout(), color: 'red' },
  ];

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);

      this.userName = user.empleado_datos.nombres || 'Usuario';
      this.rol = user.rol;

      this.userPhoto = user.empleado_datos.foto_url
        ? user.empleado_datos.foto_url
        : `https://ui-avatars.com/api/?name=${this.userName}&background=random&color=fff`;
    } else {
      // Fallback total
      this.userName = 'Invitado';
      this.userPhoto = 'https://ui-avatars.com/api/?name=Invitado';
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Acciones
  goToProfile() {
    if (this.rol === 'EMPLEADO') {
      this.router.navigate(['/portal/perfil']);
    } else if (this.rol === 'MANAGER') {
      this.router.navigate(['/manager/perfil']);
    }
    this.isOpen = false;
  }

  goToSettings() {
    console.log('Ir a configuración...');
    this.isOpen = false;
  }

  logout() {
    // 1. Limpiar datos
    this.authService.logout();
    // 2. Redirigir al Login
    this.router.navigate(['/login']);
    this.isOpen = false;
  }
}
