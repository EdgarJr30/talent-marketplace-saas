import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-[20px] border bg-[var(--app-surface)] px-4 py-3 text-base text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-subtle)] focus:border-accent-300 focus:ring-2 focus:ring-[var(--app-ring)]',
        className
      )}
      {...props}
    />
  )
}
