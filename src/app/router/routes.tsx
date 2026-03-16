import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import { ApplicationsOverviewPage } from '@/features/applications/pages/applications-overview-page'
import { JobApplicationPage } from '@/features/applications/pages/job-application-page'
import { AuthConfirmPage } from '@/features/auth/pages/auth-confirm-page'
import { AuthPage } from '@/features/auth/pages/auth-page'
import { BootstrapOwnerPage } from '@/features/auth/pages/bootstrap-owner-page'
import { OnboardingPage } from '@/features/auth/pages/onboarding-page'
import { SignInPage } from '@/features/auth/pages/sign-in-page'
import { SignUpPage } from '@/features/auth/pages/sign-up-page'
import { CandidateProfilePage } from '@/features/candidate-profile/pages/candidate-profile-page'
import { ErrorLogReviewPage } from '@/features/error-monitoring/pages/error-log-review-page'
import { InternalConsolePage } from '@/features/internal/pages/internal-console-page'
import { JobDetailPage } from '@/features/jobs/pages/job-detail-page'
import { JobsOverviewPage } from '@/features/jobs/pages/jobs-overview-page'
import { ModerationOverviewPage } from '@/features/moderation/pages/moderation-overview-page'
import { PipelineBoardPage } from '@/features/pipeline/pages/pipeline-board-page'
import { PlatformOpsDashboardPage } from '@/features/platform-ops/pages/platform-ops-dashboard-page'
import { RbacOverviewPage } from '@/features/rbac/pages/rbac-overview-page'
import { RecruiterRequestPage } from '@/features/recruiter-requests/pages/recruiter-request-page'
import { RecruiterReviewPage } from '@/features/recruiter-requests/pages/recruiter-review-page'
import { TalentDirectoryPage } from '@/features/talent/pages/talent-directory-page'
import { WorkspaceOverviewPage } from '@/features/tenants/pages/workspace-overview-page'
import { AuthShell } from '@/app/layouts/auth-shell'
import { CandidateShell } from '@/app/layouts/candidate-shell'
import { EmployerShell } from '@/app/layouts/employer-shell'
import { InternalShell } from '@/app/layouts/internal-shell'
import { PublicShell } from '@/app/layouts/public-shell'
import { RequireAuth, RequireInternalAccess, RequirePermission } from '@/lib/auth/guards'
import { HomePage } from '@/pages/home-page'
import { OfflinePage } from '@/pages/offline-page'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicShell />,
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
        path: 'offline',
        element: <OfflinePage />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthShell />,
    children: [
      {
        index: true,
        element: <AuthPage />
      },
      {
        path: 'sign-in',
        element: <SignInPage />
      },
      {
        path: 'sign-up',
        element: <SignUpPage />
      },
      {
        path: 'confirm',
        element: <AuthConfirmPage />
      }
    ]
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <CandidateShell />
      </RequireAuth>
    ),
    children: [
      {
        path: 'onboarding',
        element: <OnboardingPage />
      },
      {
        path: 'recruiter-request',
        element: <RecruiterRequestPage />
      },
      {
        path: 'candidate/profile',
        element: <CandidateProfilePage />
      },
      {
        path: 'applications',
        element: <ApplicationsOverviewPage />
      },
      {
        path: 'jobs/:jobSlug/apply',
        element: <JobApplicationPage />
      }
    ]
  },
  {
    path: '/',
    element: (
      <RequirePermission permission="workspace:read">
        <EmployerShell />
      </RequirePermission>
    ),
    children: [
      {
        path: 'workspace',
        element: <WorkspaceOverviewPage />
      },
      {
        path: 'jobs/manage',
        element: <JobsOverviewPage />
      },
      {
        path: 'talent',
        element: (
          <RequirePermission permission="candidate_directory:read">
            <TalentDirectoryPage />
          </RequirePermission>
        )
      },
      {
        path: 'pipeline',
        element: (
          <RequirePermission permission="application:read">
            <PipelineBoardPage />
          </RequirePermission>
        )
      },
      {
        path: 'rbac',
        element: (
          <RequirePermission permission="role:read">
            <RbacOverviewPage />
          </RequirePermission>
        )
      }
    ]
  },
  {
    path: '/internal',
    element: (
      <RequireInternalAccess>
        <InternalShell />
      </RequireInternalAccess>
    ),
    children: [
      {
        index: true,
        element: <InternalConsolePage />
      },
      {
        path: 'approvals',
        element: (
          <RequirePermission permission="recruiter_request:review">
            <RecruiterReviewPage />
          </RequirePermission>
        )
      },
      {
        path: 'platform',
        element: (
          <RequirePermission permission="platform_dashboard:read">
            <PlatformOpsDashboardPage />
          </RequirePermission>
        )
      },
      {
        path: 'moderation',
        element: (
          <RequirePermission permission="moderation:read">
            <ModerationOverviewPage />
          </RequirePermission>
        )
      },
      {
        path: 'errors',
        element: (
          <RequirePermission permission="audit_log:read">
            <ErrorLogReviewPage />
          </RequirePermission>
        )
      },
      {
        path: 'bootstrap-owner',
        element: <BootstrapOwnerPage />
      }
    ]
  },
  {
    path: '/auth/bootstrap-owner',
    element: <Navigate replace to="/internal/bootstrap-owner" />
  },
  {
    path: '/admin/recruiter-requests',
    element: <Navigate replace to="/internal/approvals" />
  },
  {
    path: '/admin/platform',
    element: <Navigate replace to="/internal/platform" />
  },
  {
    path: '/admin/moderation',
    element: <Navigate replace to="/internal/moderation" />
  },
  {
    path: '/admin/errors',
    element: <Navigate replace to="/internal/errors" />
  }
]
