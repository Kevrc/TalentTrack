export const MENU_ROLES: any = {
  // 1. ADMIN / RRHH (Ve todo)
  SUPERADMIN: [
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Directorio', link: '/admin/directorio', icon: 'users' },
    { label: 'Asistencia', link: '/admin/asistencia', icon: 'clock' },
    { label: 'Vacaciones', link: '/admin/vacaciones', icon: 'calendar' },
    { label: 'Evaluaciones', link: '/admin/evaluaciones', icon: 'chart' },
    { label: 'Documentos', link: '/admin/documentos', icon: 'file' },
  ],

  // 2. MANAGER (Ve a su equipo)
  MANAGER: [
    { label: 'Dashboard', link: '/manager/dashboard', icon: 'dashboard' },
    { label: 'Mi Equipo', link: '/manager/equipo', icon: 'users' },
    { label: 'Aprobaciones', link: '/manager/aprobaciones', icon: 'check' },
    { label: 'Evaluaciones', link: '/manager/evaluaciones', icon: 'chart' },
    { label: 'Mi Perfil', link: '/manager/perfil', icon: 'user' },
  ],

  // 3. EMPLEADO (Solo ve lo suyo)
  EMPLEADO: [
    { label: 'Mi Perfil', link: '/portal/perfil', icon: 'user' },
    { label: 'Marcar Asistencia', link: '/portal/marcar', icon: 'clock' },
    { label: 'Mis Vacaciones', link: '/portal/vacaciones', icon: 'calendar' },
    { label: 'Mis Evaluaciones', link: '/portal/evaluaciones', icon: 'chart' },
  ],

  // PENDIENTE SI SE AUMENTA LOS ROLES
};
