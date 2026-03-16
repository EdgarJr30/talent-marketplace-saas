import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AuthShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()

  const isSignUp = location.pathname.includes('/sign-up')

  return (
    <div className="tm-shell">
      <header className="border-b bg-[color:var(--app-surface-elevated)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button className="tm-kicker" type="button" onClick={() => void navigate('/')}>
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Talent Marketplace
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => void navigate('/jobs')}>
              Jobs
            </Button>
            {session.isAuthenticated ? (
              <Button onClick={() => void navigate('/candidate/profile')}>Abrir app</Button>
            ) : (
              <Button variant="outline" onClick={() => void navigate(isSignUp ? '/auth/sign-in' : '/auth/sign-up')}>
                {isSignUp ? 'Iniciar sesion' : 'Crear cuenta'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
