import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleHelp,
  FileText,
  HandHeart,
  HeartHandshake,
  Layers3,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Workflow,
  X
} from 'lucide-react'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

type BillingFrequency = 'monthly' | 'annually'
type Tone = 'info' | 'success' | 'warning' | 'default'

const heroSignals = [
  'Perfiles reutilizables para candidatos y equipos',
  'Jobs publicos con discovery claro desde mobile',
  'RBAC + multi-tenant desde la arquitectura base'
] as const

const showcaseColumns = [
  [
    {
      eyebrow: 'Candidate profile',
      title: 'Perfil reusable y CV privado',
      description: 'La persona mantiene una identidad profesional viva y aplica sin rehacer formularios.',
      tone: 'info',
      icon: FileText
    }
  ],
  [
    {
      eyebrow: 'Company workspace',
      title: 'Hiring colaborativo por tenant',
      description: 'Vacantes, applicants y equipo viven en un workspace limpio y entendible.',
      tone: 'success',
      icon: Building2
    },
    {
      eyebrow: 'ATS-lite',
      title: 'Pipeline auditable',
      description: 'Stages, notas y ratings quedan ordenados para que decidir sea mas simple.',
      tone: 'warning',
      icon: Workflow
    }
  ],
  [
    {
      eyebrow: 'Governance',
      title: 'Permisos y memberships reales',
      description: 'El producto nace con aislamiento multi-tenant y controles de acceso consistentes.',
      tone: 'default',
      icon: ShieldCheck
    },
    {
      eyebrow: 'PWA-first',
      title: 'Lista para telefono',
      description: 'La experiencia prioriza thumb reach, claridad y continuidad desde cualquier pantalla.',
      tone: 'info',
      icon: Smartphone
    }
  ]
] as const

const featureCards = [
  {
    name: 'Candidate profile reusable',
    description:
      'Cada candidato mantiene perfil, CV privado y visibilidad opt-in para no empezar de cero en cada aplicacion.',
    icon: FileText
  },
  {
    name: 'Company workspace compartido',
    description:
      'Las empresas publican jobs, coordinan equipo y revisan applicants sin mezclar el recorrido del cliente con tooling interno.',
    icon: Building2
  },
  {
    name: 'ATS-lite con contexto',
    description:
      'El pipeline ordena applicants, historial y decisiones con una narrativa clara para recruiters e hiring managers.',
    icon: Workflow
  },
  {
    name: 'RBAC y aislamiento real',
    description:
      'Permisos, memberships y RLS sostienen el producto desde la base para que cada tenant vea solo lo que le corresponde.',
    icon: ShieldCheck
  }
] as const

const workflowPanels = [
  {
    title: 'Discovery publico',
    body: 'Jobs visibles, detalle legible y CTA directos para aplicar o explorar mas roles.',
    icon: BriefcaseBusiness
  },
  {
    title: 'Identidad reutilizable',
    body: 'Candidatos y empresas mantienen una presencia persistente que evita friccion repetida.',
    icon: Layers3
  },
  {
    title: 'Colaboracion de hiring',
    body: 'Notas, ratings y stages viven en un mismo flujo para evitar hojas sueltas y contexto perdido.',
    icon: HeartHandshake
  }
] as const

const billingFrequencies = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'annually', label: 'Anual' }
] as const

