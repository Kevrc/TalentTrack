import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { ManagerDashboard } from './features/dashboard/manager-dashboard/manager-dashboard';
import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';
import { EmployeeDashboard } from './features/dashboard/employee-dashboard/employee-dashboard';
import { MarkAttendanceComponent } from './features/attendance/mark-attendance/mark-attendance';
import { EmployeeList } from './features/employees/employee-list/employee-list';
import { EditEmployee } from './features/employees/edit-employee/edit-employee';
import { EmployeeProfile } from './features/employees/employee-profile/employee-profile';
import { RequestLeave } from './features/leaves/request-leave/request-leave';
import { HistoryComponent } from './features/attendance/history/history';
import { CreateEmployee } from './features/employees/create-employee/create-employee';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { CalendarComponent } from './features/calendar/calendar';

// Guard simple para proteger rutas
const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // --- 1. GRUPO ADMIN (Aquí arreglamos el error) ---
  // Todas estas rutas empezarán con /admin/...
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard }, // /admin/dashboard
      { path: 'nuevo-empleado', component: CreateEmployee }, // /admin/nuevo-empleado (¡Esto arregla tu error!)
      { path: 'editar-empleado/:id', component: EditEmployee },
      { path: 'perfil-empleado/:id', component: EmployeeProfile },
      { path: 'directorio', component: EmployeeList },
      { path: 'asistencia', component: HistoryComponent }, // Ejemplo: Historial global
      { path: 'documentos', component: RequestLeave }, // Ejemplo temporal
      // Redirección por defecto dentro de admin
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'calendario', component: CalendarComponent },
    ],
  },

  // --- 2. GRUPO MANAGER ---
  // Rutas que empiezan con /manager/...
  {
    path: 'manager',
    component: AdminLayout, // Reutilizamos el mismo layout visual
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: ManagerDashboard },
      { path: 'equipo', component: EmployeeList }, // Manager ve su equipo aquí
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'perfil', component: EmployeeProfile }, // Perfil propio
      { path: 'calendario', component: CalendarComponent },
    ],
  },

  // --- 3. GRUPO EMPLEADO ---
  // Rutas que empiezan con /portal/...
  {
    path: 'portal',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: EmployeeDashboard },
      { path: 'marcar', component: MarkAttendanceComponent },
      { path: 'historial', component: HistoryComponent },
      { path: 'solicitar-permiso', component: RequestLeave },
      { path: 'calendario', component: CalendarComponent },

      { path: 'perfil', component: EmployeeProfile }, // Perfil propio
      { path: '', redirectTo: 'home', pathMatch: 'full' },

    ],
  },

  // Redirecciones globales
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
