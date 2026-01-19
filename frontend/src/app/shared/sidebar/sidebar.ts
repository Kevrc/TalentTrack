import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_ROLES } from '../config/menu.config';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  menuItems: any[] = [];
  userRole: string = '';
  currentTheme: Theme = 'light';

  private themeService = inject(ThemeService);

  ngOnInit() {
    const userString = localStorage.getItem('user');

    if (userString) {
      const user = JSON.parse(userString);
      this.userRole = (user.rol || user.role || 'EMPLEADO').toUpperCase();
    } else {
      this.userRole = 'EMPLEADO';
    }

    console.log('Rol detectado en Sidebar:', this.userRole);

    this.menuItems = MENU_ROLES[this.userRole] || MENU_ROLES['EMPLEADO'];

    // Suscribirse a cambios de tema
    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
