import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { CompleteProfileComponent } from './features/auth/complete-profile/complete-profile';
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
import { SUPER_ADMIN_ROUTES } from './features/super-admin/super-admin.routes';
import { CalendarComponent } from './features/calendar/calendar';

// Guard simple para proteger rutas
const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

// Guard para completar perfil si es primer login
// Solo aplica para usuarios RRHH - SuperAdmin no necesita completar perfil
const completarPerfilGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  
  // SuperAdmin nunca necesita completar perfil
  const userRole = auth.getUserRole();
  if (userRole === 'SUPERADMIN') {
    return true;
  }
  
  // Para RRHH y otros roles, verificar si necesitan completar perfil
  if (auth.isPrimerLogin()) {
    return router.createUrlTree(['/completar-perfil']);
  }
  
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'completar-perfil', component: CompleteProfileComponent, canActivate: [authGuard] },

  // --- 0. GRUPO SUPER ADMIN ---
  // Rutas exclusivas para el SuperAdmin
  {
    path: 'super-admin',
    canActivate: [authGuard, completarPerfilGuard],
    children: SUPER_ADMIN_ROUTES,
  },

  // --- 1. GRUPO ADMIN (RRHH) ---
  // Todas estas rutas empezarán con /admin/...
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, completarPerfilGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard }, // /admin/dashboard
      { path: 'nuevo-empleado', component: CreateEmployee }, // /admin/nuevo-empleado
      { path: 'editar-empleado/:id', component: EditEmployee },
      { path: 'perfil-empleado/:id', component: EmployeeProfile },
      { path: 'directorio', component: EmployeeList },
      { path: 'asistencia', component: HistoryComponent },
      { path: 'documentos', component: RequestLeave },
      { path: 'calendario', component: CalendarComponent },
      // Redirección por defecto dentro de admin
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // --- 2. GRUPO MANAGER ---
  // Rutas que empiezan con /manager/...
  {
    path: 'manager',
    component: AdminLayout,
    canActivate: [authGuard, completarPerfilGuard],
    children: [
      { path: 'dashboard', component: ManagerDashboard },
      { path: 'equipo', component: EmployeeList },
      { path: 'perfil', component: EmployeeProfile },
      { path: 'calendario', component: CalendarComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
      { path: 'perfil', component: EmployeeProfile },
      { path: 'calendario', component: CalendarComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },

    ],
  },

  // Redirecciones globales
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
