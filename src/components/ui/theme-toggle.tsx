import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils/cn'

import { Button } from './button'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const isDark = (resolvedTheme ?? theme) === 'dark'
  const label = isDark ? 'Modo claro' : 'Modo oscuro'
  const Icon = isDark ? SunMedium : MoonStar

  return (
    <Button
      aria-label={label}
      className={cn('h-12 w-12 px-0 sm:w-auto sm:px-4', className)}
      title={label}
      variant="outline"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
