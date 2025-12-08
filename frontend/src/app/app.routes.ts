import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { ManagerDashboard } from './features/dashboard/manager-dashboard/manager-dashboard';
import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';
import { EmployeeDashboard } from './features/dashboard/employee-dashboard/employee-dashboard';
import { MarkAttendanceComponent } from './features/attendance/mark-attendance/mark-attendance';
import { HistoryComponent } from './features/attendance/history/history';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

// Guard simple para proteger rutas
const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Rutas protegidas
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard],
  },
  {
    path: 'manager',
    component: ManagerDashboard,
    canActivate: [authGuard],
  },
  {
    path: 'home',
    component: EmployeeDashboard,
    canActivate: [authGuard],
  },

  // Funcionalidades
  { path: 'marcar', component: MarkAttendanceComponent, canActivate: [authGuard] },
  { path: 'historial', component: HistoryComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
