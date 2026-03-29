import type { RouteObject } from 'react-router-dom'

import { applicationRoutes } from '@/experiences/app/routes'
import { institutionalRoutes } from '@/experiences/institutional/routes'
import { storefrontRoutes } from '@/experiences/storefront/routes'

export const appRoutes: RouteObject[] = [...institutionalRoutes, ...storefrontRoutes, ...applicationRoutes]
