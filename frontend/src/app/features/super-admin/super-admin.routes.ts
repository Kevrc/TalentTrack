import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/super-admin-layout')
        .then(m => m.SuperAdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('./companies/company-list/company-list')
            .then(m => m.CompanyListComponent),
      },
      {
        path: 'empresas/nueva',
        loadComponent: () =>
          import('./companies/company-form/company-form')
            .then(m => m.CompanyFormComponent),
      },
      {
        path: 'empresas/editar/:id',
        loadComponent: () =>
          import('./companies/company-form/company-form')
            .then(m => m.CompanyFormComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./settings/settings.component')
            .then(m => m.SettingsComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./audit/audit')
            .then(m => m.AuditComponent),
      },
    ]
  }
];
