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
    <section className={cn('space-y-5', className)} {...props}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? <div className="tm-kicker">{eyebrow}</div> : null}
          <div className="space-y-2">
            <h1 className="tm-page-title">{title}</h1>
            {description ? <p className="tm-page-copy max-w-3xl">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div> : null}
    </section>
  )
}
