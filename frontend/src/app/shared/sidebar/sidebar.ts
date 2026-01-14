import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_ROLES } from '../config/menu.config'; // Ajusta la ruta

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

  ngOnInit() {
    // 1. Recuperar el usuario del LocalStorage (donde lo guardaste al hacer Login)
    // Asegúrate de que la clave sea la misma que usas en tu LoginService ('user', 'usuario', etc.)
    const userString = localStorage.getItem('user');

    if (userString) {
      const user = JSON.parse(userString);

      // 2. Extraer el rol (asegúrate que tu backend manda 'rol' o 'role')
      // Convertimos a mayúsculas para evitar errores (rrhh vs RRHH)
      this.userRole = (user.rol || user.role || 'EMPLEADO').toUpperCase();
    } else {
      // Si no hay usuario, rol por defecto
      this.userRole = 'EMPLEADO';
    }

    console.log('Rol detectado en Sidebar:', this.userRole); // <--- DEBUGEAR

    // 3. Asignar el menú correspondiente
    this.menuItems = MENU_ROLES[this.userRole] || MENU_ROLES['EMPLEADO'];
  }
}