const pricingPlans = [
  {
    name: 'Starter',
    featured: false,
    description: 'Para equipos que quieren centralizar jobs y applicants sin complejidad inicial.',
    price: {
      monthly: '$0',
      annually: '$0'
    },
    cadence: {
      monthly: 'por mes',
      annually: 'por ano'
    },
    cta: 'Crear cuenta',
    highlights: ['1 workspace de empresa', 'Hasta 2 jobs activos', 'Perfil candidato reusable', 'Pipeline esencial']
  },
  {
    name: 'Growth',
    featured: true,
    description: 'La capa recomendada para hiring continuo, discovery de talento y trabajo en equipo.',
    price: {
      monthly: '$49',
      annually: '$490'
    },
    cadence: {
      monthly: 'por mes',
      annually: 'por ano'
    },
    cta: 'Solicitar demo',
    highlights: ['Hasta 10 jobs activos', 'Talent directory opt-in', 'Roles y permisos por equipo', 'Alertas y exportes']
  },
  {
    name: 'Scale',
    featured: false,
    description: 'Para organizaciones con rollout, gobierno operativo y necesidades de implementacion mas amplias.',
    price: {
      monthly: 'Custom',
      annually: 'Custom'
    },
    cadence: {
      monthly: 'plan a medida',
      annually: 'plan a medida'
    },
    cta: 'Hablar con ventas',
    highlights: ['Jobs y seats a medida', 'Soporte prioritario', 'Acompanamiento de rollout', 'Operaciones avanzadas']
  }
] as const

const pricingSections = [
  {
    name: 'Hiring core',
    features: [
      { name: 'Jobs publicos', tiers: { Starter: true, Growth: true, Scale: true } },
      { name: 'Jobs activos incluidos', tiers: { Starter: '2', Growth: '10', Scale: 'Unlimited' } },
      { name: 'Pipeline ATS-lite', tiers: { Starter: 'Essential', Growth: 'Advanced', Scale: 'Advanced' } },
      { name: 'Quick apply con perfil reusable', tiers: { Starter: true, Growth: true, Scale: true } }
    ]
  },
  {
    name: 'Colaboracion',
    features: [
      { name: 'Seats de recruiter e hiring manager', tiers: { Starter: '2', Growth: '10', Scale: 'Unlimited' } },
      { name: 'Talent directory opt-in', tiers: { Starter: false, Growth: true, Scale: true } },
      { name: 'Notas y ratings compartidos', tiers: { Starter: false, Growth: true, Scale: true } },
      { name: 'Alertas y exportes', tiers: { Starter: false, Growth: true, Scale: true } }
    ]
  },
  {
    name: 'Gobierno',
    features: [
      { name: 'RBAC por tenant', tiers: { Starter: true, Growth: true, Scale: true } },
      { name: 'Aprobacion recruiter', tiers: { Starter: false, Growth: true, Scale: true } },
      { name: 'Acompanamiento de implementacion', tiers: { Starter: false, Growth: false, Scale: true } },
      { name: 'Soporte prioritario', tiers: { Starter: false, Growth: false, Scale: true } }
    ]
  }
] as const

const faqs = [
  {
    question: 'Que problema resuelve esta plataforma?',
    answer:
      'Unifica discovery publico, candidate profile reusable, workspace employer y ATS-lite colaborativo dentro de una sola app mobile-first.'
  },
  {
    question: 'La plataforma soporta multiples tenants y equipos?',
    answer:
      'Si. El producto nace con memberships, tenant roles y permisos para que una persona pueda operar en mas de un tenant sin mezclar accesos ni contexto.'
  },
  {
    question: 'Como se habilita el acceso employer?',
    answer:
      'El signup crea un usuario estandar. El acceso recruiter y la creacion del workspace se habilitan por aprobacion administrativa para mantener control operacional.'
  },
  {
    question: 'Puedo usarla desde el telefono como app real?',
    answer:
      'Si. El proyecto es PWA-first y la navegacion prioriza uso diario desde mobile, incluyendo jobs publicos, perfil y tareas de hiring recurrentes.'
  },
  {
    question: 'La donacion o sponsorship ya procesa pagos?',
    answer:
      'Todavia no. La superficie esta presente para validar la experiencia comercial y el roadmap, pero el procesamiento de pagos sigue desactivado por ahora.'
  }
] as const

const footerNavigation = [
  { label: 'Como funciona', section: 'features' },
  { label: 'Pricing', section: 'pricing' },
  { label: 'FAQ', section: 'faq' },
  { label: 'Jobs', route: '/jobs' },
  { label: 'Crear cuenta', route: '/auth/sign-up' }
] as const

