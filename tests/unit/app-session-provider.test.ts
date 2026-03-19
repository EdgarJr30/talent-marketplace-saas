import { describe, expect, it } from 'vitest'

import type { AppMembership } from '@/features/auth/lib/auth-api'
import { resolveActiveMembership } from '@/app/providers/app-session-provider'

function makeMembership(id: string, tenantId: string, tenantName: string): AppMembership {
  return {
    id,
    tenantId,
    tenantName,
    tenantSlug: tenantName.toLowerCase().replace(/\s+/g, '-'),
    roleCodes: [],
    roleNames: [],
    permissions: []
  }
}

describe('app session active membership helpers', () => {
  it('returns null when there are no memberships', () => {
    expect(resolveActiveMembership([])).toBeNull()
  })

  it('returns the only membership when there is just one', () => {
    const membership = makeMembership('m-1', 'tenant-1', 'Acme')

    expect(resolveActiveMembership([membership])).toEqual(membership)
  })

  it('falls back to the first membership when there are multiple', () => {
    const first = makeMembership('m-1', 'tenant-1', 'Acme')
    const second = makeMembership('m-2', 'tenant-2', 'Globex')

    expect(resolveActiveMembership([first, second])).toEqual(first)
  })
})
