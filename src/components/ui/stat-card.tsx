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
        'rounded-[20px] border border-(--app-border) bg-(--app-surface-elevated) px-4 py-4 shadow-[0_14px_34px_rgba(10,18,36,0.07)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.18)]',
        className
      )}
      {...props}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--app-text-subtle)">{label}</p>
      <p className="mt-3 text-[1.3rem] font-semibold tracking-tight text-(--app-text) sm:text-[1.55rem]">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-5 text-(--app-text-muted)">{helper}</p> : null}
    </div>
  )
}
