import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-12 w-full rounded-[18px] border border-(--app-border) bg-(--app-surface-elevated) px-4 text-base text-(--app-text) shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-primary-300/60 focus:border-primary-400 focus:bg-(--app-surface) focus:ring-2 focus:ring-(--app-ring) dark:hover:border-primary-500/40',
        className
      )}
      {...props}
    />
  )
}
