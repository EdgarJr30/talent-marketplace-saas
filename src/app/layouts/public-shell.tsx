import { Outlet, useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'

export function PublicShell() {
  const navigate = useNavigate()
  const session = useAppSession()

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#07111c_0%,#0b1020_34%,#eef2f7_34%,#eef2f7_100%)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111d]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3 text-left text-white" type="button" onClick={() => void navigate('/')}>
            <span className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-zinc-900">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
              Talent Marketplace
            </span>
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <Button className="border-white/15 bg-transparent text-white hover:bg-white/10" variant="ghost" onClick={() => void navigate('/jobs')}>
              Jobs
            </Button>
            <Button className="border-white/20 bg-transparent text-white hover:bg-white/10" variant="outline" onClick={() => void navigate('/auth/sign-up')}>
              Crear cuenta
            </Button>
            <Button onClick={() => void navigate(session.isAuthenticated ? '/candidate/profile' : '/auth/sign-in')}>
              {session.isAuthenticated ? 'Abrir app' : 'Entrar'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
