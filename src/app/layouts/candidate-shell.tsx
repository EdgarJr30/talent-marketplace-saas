import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { filterNavigationItems } from '@/lib/permissions/guards'
import { cn } from '@/lib/utils/cn'
import { candidateNavigationItems } from '@/shared/constants/navigation'

export function CandidateShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()
  const visibleNavigation = filterNavigationItems(candidateNavigationItems, session.permissions, session.isAuthenticated)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#eef2f7_100%)]">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-semibold text-zinc-950">Tu espacio de talento</p>
            <p className="text-sm text-zinc-500">Perfil reusable, vacantes y seguimiento de tus aplicaciones.</p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {visibleNavigation.map((item) => (
              <button
                key={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  location.pathname === item.href ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                )}
                type="button"
                onClick={() => void navigate(item.href)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <Button variant="outline" onClick={() => void navigate('/jobs')}>
            Ver jobs
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white/96 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {visibleNavigation.slice(0, 4).map((item) => (
            <button
              key={item.href}
              className={cn(
                'rounded-2xl px-3 py-3 text-center text-xs font-semibold transition',
                location.pathname === item.href ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              )}
              type="button"
              onClick={() => void navigate(item.href)}
            >
              {item.title}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
