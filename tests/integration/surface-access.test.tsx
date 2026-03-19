import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { appRoutes } from '@/app/router/routes'
import { surfacePaths } from '@/app/router/surface-paths'

const authState = {
  session: null as null | { user: { id: string; email?: string } },
  snapshot: {
    profile: null,
    memberships: [],
    permissions: [],
    platformPermissions: [],
    isPlatformAdmin: false
  } as {
    profile: { id: string; email: string; is_internal_developer: boolean } | null
    memberships: Array<{
      id: string
      tenantId: string
      tenantName: string
      tenantSlug: string
      roleCodes: string[]
      roleNames: string[]
      permissions: string[]
    }>
    permissions: string[]
    platformPermissions: string[]
    isPlatformAdmin: boolean
  }
}

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: {
          session: authState.session
        }
      })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      }))
    }
  }
}))

vi.mock('@/features/auth/lib/auth-api', async () => {
  const actual = await vi.importActual<typeof import('@/features/auth/lib/auth-api')>('@/features/auth/lib/auth-api')

  return {
    ...actual,
    fetchSessionSnapshot: vi.fn(() => Promise.resolve(authState.snapshot))
  }
})

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry]
  })

  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

beforeEach(() => {
  authState.session = null
  authState.snapshot = {
    profile: null,
    memberships: [],
    permissions: [],
    platformPermissions: [],
    isPlatformAdmin: false
  }
})

describe('surface access states', () => {
  it('redirects /app to the candidate home when the user has no workspace access', async () => {
    authState.session = { user: { id: 'user-0', email: 'candidate@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-0',
        email: 'candidate@example.com',
        is_internal_developer: false
      },
      memberships: [],
      permissions: [],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute(surfacePaths.app.home)

    expect(await screen.findByText('Tu espacio profesional')).toBeInTheDocument()
    expect(screen.getByText('Perfil candidato')).toBeInTheDocument()
  })

  it('redirects /app to the workspace when the user has workspace access', async () => {
    authState.session = { user: { id: 'user-1b', email: 'recruiter@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-1b',
        email: 'recruiter@example.com',
        is_internal_developer: false
      },
      memberships: [
        {
          id: 'membership-1b',
          tenantId: 'tenant-1',
          tenantName: 'Acme',
          tenantSlug: 'acme',
          roleCodes: [],
          roleNames: [],
          permissions: ['workspace:read']
        }
      ],
      permissions: ['workspace:read'],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute(surfacePaths.app.home)

    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('ASI para equipos')).toBeInTheDocument()
    expect(screen.getByText('Publica vacantes, descubre talento y coordina contrataciones con una experiencia clara.')).toBeInTheDocument()
  })

  it('renders candidate not-found inside the candidate shell', async () => {
    authState.session = { user: { id: 'user-1', email: 'candidate@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-1',
        email: 'candidate@example.com',
        is_internal_developer: false
      },
      memberships: [],
      permissions: [],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute('/candidate/nope')

    expect(await screen.findByText('Tu espacio profesional')).toBeInTheDocument()
    expect(screen.getAllByText('No encontramos esa pantalla de talento').length).toBeGreaterThan(0)
  })

  it('renders workspace forbidden inside the workspace shell', async () => {
    authState.session = { user: { id: 'user-2', email: 'recruiter@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-2',
        email: 'recruiter@example.com',
        is_internal_developer: false
      },
      memberships: [
        {
          id: 'membership-1',
          tenantId: 'tenant-1',
          tenantName: 'Acme',
          tenantSlug: 'acme',
          roleCodes: [],
          roleNames: [],
          permissions: ['workspace:read']
        }
      ],
      permissions: ['workspace:read'],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute(surfacePaths.workspace.access)

    expect(await screen.findAllByText('Acme')).toHaveLength(2)
    expect(screen.getAllByText('No puedes abrir esta vista del workspace').length).toBeGreaterThan(0)
  })

  it('renders admin forbidden inside the admin shell', async () => {
    authState.session = { user: { id: 'user-3', email: 'user@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-3',
        email: 'user@example.com',
        is_internal_developer: false
      },
      memberships: [],
      permissions: [],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute(surfacePaths.admin.root)

    expect(await screen.findByText('Platform console')).toBeInTheDocument()
    expect(screen.getAllByText('No puedes abrir esta vista administrativa').length).toBeGreaterThan(0)
  })

  it('renders admin not-found inside the admin shell', async () => {
    authState.session = { user: { id: 'user-4', email: 'admin@example.com' } }
    authState.snapshot = {
      profile: {
        id: 'user-4',
        email: 'admin@example.com',
        is_internal_developer: true
      },
      memberships: [],
      permissions: [],
      platformPermissions: [],
      isPlatformAdmin: false
    }

    renderRoute('/admin/nope')

    expect(await screen.findByText('Platform console')).toBeInTheDocument()
    expect(screen.getAllByText('No encontramos esa pantalla administrativa').length).toBeGreaterThan(0)
  })

  it('redirects unauthenticated workspace access to sign-in', async () => {
    renderRoute(surfacePaths.workspace.root)

    expect(await screen.findByRole('heading', { name: 'Entra a tu cuenta' })).toBeInTheDocument()
  })
})
