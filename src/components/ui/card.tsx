import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[26px] border border-(--app-border) p-5 shadow-[0_18px_48px_rgba(10,18,36,0.08)] backdrop-blur-sm sm:p-6 dark:shadow-[0_22px_54px_rgba(0,0,0,0.22)]',
        className
      )}
      style={{
        background: 'var(--app-surface-elevated)'
      }}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2.5', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[1.08rem] font-semibold tracking-tight text-(--app-text) sm:text-[1.22rem]', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-6 text-(--app-text-muted) sm:text-[0.95rem]', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5', className)} {...props} />
}
