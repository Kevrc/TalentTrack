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
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboard,
        canActivate: [authGuard],
      },
      { path: 'nuevo-empleado', component: CreateEmployee, canActivate: [authGuard] },
      { path: 'editar-empleado/:id', component: EditEmployee, canActivate: [authGuard] },
      {
        path: 'perfil-empleado/:id',
        component: EmployeeProfile,
        canActivate: [authGuard],
      },
    ],
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
  { path: 'solicitar-permiso', component: RequestLeave, canActivate: [authGuard] },
  { path: 'directorio', component: EmployeeList, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
