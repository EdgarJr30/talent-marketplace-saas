import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { surfacePaths } from '@/app/router/surface-paths'

export type AppSurface = 'institutional' | 'storefront' | 'auth' | 'candidate' | 'workspace' | 'admin'
export type SurfaceStatusKind = 'not-found' | 'forbidden'

function getSurfaceStatusContent(surface: AppSurface, kind: SurfaceStatusKind) {
  if (kind === 'forbidden') {
    switch (surface) {
      case 'candidate':
        return {
          eyebrow: 'Acceso restringido',
          title: 'No puedes abrir esta vista de talento',
          description: 'Tu sesión sigue activa, pero esta sección no está disponible para tu acceso actual.',
          actionLabel: 'Ir a mi perfil',
          actionHref: surfacePaths.candidate.profile
        }
      case 'workspace':
        return {
          eyebrow: 'Acceso restringido',
          title: 'No puedes abrir esta vista del workspace',
          description: 'Tu sesión pertenece al workspace, pero este módulo requiere un permiso adicional.',
          actionLabel: 'Volver al workspace',
          actionHref: surfacePaths.workspace.root
        }
      case 'admin':
        return {
          eyebrow: 'Acceso restringido',
          title: 'No puedes abrir esta vista administrativa',
          description: 'La consola de plataforma reconoce tu sesión, pero no tienes el permiso necesario para esta sección.',
          actionLabel: 'Volver al admin',
          actionHref: surfacePaths.admin.root
        }
      case 'auth':
        return {
          eyebrow: 'Acceso restringido',
          title: 'Este flujo no está disponible ahora mismo',
          description: 'Vuelve al acceso principal para continuar desde una ruta válida.',
          actionLabel: 'Ir a sign in',
          actionHref: surfacePaths.auth.signIn
        }
      case 'institutional':
        return {
          eyebrow: 'Acceso restringido',
          title: 'No puedes abrir esta página institucional',
          description: 'Vuelve al portal principal de ASI para continuar desde una ruta válida.',
          actionLabel: 'Volver al portal',
          actionHref: surfacePaths.institutional.home
        }
      default:
        return {
          eyebrow: 'Acceso restringido',
          title: 'No puedes abrir esta sección',
          description: 'Esta vista no está disponible para tu sesión actual.',
          actionLabel: 'Volver a la plataforma',
          actionHref: surfacePaths.storefront.home
        }
    }
  }

  switch (surface) {
    case 'institutional':
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esa página institucional',
        description: 'El portal institucional sigue disponible, pero esta ruta no forma parte de la navegación principal.',
        actionLabel: 'Ir al home institucional',
        actionHref: surfacePaths.institutional.home
      }
    case 'candidate':
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esa pantalla de talento',
        description: 'La app de candidato sigue disponible, pero esta ruta ya no existe o no forma parte del flujo actual.',
        actionLabel: 'Ir a mi perfil',
        actionHref: surfacePaths.candidate.profile
      }
    case 'workspace':
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esa pantalla del workspace',
        description: 'El workspace sigue activo, pero esta ruta no pertenece a la experiencia canónica de empresa.',
        actionLabel: 'Volver al workspace',
        actionHref: surfacePaths.workspace.root
      }
    case 'admin':
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esa pantalla administrativa',
        description: 'La consola admin sigue disponible, pero esta ruta no pertenece a la navegación operativa actual.',
        actionLabel: 'Volver al admin',
        actionHref: surfacePaths.admin.root
      }
    case 'auth':
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esa pantalla de acceso',
        description: 'Vuelve al flujo principal de autenticación para continuar desde una ruta válida.',
        actionLabel: 'Ir a sign in',
        actionHref: surfacePaths.auth.signIn
      }
    default:
      return {
        eyebrow: 'Ruta no encontrada',
        title: 'No encontramos esta página de plataforma',
        description: 'La landing comercial y los jobs públicos siguen disponibles dentro de la plataforma, pero esta ruta no forma parte de esa experiencia.',
        actionLabel: 'Volver a la plataforma',
        actionHref: surfacePaths.storefront.home
      }
  }
}

export function SurfaceStatusPage({
  surface,
  kind
}: {
  surface: AppSurface
  kind: SurfaceStatusKind
}) {
  const navigate = useNavigate()
  const content = getSurfaceStatusContent(surface, kind)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <EmptyState
        title={content.title}
        description={content.description}
        actionLabel={content.actionLabel}
        onAction={() => void navigate(content.actionHref)}
      />
    </div>
  )
}
