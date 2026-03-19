export const surfacePaths = {
  public: {
    home: '/',
    jobs: '/jobs',
    jobDetail: (jobSlug: string) => `/jobs/${jobSlug}`,
    jobApply: (jobSlug: string) => `/jobs/${jobSlug}/apply`,
    offline: '/offline'
  },
  auth: {
    root: '/auth',
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    confirm: '/auth/confirm'
  },
  app: {
    home: '/app'
  },
  candidate: {
    root: '/candidate',
    profile: '/candidate/profile',
    applications: '/candidate/applications',
    onboarding: '/candidate/onboarding',
    recruiterRequest: '/candidate/recruiter-request'
  },
  workspace: {
    root: '/workspace',
    jobs: '/workspace/jobs',
    talent: '/workspace/talent',
    pipeline: '/workspace/pipeline',
    access: '/workspace/settings/access'
  },
  admin: {
    root: '/admin',
    approvals: '/admin/approvals',
    platform: '/admin/platform',
    moderation: '/admin/moderation',
    errors: '/admin/errors',
    bootstrapOwner: '/admin/bootstrap-owner'
  }
} as const

export function getAuthenticatedHomePath(hasWorkspaceAccess: boolean) {
  return hasWorkspaceAccess ? surfacePaths.workspace.root : surfacePaths.candidate.profile
}
