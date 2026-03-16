import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function AuthHeroPanel({
  eyebrow,
  title,
  description
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="space-y-4">
      <Card className="overflow-hidden bg-[var(--app-surface)]">
        <CardContent className="mt-0 p-6 sm:p-7">
          <Badge>{eyebrow}</Badge>

          <div className="mt-5 space-y-4">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-[var(--app-text)] sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[var(--app-text-muted)] sm:text-base">{description}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              'Cuenta base primero, permisos después.',
              'Onboarding simple antes de entrar a hiring.',
              'Acceso employer solo tras validación.'
            ].map((item) => (
              <div key={item} className="rounded-[20px] border bg-[var(--app-surface)] px-4 py-4 text-sm leading-6 text-[var(--app-text-muted)]">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
