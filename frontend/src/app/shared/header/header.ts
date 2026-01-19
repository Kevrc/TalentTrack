import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  // User Info
  userPhoto: string = '';
  userName: string = '';
  rol: string = '';
  
  // UI States
  isOpen = false;
  showNotifications = false;
  showLanguageMenu = false;
  searchQuery: string = '';
  currentLanguage: string = 'es';

  // Notifications
  notifications = [
    { id: 1, message: 'Nueva empresa registrada', time: '5 min', read: false, icon: '🏢' },
    { id: 2, message: 'Reporte pendiente de revisión', time: '2 horas', read: false, icon: '📊' },
    { id: 3, message: 'Sistema actualizado correctamente', time: '1 día', read: true, icon: '✓' }
  ];

  menuOptions = [
    { label: 'Mi Perfil', icon: 'user', action: () => this.goToProfile() },
    { label: 'Configuración', icon: 'settings', action: () => this.goToSettings() },
    { type: 'separator' },
    { label: 'Cerrar Sesión', icon: 'log-out', action: () => this.logout(), color: 'red' },
  ];

  ngOnInit() {
    this.loadUserInfo();
    this.loadLanguage();
  }

  loadUserInfo() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.nombre || 'Usuario';
      this.rol = user.rol || '';
    }
    
    // Foto del usuario quemada (no cambia)
    this.userPhoto = 'assets/images/imagen_usuario.jpeg';
  }

  loadLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    this.showLanguageMenu = false;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.showNotifications = false;
    this.showLanguageMenu = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.isOpen = false;
    this.showLanguageMenu = false;
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
    this.isOpen = false;
    this.showNotifications = false;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markNotificationAsRead(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  goToProfile() {
    if (this.rol === 'EMPLEADO') {
      this.router.navigate(['/portal/perfil']);
    } else if (this.rol === 'MANAGER') {
      this.router.navigate(['/manager/perfil']);
    } else if (this.rol === 'RRHH') {
      this.router.navigate(['/admin/perfil']);
    } else if (this.rol === 'SUPERADMIN') {
      this.router.navigate(['/super-admin/profile']);
    }
    this.isOpen = false;
  }

  goToSettings() {
    if (this.rol === 'EMPLEADO') {
      this.router.navigate(['/portal/configuracion']);
    } else if (this.rol === 'MANAGER') {
      this.router.navigate(['/manager/configuracion']);
    } else if (this.rol === 'RRHH') {
      this.router.navigate(['/admin/configuracion']);
    } else if (this.rol === 'SUPERADMIN') {
      this.router.navigate(['/super-admin/settings']);
    }
    this.isOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.isOpen = false;
  }
}
