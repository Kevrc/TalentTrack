import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header';
import { ThemeService, Theme } from '../../../core/services/theme.service';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, HeaderComponent],
  templateUrl: './super-admin-layout.html',
  styleUrls: ['./super-admin-layout.css'],
})
export class SuperAdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  menuItems: MenuItem[] = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/super-admin/empresas', label: 'Empresas', icon: 'briefcase' },
    { path: '/super-admin/configuracion', label: 'Configuración', icon: 'settings' },
    { path: '/super-admin/auditoria', label: 'Auditoría', icon: 'report' },
  ];

  userName = 'SuperAdmin';
  currentTheme: Theme = 'light';

  constructor() {
    this.themeService.theme$.subscribe((t) => (this.currentTheme = t));
  }
  
  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  setLight() {
    this.themeService.setTheme('light');
  }

  setDark() {
    this.themeService.setTheme('dark');
  }
}
