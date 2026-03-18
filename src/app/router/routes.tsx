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
import { AdminConsolePage } from '@/features/internal/pages/admin-console-page'
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
import { AdminShell } from '@/app/layouts/admin-shell'
import { CandidateShell } from '@/app/layouts/candidate-shell'
import { EmployerShell } from '@/app/layouts/employer-shell'
import { PublicShell } from '@/app/layouts/public-shell'
import { surfacePaths } from '@/app/router/surface-paths'
import { AppEntryRedirect } from '@/app/router/routes/app-entry-redirect'
import { RequireAdminAccess, RequireAuth, RequirePermission } from '@/lib/auth/guards'
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
    path: surfacePaths.app.home,
    element: (
      <RequireAuth>
        <AppEntryRedirect />
      </RequireAuth>
    )
  },
  {
    path: surfacePaths.candidate.root,
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
        path: 'profile',
        element: <CandidateProfilePage />
      },
      {
        path: 'applications',
        element: <ApplicationsOverviewPage />
      }
    ]
  },
  {
    path: surfacePaths.workspace.root,
    element: (
      <RequirePermission permission="workspace:read">
        <EmployerShell />
      </RequirePermission>
    ),
    children: [
      {
        index: true,
        element: <WorkspaceOverviewPage />
      },
      {
        path: 'jobs',
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
        path: 'settings/access',
        element: (
          <RequirePermission permission="role:read">
            <RbacOverviewPage />
          </RequirePermission>
        )
      }
    ]
  },
  {
    path: surfacePaths.admin.root,
    element: (
      <RequireAdminAccess>
        <AdminShell />
      </RequireAdminAccess>
    ),
    children: [
      {
        index: true,
        element: <AdminConsolePage />
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
    path: surfacePaths.auth.bootstrapOwner,
    element: <Navigate replace to={surfacePaths.admin.bootstrapOwner} />
  },
  {
    path: '/applications',
    element: <Navigate replace to={surfacePaths.candidate.applications} />
  },
  {
    path: '/onboarding',
    element: <Navigate replace to={surfacePaths.candidate.onboarding} />
  },
  {
    path: '/recruiter-request',
    element: <Navigate replace to={surfacePaths.candidate.recruiterRequest} />
  },
  {
    path: '/candidate/profile',
    element: <Navigate replace to={surfacePaths.candidate.profile} />
  },
  {
    path: '/jobs/manage',
    element: <Navigate replace to={surfacePaths.workspace.jobs} />
  },
  {
    path: '/talent',
    element: <Navigate replace to={surfacePaths.workspace.talent} />
  },
  {
    path: '/pipeline',
    element: <Navigate replace to={surfacePaths.workspace.pipeline} />
  },
  {
    path: '/rbac',
    element: <Navigate replace to={surfacePaths.workspace.access} />
  },
  {
    path: '/internal',
    element: <Navigate replace to={surfacePaths.admin.root} />
  },
  {
    path: '/internal/approvals',
    element: <Navigate replace to={surfacePaths.admin.approvals} />
  },
  {
    path: '/internal/platform',
    element: <Navigate replace to={surfacePaths.admin.platform} />
  },
  {
    path: '/internal/moderation',
    element: <Navigate replace to={surfacePaths.admin.moderation} />
  },
  {
    path: '/internal/errors',
    element: <Navigate replace to={surfacePaths.admin.errors} />
  },
  {
    path: '/internal/bootstrap-owner',
    element: <Navigate replace to={surfacePaths.admin.bootstrapOwner} />
  },
  {
    path: surfacePaths.admin.recruiterRequests,
    element: <Navigate replace to={surfacePaths.admin.approvals} />
  }
]
