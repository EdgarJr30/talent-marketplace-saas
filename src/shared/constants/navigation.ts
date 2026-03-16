import type { NavigationItem } from '@/shared/types/navigation'

export const publicNavigationItems: NavigationItem[] = [
  {
    title: 'Producto',
    titleKey: 'navigation.home.title',
    href: '/',
    description: 'Landing comercial del producto',
    descriptionKey: 'navigation.home.description'
  },
  {
    title: 'Jobs',
    titleKey: 'navigation.jobs.title',
    href: '/jobs',
    description: 'Vacantes publicas',
    descriptionKey: 'navigation.jobs.description'
  }
]

export const candidateNavigationItems: NavigationItem[] = [
  {
    title: 'Jobs',
    href: '/jobs',
    description: 'Explora oportunidades publicas'
  },
  {
    title: 'Aplicaciones',
    href: '/applications',
    description: 'Seguimiento de tus postulaciones',
    requiresAuth: true
  },
  {
    title: 'Perfil',
    href: '/candidate/profile',
    description: 'Perfil profesional, CV y visibilidad',
    requiresAuth: true
  },
  {
    title: 'Onboarding',
    href: '/onboarding',
    description: 'Datos base de tu cuenta',
    requiresAuth: true
  },
  {
    title: 'Acceso employer',
    href: '/recruiter-request',
    description: 'Solicita validacion de empresa',
    requiresAuth: true
  }
]

export const employerNavigationItems: NavigationItem[] = [
  {
    title: 'Company',
    href: '/workspace',
    description: 'Identidad, equipo y presencia de empresa',
    requiresAuth: true,
    requiredPermission: 'workspace:read'
  },
  {
    title: 'Jobs',
    href: '/jobs/manage',
    description: 'Publica y administra vacantes',
    requiresAuth: true,
    requiredPermission: 'workspace:read'
  },
  {
    title: 'Candidates',
    href: '/talent',
    description: 'Descubre talento visible',
    requiresAuth: true,
    requiredPermission: 'candidate_directory:read'
  },
  {
    title: 'Pipeline',
    href: '/pipeline',
    description: 'Applicants, notas y stages',
    requiresAuth: true,
    requiredPermission: 'application:read'
  },
  {
    title: 'Roles',
    href: '/rbac',
    description: 'Roles y permisos',
    requiresAuth: true,
    requiredPermission: 'role:read'
  }
]

export const internalNavigationItems: NavigationItem[] = [
  {
    title: 'Overview',
    href: '/internal',
    description: 'Centro operativo interno',
    requiresAuth: true
  },
  {
    title: 'Approvals',
    href: '/internal/approvals',
    description: 'Recruiter requests',
    requiresAuth: true,
    requiredPermission: 'recruiter_request:review'
  },
  {
    title: 'Platform',
    href: '/internal/platform',
    description: 'Planes y ops',
    requiresAuth: true,
    requiredPermission: 'platform_dashboard:read'
  },
  {
    title: 'Moderation',
    href: '/internal/moderation',
    description: 'Trust and safety',
    requiresAuth: true,
    requiredPermission: 'moderation:read'
  },
  {
    title: 'Errors',
    href: '/internal/errors',
    description: 'Error review',
    requiresAuth: true,
    requiredPermission: 'audit_log:read'
  }
]
