import type { NavigationItem } from '@/shared/types/navigation'

export const publicNavigationItems: NavigationItem[] = [
  {
    title: 'Inicio',
    titleKey: 'navigation.home.title',
    href: '/',
    description: 'Landing del producto',
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
    title: 'Onboarding',
    href: '/onboarding',
    description: 'Completa tu identidad base',
    requiresAuth: true
  },
  {
    title: 'Mi perfil',
    href: '/candidate/profile',
    description: 'Perfil profesional y CV',
    requiresAuth: true
  },
  {
    title: 'Jobs',
    href: '/jobs',
    description: 'Explora vacantes'
  },
  {
    title: 'Aplicaciones',
    href: '/applications',
    description: 'Tus postulaciones',
    requiresAuth: true
  },
  {
    title: 'Recruiter',
    href: '/recruiter-request',
    description: 'Solicitar validacion employer',
    requiresAuth: true
  }
]

export const employerNavigationItems: NavigationItem[] = [
  {
    title: 'Workspace',
    href: '/workspace',
    description: 'Empresa, branding y miembros',
    requiresAuth: true,
    requiredPermission: 'workspace:read'
  },
  {
    title: 'Vacantes',
    href: '/jobs/manage',
    description: 'Gestiona jobs y discovery',
    requiresAuth: true,
    requiredPermission: 'workspace:read'
  },
  {
    title: 'Talento',
    href: '/talent',
    description: 'Buscar candidatos visibles',
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
    title: 'Console',
    href: '/internal',
    description: 'Centro interno',
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