const footerSignals = [
  { label: 'PWA-first', icon: Smartphone },
  { label: 'RBAC-first', icon: ShieldCheck },
  { label: 'Multi-tenant', icon: Layers3 },
  { label: 'Public jobs', icon: BriefcaseBusiness }
] as const

function toneClasses(tone: Tone) {
  if (tone === 'info') {
    return 'bg-[var(--app-info-surface)]'
  }

  if (tone === 'success') {
    return 'bg-[var(--app-success-surface)]'
  }

  if (tone === 'warning') {
    return 'bg-[var(--app-warning-surface)]'
  }

  return 'bg-[var(--app-surface)]'
}

function renderTierValue(value: boolean | string, featured: boolean) {
  if (typeof value === 'string') {
    return (
      <span className={cn('text-sm font-semibold', featured ? 'text-primary-700 dark:text-primary-200' : 'text-[var(--app-text)]')}>
        {value}
      </span>
    )
  }

  return value ? (
    <>
      <Check className="mx-auto size-5 text-primary-600 dark:text-primary-300" />
      <span className="sr-only">Incluido</span>
    </>
  ) : (
    <>
      <X className="mx-auto size-5 text-[var(--app-text-subtle)]" />
      <span className="sr-only">No incluido</span>
    </>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const session = useAppSession()
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly')

  const primaryAction = session.isAuthenticated
    ? session.permissions.includes('workspace:read')
      ? { label: 'Abrir workspace', href: '/workspace' }
      : { label: 'Completar mi perfil', href: '/candidate/profile' }
    : { label: 'Crear cuenta', href: '/auth/sign-up' }

  const footerYear = new Date().getFullYear()

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="overflow-hidden bg-[var(--app-canvas)]">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[54rem] opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 14%, rgba(94, 169, 125, 0.22), transparent 24%), radial-gradient(circle at 86% 10%, rgba(93, 136, 187, 0.18), transparent 24%), radial-gradient(circle at 82% 34%, rgba(229, 146, 103, 0.18), transparent 20%)'
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pb-32 lg:pt-36">
          <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
            <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
              <Badge className="bg-white/80 text-[var(--app-text)] shadow-[var(--app-shadow-card)] backdrop-blur-sm" variant="outline">
                Recruiting SaaS client-ready
              </Badge>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance text-[var(--app-text)] sm:text-6xl lg:text-7xl">
                Contrata, descubre talento y mueve tu hiring desde una sola experiencia que se siente lista para cliente
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
                La plataforma une jobs publicos, candidate profiles reutilizables, workspace employer y ATS-lite
                colaborativo con una base multi-tenant, RBAC-first y mobile-first.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button className="sm:min-w-44" onClick={() => void navigate(primaryAction.href)}>
                  {primaryAction.label}
                </Button>
                <Button className="sm:min-w-44" variant="outline" onClick={() => void navigate('/jobs')}>
                  Explorar jobs
                </Button>
                <Button className="sm:min-w-44" variant="ghost" onClick={() => scrollToSection('pricing')}>
                  Ver pricing
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {heroSignals.map((signal) => (
                  <span
                    key={signal}
                    className="inline-flex items-center gap-2 rounded-full border bg-white/72 px-4 py-2 text-sm text-[var(--app-text-muted)] shadow-[var(--app-shadow-card)] backdrop-blur-sm"
                  >
                    <BadgeCheck className="size-4 text-primary-600 dark:text-primary-300" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-14 flex justify-end gap-4 sm:-mt-16 sm:justify-start sm:pl-14 lg:mt-0 lg:pl-0">
              {showcaseColumns.map((column, columnIndex) => (
                <div
                  key={`showcase-column-${columnIndex + 1}`}
                  className={cn(
                    'w-40 flex-none space-y-4 sm:w-44',
                    columnIndex === 0 && 'pt-28 sm:pt-52 lg:order-last lg:pt-36 xl:order-none xl:pt-52',
                    columnIndex === 1 && 'pt-12 sm:pt-28 lg:pt-20',
                    columnIndex === 2 && 'pt-32 sm:pt-0'
                  )}
                >
                  {column.map((panel) => {
                    const Icon = panel.icon

                    return (
                      <div
                        key={panel.title}
                        className={cn(
                          'rounded-[28px] border p-5 shadow-[var(--app-shadow-floating)] backdrop-blur-sm',
                          toneClasses(panel.tone)
                        )}
                      >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/90 shadow-[var(--app-shadow-card)]">
                          <Icon className="size-5 text-[var(--app-text)]" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
                          {panel.eyebrow}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">{panel.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{panel.description}</p>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-canvas)] py-24 sm:py-28" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-14 sm:gap-y-18 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <div className="col-span-2">
              <Badge variant="soft">Plataforma</Badge>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-[var(--app-text)] sm:text-5xl">
                Todo el recruiting SaaS se presenta como producto, no como un panel improvisado
              </h2>
              <p className="mt-6 text-lg leading-8 text-[var(--app-text-muted)]">
                Cada recorrido conserva su propio contexto. El publico descubre oportunidades, las empresas operan
                hiring colaborativo y la plataforma mantiene gobierno sin contaminar la experiencia del cliente.
              </p>
            </div>

            <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon

                return (
                  <div key={feature.name}>
                    <dt className="text-base font-semibold text-[var(--app-text)]">
                      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[var(--app-info-surface)] shadow-[var(--app-shadow-card)]">
                        <Icon className="size-5 text-primary-700 dark:text-primary-200" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-1 text-base leading-7 text-[var(--app-text-muted)]">{feature.description}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:flex lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-12 lg:mx-0 lg:max-w-none lg:min-w-full lg:flex-none lg:gap-y-8">
            <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
              <Badge variant="outline">Valor del producto</Badge>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-[var(--app-text)] sm:text-5xl">
                Una sola base para candidatos, empresas y hiring teams que necesitan continuidad real
              </h2>
              <p className="mt-6 text-xl leading-8 text-[var(--app-text-muted)]">
                El producto ya separa discovery publico, autenticacion, trabajo operativo e internal ops para que cada
                audiencia vea solo lo que le toca ver.
              </p>
              <p className="mt-6 text-base leading-7 text-[var(--app-text-muted)]">
                Esa claridad vuelve creible la app desde el primer vistazo y prepara el terreno para demos, onboarding
                comercial y crecimiento del hiring loop sin volver al caos de tabs, hojas y correos sueltos.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button onClick={() => void navigate(primaryAction.href)}>
                  {primaryAction.label}
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" onClick={() => scrollToSection('faq')}>
                  Resolver dudas
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-end gap-4 sm:gap-6 lg:contents">
              <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                <div className="w-full max-w-[30rem] rounded-[32px] border bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-floating)]">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--app-success-surface)]">
                      <Sparkles className="size-5 text-primary-700 dark:text-primary-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-text)]">Experiencia comercial lista</p>
                      <p className="text-sm text-[var(--app-text-muted)]">Hero, pricing, FAQ y CTA alineados al producto</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] bg-[var(--app-info-surface)] px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--app-text)]">Discovery</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                        Jobs publicos, detalle limpio y acceso rapido a aplicar.
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-[var(--app-warning-surface)] px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--app-text)]">Permisos</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                        Tenant roles y memberships reales desde el MVP.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[34rem] lg:items-start lg:justify-end lg:gap-x-6">
                {workflowPanels.map((panel, panelIndex) => {
                  const Icon = panel.icon

                  return (
                    <div
                      key={panel.title}
                      className={cn(
                        'flex w-full max-w-[20rem] flex-none justify-end',
                        panelIndex === 0 && 'order-first self-end max-sm:w-full lg:w-auto',
                        panelIndex === 1 && 'max-sm:w-full',
                        panelIndex === 2 && 'hidden sm:flex lg:w-auto'
                      )}
                    >
                      <div className="w-full rounded-[30px] border bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)]">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--app-surface-muted)]">
                          <Icon className="size-5 text-[var(--app-text)]" />
                        </div>
                        <p className="mt-5 text-lg font-semibold text-[var(--app-text)]">{panel.title}</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">{panel.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="group/tiers isolate overflow-hidden" id="pricing">
        <div className="flow-root border-b border-b-transparent bg-[var(--app-text)] pt-24 pb-16 sm:pt-28 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative z-10">
              <Badge className="border-white/20 bg-white/10 text-white" variant="outline">
                Pricing
              </Badge>
              <h2 className="mx-auto mt-6 max-w-4xl text-center text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                Pricing claro para equipos que quieren dejar atras el hiring improvisado
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-white/72 sm:text-xl/8">
                Planes visibles, comparacion entendible y recorrido comercial listo incluso antes de conectar billing
                real.
              </p>

              <div className="mt-14 flex justify-center">
                <fieldset aria-label="Frecuencia de pago">
                  <div className="grid grid-cols-2 gap-x-1 rounded-full bg-white/8 p-1 text-center text-xs font-semibold text-white">
                    {billingFrequencies.map((frequency) => (
                      <label
                        key={frequency.value}
                        className={cn(
                          'cursor-pointer rounded-full px-3 py-2 transition',
                          billingFrequency === frequency.value ? 'bg-primary-500 text-white' : 'text-white/72'
                        )}
                      >
                        <input
                          checked={billingFrequency === frequency.value}
                          className="sr-only"
                          name="billing-frequency"
                          type="radio"
                          value={frequency.value}
                          onChange={() => setBillingFrequency(frequency.value)}
                        />
                        {frequency.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:-mb-14 lg:max-w-none lg:grid-cols-3 lg:gap-x-6">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[-10rem] hidden h-72 rounded-full blur-3xl lg:block"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(94, 169, 125, 0.32), transparent 54%), radial-gradient(circle at 78% 42%, rgba(93, 136, 187, 0.26), transparent 48%)'
                }}
              />

              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    'relative rounded-[28px] border p-8 xl:p-10',
                    plan.featured
                      ? 'z-10 bg-white shadow-[var(--app-shadow-floating)]'
                      : 'bg-white/6 text-white shadow-[0_20px_48px_rgba(0,0,0,0.16)] backdrop-blur-sm'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      className={cn(
                        plan.featured ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-white/18 bg-white/10 text-white'
                      )}
                      variant="outline"
                    >
                      {plan.featured ? 'Recomendado' : 'Plan'}
                    </Badge>
                    <p className={cn('text-sm', plan.featured ? 'text-[var(--app-text-subtle)]' : 'text-white/70')}>
                      {billingFrequency === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                    </p>
                  </div>

                  <h3 className={cn('mt-5 text-xl font-semibold', plan.featured ? 'text-[var(--app-text)]' : 'text-white')}>
                    {plan.name}
                  </h3>
                  <p className={cn('mt-2 text-sm leading-6', plan.featured ? 'text-[var(--app-text-muted)]' : 'text-white/74')}>
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-end gap-3">
                    <p className={cn('text-4xl font-semibold tracking-tight', plan.featured ? 'text-[var(--app-text)]' : 'text-white')}>
                      {plan.price[billingFrequency]}
                    </p>
                    <p className={cn('pb-1 text-sm', plan.featured ? 'text-[var(--app-text-muted)]' : 'text-white/72')}>
                      {plan.cadence[billingFrequency]}
                    </p>
                  </div>

                  <ul
                    className={cn(
                      'mt-8 space-y-3 border-t pt-6 text-sm leading-6',
                      plan.featured ? 'border-[var(--app-border)] text-[var(--app-text-muted)]' : 'border-white/10 text-white/82'
                    )}
                    role="list"
                  >
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <Check className={cn('mt-0.5 size-5 shrink-0', plan.featured ? 'text-primary-600' : 'text-primary-300')} />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn('mt-8 w-full', !plan.featured && 'border-white/12 bg-white/10 text-white hover:bg-white/18')}
                    variant={plan.featured ? 'primary' : 'outline'}
                    onClick={() => void navigate(plan.name === 'Starter' ? '/auth/sign-up' : '/auth/sign-in')}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-[var(--app-canvas-strong)] lg:pt-14">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
            <section aria-labelledby="mobile-pricing-comparison" className="lg:hidden">
              <h2 className="sr-only" id="mobile-pricing-comparison">
                Comparacion de planes
              </h2>

              <div className="mx-auto max-w-2xl space-y-14">
                {pricingPlans.map((plan) => (
                  <div key={plan.name} className="border-t border-[var(--app-border)] pt-10">
                    <div
                      className={cn(
                        '-mt-px w-72 border-t-2 pt-8 md:w-80',
                        plan.featured ? 'border-primary-500' : 'border-transparent'
                      )}
                    >
                      <h3 className={cn('text-sm font-semibold', plan.featured ? 'text-primary-700 dark:text-primary-200' : 'text-[var(--app-text)]')}>
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">{plan.description}</p>
                    </div>

                    <div className="mt-8 space-y-8">
                      {pricingSections.map((section) => (
                        <div key={section.name}>
                          <h4 className="text-sm font-semibold text-[var(--app-text)]">{section.name}</h4>
                          <div className="mt-5 rounded-[24px] border bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
                            <dl className="divide-y text-sm leading-6">
                              {section.features.map((feature) => (
                                <div key={feature.name} className="flex items-center justify-between gap-4 px-4 py-3">
                                  <dt className="pr-4 text-[var(--app-text-muted)]">{feature.name}</dt>
                                  <dd className="flex min-w-20 items-center justify-end">
                                    {renderTierValue(feature.tiers[plan.name], plan.featured)}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="desktop-pricing-comparison" className="hidden lg:block">
              <h2 className="sr-only" id="desktop-pricing-comparison">
                Comparacion de planes
              </h2>

              <div className="grid grid-cols-4 gap-x-8 border-t border-[var(--app-border)] before:block">
                {pricingPlans.map((plan) => (
                  <div key={plan.name} aria-hidden="true" className="-mt-px">
                    <div className={cn('border-t-2 pt-10', plan.featured ? 'border-primary-500' : 'border-transparent')}>
                      <p className={cn('text-sm font-semibold', plan.featured ? 'text-primary-700 dark:text-primary-200' : 'text-[var(--app-text)]')}>
                        {plan.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">{plan.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="-mt-6 space-y-14">
                {pricingSections.map((section) => (
                  <div key={section.name}>
                    <h3 className="text-sm font-semibold text-[var(--app-text)]">{section.name}</h3>
                    <div className="relative -mx-8 mt-8">
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-8 inset-y-0 grid grid-cols-4 gap-x-8 before:block"
                      >
                        <div className="rounded-[24px] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]" />
                        <div className="rounded-[24px] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]" />
                        <div className="rounded-[24px] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]" />
                      </div>

                      <table className="relative w-full border-separate border-spacing-x-8">
                        <thead>
                          <tr className="text-left">
                            <th scope="col">
                              <span className="sr-only">Feature</span>
                            </th>
                            {pricingPlans.map((plan) => (
                              <th key={plan.name} scope="col">
                                <span className="sr-only">{plan.name}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.features.map((feature, featureIndex) => (
                            <tr key={feature.name}>
                              <th
                                className="w-1/4 py-3 pr-4 text-left text-sm font-normal text-[var(--app-text)]"
                                scope="row"
                              >
                                {feature.name}
                                {featureIndex !== section.features.length - 1 ? (
                                  <div className="absolute inset-x-8 mt-3 h-px bg-[var(--app-border)]" />
                                ) : null}
                              </th>
                              {pricingPlans.map((plan) => (
                                <td key={plan.name} className="relative w-1/4 px-4 py-0 text-center">
                                  <span className="relative inline-flex size-full items-center justify-center py-3">
                                    {renderTierValue(feature.tiers[plan.name], plan.featured)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-8 inset-y-0 grid grid-cols-4 gap-x-8 before:block"
                      >
                        {pricingPlans.map((plan) => (
                          <div
                            key={plan.name}
                            className={cn(
                              'rounded-[24px]',
                              plan.featured ? 'ring-2 ring-primary-500' : 'ring-1 ring-[var(--app-border)]'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[30px] border bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)] sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--app-info-surface)]">
                    <WalletCards className="size-5 text-primary-700 dark:text-primary-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">Comercialmente claro desde el MVP</p>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      El pricing ya acompana demos, conversaciones de ventas y evaluaciones internas.
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[var(--app-text-muted)]">
                  Los planes muestran de forma realista el salto entre descubrimiento, colaboracion y gobierno sin
                  fingir que el procesamiento de pagos ya esta activo. La superficie comercial existe, la logica de
                  cobro todavia no.
                </p>
              </div>

              <div className="rounded-[30px] border bg-[var(--app-warning-surface)] p-6 shadow-[var(--app-shadow-card)] sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/80 shadow-[var(--app-shadow-card)]">
                    <HandHeart className="size-5 text-[var(--app-text)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">Donaciones y sponsorships</p>
                    <p className="text-sm text-[var(--app-text-muted)]">Superficie visible del roadmap comercial</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-[var(--app-text-muted)]">
                  Este espacio ya existe para validar la narrativa de apoyo al producto, pero el procesamiento de
                  pagos permanece desactivado hasta conectar billing real.
                </p>
                <Button className="mt-6 w-full" disabled variant="outline">
                  Donaciones proximamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-canvas)]" id="faq">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--app-info-surface)]">
                <CircleHelp className="size-5 text-primary-700 dark:text-primary-200" />
              </div>
              <Badge variant="outline">FAQ</Badge>
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--app-text)] sm:text-5xl">
              Preguntas frecuentes
            </h2>
            <dl className="mt-12 divide-y">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-6 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left text-[var(--app-text)]">
                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                    <span className="flex h-7 items-center">
                      <span className="flex size-7 items-center justify-center rounded-full border bg-[var(--app-surface)] text-[var(--app-text-muted)] transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl pr-8 text-base leading-7 text-[var(--app-text-muted)]">{faq.answer}</p>
                </details>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[36px] border bg-[var(--app-surface)] px-6 py-8 shadow-[var(--app-shadow-floating)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute right-0 bottom-0 h-48 w-48 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle at center, rgba(94, 169, 125, 0.28), transparent 64%)' }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <Badge variant="soft">Siguiente paso</Badge>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-[var(--app-text)] sm:text-5xl">
                  Comparte la landing, empieza demos y abre el hiring loop desde una base que ya se siente producto
                </h2>
                <p className="mt-5 text-base leading-7 text-[var(--app-text-muted)]">
                  Desde aqui puedes llevar usuarios a jobs, signup o workspace sin exponer tooling interno ni sacrificar
                  claridad comercial.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button onClick={() => void navigate(primaryAction.href)}>{primaryAction.label}</Button>
                <Button variant="outline" onClick={() => void navigate('/jobs')}>
                  Explorar jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-[var(--app-canvas)]">
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
          <nav aria-label="Footer" className="-mb-6 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm leading-6">
            {footerNavigation.map((item) =>
              'section' in item ? (
                <button
                  key={item.label}
                  className="text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                  type="button"
                  onClick={() => scrollToSection(item.section)}
                >
                  {item.label}
                </button>
              ) : (
                <button
                  key={item.label}
                  className="text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                  type="button"
                  onClick={() => void navigate(item.route)}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {footerSignals.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text-muted)] shadow-[var(--app-shadow-card)]"
                >
                  <Icon className="size-4 text-primary-600 dark:text-primary-300" />
                  {item.label}
                </div>
              )
            })}
          </div>

          <p className="mt-10 text-center text-sm leading-6 text-[var(--app-text-muted)]">
            &copy; {footerYear} Talent Marketplace SaaS. Public jobs, reusable profiles y ATS-lite colaborativo sobre
            una base multi-tenant.
          </p>
        </div>
      </footer>
    </div>
  )
}
