import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { filterNavigationItems } from '@/lib/permissions/guards'
import { cn } from '@/lib/utils/cn'
import { employerNavigationItems } from '@/shared/constants/navigation'

export function EmployerShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()
  const visibleNavigation = filterNavigationItems(employerNavigationItems, session.permissions, session.isAuthenticated)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#edf1f6_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1520px] flex-col lg:flex-row">
        <aside className="hidden w-[288px] shrink-0 border-r border-zinc-200 bg-[#fbfcfe] px-6 py-8 lg:flex lg:flex-col">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Employer app
            </div>
            <div>
              <p className="text-[2rem] font-semibold tracking-tight text-zinc-950">Workspace</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Vacantes, talento y pipeline con una navegacion clara para trabajo diario del equipo.
              </p>
            </div>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {visibleNavigation.map((item) => (
              <button
                key={item.href}
                className={cn(
                  'rounded-[22px] px-4 py-4 text-left transition',
                  location.pathname === item.href
                    ? 'bg-zinc-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.12)]'
                    : 'text-zinc-600 hover:bg-white hover:text-zinc-950'
                )}
                type="button"
                onClick={() => void navigate(item.href)}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-current/70">{item.description}</p>
              </button>
            ))}
          </nav>

          <div className="rounded-[24px] border border-zinc-200 bg-white px-4 py-4 text-sm leading-6 text-zinc-600">
            Esta capa es operativa: se enfoca en hiring, equipo y ejecucion diaria del tenant employer.
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/92 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1232px] flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
              <div>
                <p className="text-lg font-semibold text-zinc-950">
                  {session.primaryMembership?.tenantName ?? 'Employer workspace'}
                </p>
                <p className="text-sm text-zinc-500">
                  Gestiona vacantes, revisa talento visible y mueve applicants por pipeline.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-12 min-w-0 items-center gap-3 rounded-[22px] border border-zinc-200 bg-zinc-50 px-4 text-zinc-500">
                  <span className="text-sm font-semibold">/</span>
                  <span className="truncate text-sm">Busca una vacante, candidato o modulo</span>
                </div>
                <Button variant="outline" onClick={() => void navigate('/jobs')}>
                  Vista publica
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1232px] flex-1 px-4 pb-28 pt-6 sm:px-6 xl:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
