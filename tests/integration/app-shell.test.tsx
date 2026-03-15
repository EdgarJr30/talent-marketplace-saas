import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { appRoutes } from '@/app/router/routes'

describe('route shells', () => {
  it('renders the public shell without authenticated dashboard navigation for guests', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/']
    })

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )

    expect(await screen.findByText('Talent Marketplace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jobs' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Crear cuenta' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    expect(screen.queryByText('Internal console')).not.toBeInTheDocument()
  })

  it('renders auth as an isolated shell', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/auth/sign-in']
    })

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )

    expect(await screen.findByText('Entra a tu cuenta')).toBeInTheDocument()
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    expect(screen.queryByText('Pipeline')).not.toBeInTheDocument()
  })
})
