import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-[20px] border bg-[var(--app-surface)] px-4 text-base text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-subtle)] focus:border-accent-300 focus:ring-2 focus:ring-[var(--app-ring)]',
        className
      )}
      {...props}
    />
  )
}
