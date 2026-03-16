import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { AppSidebarNav } from '@/components/ui/app-shell-navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { filterNavigationItems } from '@/lib/permissions/guards'
import { internalNavigationItems } from '@/shared/constants/navigation'

export function InternalShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()
  const visibleNavigation = filterNavigationItems(internalNavigationItems, session.permissions, session.isAuthenticated)
  const currentItem = visibleNavigation.find((item) => item.href === location.pathname)

  return (
    <div className="tm-shell">
      <div className="mx-auto flex min-h-screen max-w-[1420px] gap-6 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <AppSidebarNav
          activeHref={location.pathname}
          brand="Internal only"
          description="Zona restringida para operaciones, aprobaciones, moderación y seguimiento técnico."
          footer={
            <Button className="w-full" variant="outline" onClick={() => void navigate('/')}>
              Volver al producto
            </Button>
          }
          items={visibleNavigation}
          title="Platform console"
          onNavigate={(href) => void navigate(href)}
        />

        <div className="flex min-h-screen flex-1 flex-col gap-5">
          <header className="tm-shell-panel sticky top-4 z-20 rounded-[24px]">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
                  Restricted surface
                </p>
                <p className="text-lg font-semibold tracking-tight text-[var(--app-text)]">
                  {currentItem?.title ?? 'Internal console'}
                </p>
                <p className="text-sm text-[var(--app-text-muted)]">
                  {currentItem?.description ?? 'Herramientas internas separadas del producto que ve el cliente final.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ThemeToggle />
                <Button variant="ghost" onClick={() => void navigate('/internal')}>
                  Overview
                </Button>
                <Button variant="outline" onClick={() => void navigate('/')}>
                  Producto
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
