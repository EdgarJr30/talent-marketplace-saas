import { describe, expect, it } from 'vitest'

import { filterNavigationItems, hasPermission } from '@/lib/permissions/guards'
import { candidateNavigationItems, employerNavigationItems, internalNavigationItems } from '@/shared/constants/navigation'

describe('permission guards', () => {
  it('allows access when the required permission exists', () => {
    expect(hasPermission(['workspace:read', 'job:read'], 'job:read')).toBe(true)
  })

  it('filters navigation items that the current session cannot access', () => {
    const visibleItems = filterNavigationItems(
      [...candidateNavigationItems, ...employerNavigationItems, ...internalNavigationItems],
      [
        'workspace:read',
        'job:read',
        'candidate_directory:read',
        'application:read',
        'role:read',
        'audit_log:read',
        'platform_dashboard:read'
      ],
      true
    )

    expect(visibleItems.map((item) => item.title)).toEqual([
      'Onboarding',
      'Mi perfil',
      'Jobs',
      'Aplicaciones',
      'Recruiter',
      'Workspace',
      'Vacantes',
      'Talento',
      'Pipeline',
      'Roles',
      'Console',
      'Platform',
      'Errors'
    ])
  })

  it('keeps internal navigation restricted when platform permissions are missing', () => {
    const visibleInternal = filterNavigationItems(
      internalNavigationItems,
      [],
      true
    )

    expect(visibleInternal.map((item) => item.title)).toEqual([
      'Console'
    ])
  })
})
