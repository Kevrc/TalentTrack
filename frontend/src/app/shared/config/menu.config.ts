export const MENU_ROLES: any = {
  // 1. SUPERADMIN - Administrador de plataforma (gestiona todas las empresas)
  SUPERADMIN: [
    { label: 'Dashboard', link: '/super-admin/dashboard', icon: 'dashboard' },
    { label: 'Empresas', link: '/super-admin/empresas', icon: 'briefcase' },
    { label: 'Configuración', link: '/super-admin/configuracion', icon: 'settings' },
    { label: 'Auditoría', link: '/super-admin/auditoria', icon: 'file-text' },
  ],

  // 2. RRHH - Administrador de RRHH (gestiona su empresa)
  RRHH: [
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Directorio', link: '/admin/directorio', icon: 'users' },
    { label: 'Asistencia', link: '/admin/asistencia', icon: 'clock' },
    { label: 'Calendario', link: '/admin/calendario', icon: 'calendar' },
    { label: 'Vacaciones', link: '/admin/vacaciones', icon: 'calendar' },
    { label: 'Evaluaciones', link: '/admin/evaluaciones', icon: 'chart' },
    { label: 'Documentos', link: '/admin/documentos', icon: 'file' },
  ],

  // 3. MANAGER - Jefe de equipo (gestiona su equipo)
  MANAGER: [
    { label: 'Dashboard', link: '/manager/dashboard', icon: 'dashboard' },
    { label: 'Mi Equipo', link: '/manager/equipo', icon: 'users' },
    { label: 'Calendario', link: '/manager/calendario', icon: 'calendar' },
    { label: 'Aprobaciones', link: '/manager/aprobaciones', icon: 'check' },
    { label: 'Evaluaciones', link: '/manager/evaluaciones', icon: 'chart' },
    { label: 'Mi Perfil', link: '/manager/perfil', icon: 'user' },
  ],

  // 4. EMPLEADO - Colaborador (solo ve sus datos)
  EMPLEADO: [
    { label: 'Mi Perfil', link: '/portal/perfil', icon: 'user' },
    { label: 'Marcar Asistencia', link: '/portal/marcar', icon: 'clock' },
    { label: 'Calendario', link: '/portal/calendario', icon: 'calendar' },
    { label: 'Mis Vacaciones', link: '/portal/vacaciones', icon: 'calendar' },
    { label: 'Mis Evaluaciones', link: '/portal/evaluaciones', icon: 'chart' },
  ],
};
