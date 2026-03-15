import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signInWithPassword, toErrorMessage } from '@/features/auth/lib/auth-api'
import { signInSchema, type SignInValues } from '@/features/auth/lib/auth-schemas'
import { AuthHeroPanel } from '@/features/auth/components/auth-hero-panel'
import { reportErrorWithToast } from '@/lib/errors/error-reporting'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-600">{message}</p>
}

export function SignInPage() {
  const navigate = useNavigate()
  const session = useAppSession()
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  if (!session.isSupabaseConfigured) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Supabase aun no esta configurado</CardTitle>
          <CardDescription>
            Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para habilitar acceso, onboarding y aprobaciones.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (session.isAuthenticated) {
    return <Navigate replace to={session.permissions.includes('workspace:read') ? '/workspace' : '/candidate/profile'} />
  }

  async function handleSubmit(values: SignInValues) {
    try {
      await signInWithPassword(values)
      toast.success('Sesion iniciada', {
        description: 'Ya puedes continuar tu perfil o entrar al workspace que te corresponda.'
      })
      await session.refresh()
      await navigate('/onboarding')
    } catch (error) {
      await reportErrorWithToast({
        title: 'No pudimos iniciar sesion',
        source: 'auth.sign-in',
        route: '/auth/sign-in',
        userId: session.authUser?.id ?? null,
        error,
        description: toErrorMessage(error),
        userMessage: 'No pudimos iniciar sesion con esas credenciales.'
      })
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <AuthHeroPanel
        eyebrow="Acceso"
        title="Inicia sesion y retoma tu hiring o tu perfil desde donde lo dejaste"
        description="La experiencia de acceso ahora queda aislada del resto del producto para mantener un recorrido mas limpio, directo y confiable."
      />

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700">
            Iniciar sesion
          </div>
          <CardTitle>Entra a tu cuenta</CardTitle>
          <CardDescription>
            Usa tu correo y contrasena para continuar onboarding, revisar vacantes o abrir tu workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
            <label className="space-y-2 text-sm font-medium text-zinc-800">
              <span>Email</span>
              <Input autoComplete="email" placeholder="tu@correo.com" type="email" {...form.register('email')} />
              <FieldError message={form.formState.errors.email?.message} />
            </label>

            <label className="space-y-2 text-sm font-medium text-zinc-800">
              <span>Contrasena</span>
              <Input autoComplete="current-password" placeholder="Tu contrasena" type="password" {...form.register('password')} />
              <FieldError message={form.formState.errors.password?.message} />
            </label>

            <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-600">
            Aun no tienes cuenta?{' '}
            <Link className="font-semibold text-emerald-700" to="/auth/sign-up">
              Crea tu cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
