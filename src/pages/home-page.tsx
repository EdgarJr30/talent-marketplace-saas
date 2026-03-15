import { useNavigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const audienceCards = [
  {
    title: 'Para candidatos',
    description: 'Crea un perfil reusable, guarda tu CV y aplica desde mobile sin rehacer formularios cada vez.',
    cta: 'Completar perfil',
    glyph: 'CA'
  },
  {
    title: 'Para empresas',
    description: 'Publica vacantes, descubre talento visible y coordina hiring con un workspace claro y compartido.',
    cta: 'Abrir workspace',
    glyph: 'EM'
  },
  {
    title: 'Para operaciones',
    description: 'Mantiene aprobaciones, moderacion y observabilidad sin mezclar tooling interno con la experiencia cliente.',
    cta: 'Zona interna',
    glyph: 'OP'
  }
] as const

const workflowSteps = [
  {
    step: '01',
    title: 'Descubre o publica oportunidades',
    description: 'Los candidatos exploran jobs publicos y las empresas publican vacantes desde su workspace.'
  },
  {
    step: '02',
    title: 'Activa tu perfil reusable',
    description: 'Candidato y employer completan su identidad base para operar sobre una capa multi-tenant real.'
  },
  {
    step: '03',
    title: 'Aplica o busca talento',
    description: 'La plataforma soporta aplicaciones end-to-end y sourcing directo de perfiles visibles.'
  },
  {
    step: '04',
    title: 'Gestiona el pipeline',
    description: 'Stages, notas, ratings y alertas mantienen el hiring organizado y trazable.'
  }
] as const

const featureHighlights = [
  'Marketplace publico de vacantes con discovery mobile-first',
  'Perfiles reutilizables con CV privado, completitud y sourcing opt-in',
  'Workspace employer con jobs, applicants, talent search y pipeline',
  'RBAC multi-tenant, RLS, storage privado y trazabilidad desde el primer release'
] as const

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    cadence: '/mes',
    description: 'Para validar el flujo employer con una base pequena y controlada.',
    cta: 'Empezar gratis',
    featured: false,
    features: ['1 workspace', 'Hasta 2 jobs publicados', 'Talent search basico', 'ATS-lite esencial']
  },
  {
    name: 'Growth',
    price: '$49',
    cadence: '/mes',
    description: 'Pensado para equipos que ya operan hiring continuo y necesitan mas capacidad.',
    cta: 'Solicitar demo',
    featured: true,
    features: ['Jobs y applicants ampliados', 'Roles y equipo extendido', 'Export de applicants', 'Alertas y ops mejoradas']
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: '',
    description: 'Para operaciones con gobierno interno, volumen alto y necesidades de rollout controlado.',
    cta: 'Hablar con ventas',
    featured: false,
    features: ['Soporte prioritario', 'Acompanamiento de onboarding', 'Controles internos avanzados', 'Planificacion a medida']
  }
] as const

