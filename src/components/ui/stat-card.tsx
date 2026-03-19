import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
  helper?: ReactNode
}

export function StatCard({ label, value, helper, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface-elevated)] px-5 py-5 shadow-[0_18px_42px_rgba(10,18,36,0.08)] dark:shadow-[0_20px_46px_rgba(0,0,0,0.2)]',
        className
      )}
      {...props}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-text-subtle)]">{label}</p>
      <p className="mt-4 text-[1.6rem] font-semibold tracking-tight text-[var(--app-text)] sm:text-[1.85rem]">{value}</p>
      {helper ? <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">{helper}</p> : null}
    </div>
  )
}
