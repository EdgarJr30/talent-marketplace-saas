import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions, className, children, ...props }: PageHeaderProps) {
  return (
    <section className={cn('space-y-4', className)} {...props}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2.5">
          {eyebrow ? <div className="tm-kicker">{eyebrow}</div> : null}
          <div className="space-y-1.5">
            <h1 className="tm-page-title">{title}</h1>
            {description ? <p className="tm-page-copy max-w-3xl">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
      </div>
      {children ? <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{children}</div> : null}
    </section>
  )
}