export function HomePage() {
  const navigate = useNavigate()
  const session = useAppSession()

  const primaryAction = session.isAuthenticated
    ? session.permissions.includes('workspace:read')
      ? { label: 'Abrir workspace', href: '/workspace' }
      : { label: 'Completar mi perfil', href: '/candidate/profile' }
    : { label: 'Crear cuenta', href: '/auth/sign-up' }

  const secondaryAction = session.isAuthenticated
    ? { label: 'Explorar jobs', href: '/jobs' }
    : { label: 'Ver vacantes', href: '/jobs' }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18)_0,transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18)_0,transparent_20%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16)_0,transparent_22%),linear-gradient(180deg,#080b16_0%,#0a1020_52%,#08131a_100%)] px-5 py-5 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:px-8 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/12 px-4 py-2 text-sm text-sky-200">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              Recruiting SaaS mobile-first
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Contrata, descubre talento y opera tu hiring desde una sola experiencia lista para cliente
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Un marketplace de talento con jobs publicos, perfiles reutilizables, sourcing recruiter y pipeline
                colaborativo, pensado primero para mobile y listo para crecer como SaaS.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="sm:min-w-44" onClick={() => void navigate(primaryAction.href)}>
                {primaryAction.label}
              </Button>
              <Button
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 sm:min-w-44"
                variant="outline"
                onClick={() => void navigate(secondaryAction.href)}
              >
                {secondaryAction.label}
              </Button>
              <Button
                className="text-zinc-200 hover:bg-white/10 hover:text-white sm:min-w-44"
                variant="ghost"
                onClick={() => void navigate('/auth/sign-in')}
              >
                Solicitar demo
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: 'Mobile-first',
                  description: 'Los recorridos core priorizan lectura rapida, acciones tactiles y contexto persistente.'
                },
                {
                  title: 'Multi-tenant real',
                  description: 'Permisos, membership y datos separados por tenant desde la base.'
                },
                {
                  title: 'Cliente-ready',
                  description: 'Landing, pricing, jobs y producto listos para compartir en demo.'
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-200">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Todo el hiring en una sola superficie</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">
                    Desde discovery hasta seguimiento del candidato, el producto mantiene una narrativa unificada.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/18 text-sm font-semibold text-emerald-200">
                  SaaS
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {featureHighlights.map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/8 bg-black/18 px-4 py-3 text-sm leading-6 text-zinc-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: 'RLS', label: 'Tenant isolation' },
                { value: 'PWA', label: 'Installable UX' },
                { value: 'Audit', label: 'Ops visibility' }
              ].map((item) => (
                <div key={item.value} className="rounded-[26px] border border-white/10 bg-black/18 px-4 py-5 text-center">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {audienceCards.map((card) => (
          <Card key={card.title} className="border-zinc-200/90 bg-white/96">
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                <span className="text-xs font-semibold tracking-[0.18em]">{card.glyph}</span>
              </div>
              <div className="space-y-2">
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  void navigate(
                    card.title === 'Para candidatos'
                      ? session.isAuthenticated
                        ? '/candidate/profile'
                        : '/auth/sign-up'
                      : card.title === 'Para empresas'
                        ? session.permissions.includes('workspace:read')
                          ? '/workspace'
                          : '/auth/sign-up'
                        : session.canAccessInternalConsole
                          ? '/internal'
                          : '/auth/sign-in'
                  )
                }
              >
                {card.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-white">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              Como funciona
            </div>
            <CardTitle>Un loop completo de hiring sin friccion innecesaria</CardTitle>
            <CardDescription>
              La experiencia publica, autenticada e interna se separa sin romper el flujo principal del producto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="grid gap-3 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,#ffffff,#f8fafc)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
              Capacidades principales
            </div>
            <CardTitle>Todo lo necesario para el MVP del cliente</CardTitle>
            <CardDescription>
              La app ya cubre los modulos core del marketplace y deja el tooling interno fuera del recorrido visible.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              'Auth, onboarding y recruiter approval',
              'Workspace employer con RBAC',
              'Jobs publicos con discovery',
              'Applications y ATS-lite',
              'Talent directory opt-in',
              'Notificaciones, errores y ops internas'
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-zinc-200 bg-white px-4 py-4 text-sm leading-6 text-zinc-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            Pricing
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Planes listos para una experiencia SaaS real</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Aunque el billing todavia no este conectado, la app ya presenta una estructura comercial creible para demo,
            onboarding comercial y futuras integraciones de pago.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? 'border-emerald-300 bg-[linear-gradient(180deg,#ecfdf5,white_30%,#f8fafc)] shadow-[0_18px_40px_rgba(16,185,129,0.12)]'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured ? (
                    <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      Mas elegido
                    </div>
                  ) : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-3xl font-semibold text-zinc-950">{plan.price}</p>
                  <p className="mt-1 text-sm text-zinc-500">{plan.cadence}</p>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="rounded-[18px] border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                      {feature}
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant={plan.featured ? 'primary' : 'outline'} onClick={() => void navigate('/auth/sign-up')}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(145deg,#fff7ed,#ffffff_40%,#fefce8)]">
          <CardHeader>
            <div className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              Donaciones
            </div>
            <CardTitle>Apoya la evolucion del producto</CardTitle>
            <CardDescription>
              Esta seccion queda lista como superficie visual para aportes, comunidad o patrocinio, aunque la logica de
              pago se conecte mas adelante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-zinc-700">
              Si deseas apoyar el crecimiento del proyecto, esta experiencia ya reserva un espacio de producto para
              donaciones one-time o apoyo recurrente. En esta fase solo se construye la UI/UX, sin procesamiento de
              cobro.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-white/85 px-4 py-4 text-sm">Aportes one-time</div>
              <div className="rounded-[22px] bg-white/85 px-4 py-4 text-sm">Patrocinio mensual</div>
              <div className="rounded-[22px] bg-white/85 px-4 py-4 text-sm">Apoyo de comunidad</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button>
                Donar al proyecto
              </Button>
              <Button variant="outline" onClick={() => void navigate('/auth/sign-up')}>
                Hablar con el equipo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,#ffffff,#f7fafc)]">
          <CardHeader>
            <div className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
              Cierre
            </div>
            <CardTitle>Listo para compartir con cliente y comenzar pruebas</CardTitle>
            <CardDescription>
              La app ya presenta una cara comercial clara y conserva su capa interna para admins y developers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-700">
              Comparte el link publico para discovery, pricing y auth. Mantiene el tooling interno fuera del recorrido
              del cliente.
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => void navigate('/jobs')}>
                Explorar jobs
                <span className="ml-2 text-base leading-none">+</span>
              </Button>
              <Button variant="outline" onClick={() => void navigate('/auth/sign-up')}>
                Crear cuenta
              </Button>
              {session.canAccessInternalConsole ? (
                <Button variant="ghost" onClick={() => void navigate('/internal')}>
                  Abrir internal console
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
