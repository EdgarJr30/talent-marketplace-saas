import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'

export function AuthShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppSession()

  const isSignUp = location.pathname.includes('/sign-up')

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#07111c_0%,#0a1020_38%,#f6f8fb_38%,#eef2f7_100%)]">
      <header className="border-b border-white/10 bg-[#08111d]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900" type="button" onClick={() => void navigate('/')}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Talent Marketplace
          </button>

          <div className="flex items-center gap-3">
            <Button className="border-white/20 bg-transparent text-white hover:bg-white/10" variant="ghost" onClick={() => void navigate('/jobs')}>
              Jobs
            </Button>
            {session.isAuthenticated ? (
              <Button onClick={() => void navigate('/candidate/profile')}>Abrir app</Button>
            ) : (
              <Button
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                variant="outline"
                onClick={() => void navigate(isSignUp ? '/auth/sign-in' : '/auth/sign-up')}
              >
                {isSignUp ? 'Iniciar sesion' : 'Crear cuenta'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
