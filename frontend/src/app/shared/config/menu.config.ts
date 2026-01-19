export const MENU_ROLES: any = {
<<<<<<< HEAD
  // 1. SUPERADMIN - Administrador de plataforma (gestiona todas las empresas)
  SUPERADMIN: [
    { label: 'Dashboard', link: '/super-admin/dashboard', icon: 'dashboard' },
    { label: 'Empresas', link: '/super-admin/empresas', icon: 'briefcase' },
    { label: 'Configuración', link: '/super-admin/configuracion', icon: 'settings' },
    { label: 'Auditoría', link: '/super-admin/auditoria', icon: 'file-text' },
  ],

  // 2. RRHH - Administrador de RRHH (gestiona su empresa)
  RRHH: [
=======
  // 1. ADMIN / RRHH (Ve todo) - NO tiene opción de pedir vacaciones
  SUPERADMIN: [
>>>>>>> 70c73a1d5d9e99a9a5a8b3ab65048b76b1540a54
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Directorio', link: '/admin/directorio', icon: 'users' },
    { label: 'Asistencia', link: '/admin/asistencia', icon: 'clock' },
    { label: 'Solicitudes de Vacaciones', link: '/admin/solicitudes', icon: 'calendar' },
    { label: 'Evaluaciones', link: '/admin/evaluaciones', icon: 'chart' },
    { label: 'Documentos', link: '/admin/documentos', icon: 'file' },
  ],

  // 2. RRHH - Administrador de RRHH (gestiona su empresa)
  RRHH: [
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Directorio', link: '/admin/directorio', icon: 'users' },
    { label: 'Asistencia', link: '/admin/asistencia', icon: 'clock' },
    { label: 'Solicitudes de Vacaciones', link: '/admin/solicitudes', icon: 'calendar' },
    { label: 'Evaluaciones', link: '/admin/evaluaciones', icon: 'chart' },
    { label: 'Documentos', link: '/admin/documentos', icon: 'file' },
  ],

  // 3. MANAGER - Jefe de equipo (puede pedir vacaciones)
  MANAGER: [
    { label: 'Dashboard', link: '/manager/dashboard', icon: 'dashboard' },
    { label: 'Mi Equipo', link: '/manager/equipo', icon: 'users' },
    { label: 'Mis Solicitudes', link: '/manager/solicitudes', icon: 'file' },
    { label: 'Mis Vacaciones', link: '/portal/vacaciones', icon: 'calendar' },
    { label: 'Evaluaciones', link: '/manager/evaluaciones', icon: 'chart' },
    { label: 'Mi Perfil', link: '/manager/perfil', icon: 'user' },
  ],

  // 4. EMPLEADO - Colaborador (solo ve sus datos)
  EMPLEADO: [
    { label: 'Mi Perfil', link: '/portal/perfil', icon: 'user' },
    { label: 'Marcar Asistencia', link: '/portal/marcar', icon: 'clock' },
    { label: 'Mis Vacaciones', link: '/portal/vacaciones', icon: 'calendar' },
    { label: 'Mis Solicitudes', link: '/portal/solicitudes', icon: 'file' },
    { label: 'Mis Evaluaciones', link: '/portal/evaluaciones', icon: 'chart' },
  ],
};
