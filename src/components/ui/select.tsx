import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-12 w-full rounded-[20px] border bg-[var(--app-surface)] px-4 text-base text-[var(--app-text)] outline-none transition focus:border-accent-300 focus:ring-2 focus:ring-[var(--app-ring)]',
        className
      )}
      {...props}
    />
  )
}
