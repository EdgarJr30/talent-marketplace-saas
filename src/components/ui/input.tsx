import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface-elevated)] px-4 text-base text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-[border-color,background-color,box-shadow,color] duration-200 placeholder:text-[var(--app-text-subtle)] hover:border-primary-300/60 focus:border-primary-400 focus:bg-[var(--app-surface)] focus:ring-2 focus:ring-[var(--app-ring)] dark:hover:border-primary-500/40',
        className
      )}
      {...props}
    />
  )
}
