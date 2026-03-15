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
    <section className="rounded-[32px] border border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18)_0,transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16)_0,transparent_22%),linear-gradient(180deg,#080b16_0%,#0a1020_52%,#08131a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(2,6,23,0.35)] sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/12 px-4 py-2 text-sm text-sky-200">
        <span className="h-2 w-2 rounded-full bg-sky-300" />
        {eyebrow}
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">{description}</p>
      </div>

      <div className="mt-8 grid gap-3">
        {[
          'Todos los usuarios entran primero como usuarios normales.',
          'El onboarding completa la identidad base antes de operar la plataforma.',
          'El acceso recruiter nace solo tras validacion administrativa.'
        ].map((item) => (
          <div key={item} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-zinc-200">
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
