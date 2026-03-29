import type { RouteObject } from 'react-router-dom'

import { surfacePaths } from '@/app/router/surface-paths'
import { SurfaceStatusPage } from '@/app/router/routes/surface-status-page'
import { JobApplicationPage } from '@/features/applications/pages/job-application-page'
import { JobDetailPage } from '@/features/jobs/pages/job-detail-page'
import { JobsOverviewPage } from '@/features/jobs/pages/jobs-overview-page'
import { RequireAuth } from '@/lib/auth/guards'
import { HomePage } from '@/experiences/storefront/pages/home-page'
import { OfflinePage } from '@/experiences/storefront/pages/offline-page'
import { StorefrontShell } from '@/experiences/storefront/layouts/storefront-shell'

export const storefrontRoutes: RouteObject[] = [
  {
    path: surfacePaths.storefront.home,
    element: <StorefrontShell />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'jobs',
        element: <JobsOverviewPage />
      },
      {
        path: 'jobs/:jobSlug',
        element: <JobDetailPage />
      },
      {
        path: 'jobs/:jobSlug/apply',
        element: (
          <RequireAuth>
            <JobApplicationPage />
          </RequireAuth>
        )
      },
      {
        path: 'offline',
        element: <OfflinePage />
      },
      {
        path: '*',
        element: <SurfaceStatusPage kind="not-found" surface="storefront" />
      }
    ]
  }
]
