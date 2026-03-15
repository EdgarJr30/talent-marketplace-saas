import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { filterNavigationItems } from '@/lib/permissions/guards'
import { cn } from '@/lib/utils/cn'
import { internalNavigationItems } from '@/shared/constants/navigation'

export function InternalShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()
  const visibleNavigation = filterNavigationItems(internalNavigationItems, session.permissions, session.isAuthenticated)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09111b_0%,#0a1020_38%,#edf2f7_38%,#edf2f7_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1520px] flex-col xl:flex-row">
        <aside className="hidden w-[288px] shrink-0 border-r border-white/10 bg-[#08111d] px-6 py-8 text-white xl:flex xl:flex-col">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Internal console
            </div>
            <div>
              <p className="text-[2rem] font-semibold tracking-tight">Platform ops</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Zona restringida para approvals, observabilidad, notificaciones y soporte operativo.
              </p>
            </div>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {visibleNavigation.map((item) => (
              <button
                key={item.href}
                className={cn(
                  'rounded-[22px] px-4 py-4 text-left transition',
                  location.pathname === item.href ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:bg-white/8 hover:text-white'
                )}
                type="button"
                onClick={() => void navigate(item.href)}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-current/70">{item.description}</p>
              </button>
            ))}
          </nav>

          <Button className="w-full" variant="outline" onClick={() => void navigate('/')}>
            Volver al producto
          </Button>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/92 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
              <div>
                <p className="text-lg font-semibold text-zinc-950">Internal console</p>
                <p className="text-sm text-zinc-500">Acceso restringido para admins de plataforma y developers internos.</p>
              </div>

              <Button variant="outline" onClick={() => void navigate('/')}>
                Ir al public app
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1232px] flex-1 px-4 pb-14 pt-6 sm:px-6 xl:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
