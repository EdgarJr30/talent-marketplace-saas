import { describe, expect, it } from 'vitest'

import { getAuthenticatedHomePath, surfacePaths } from '@/app/router/surface-paths'

describe('surface paths', () => {
  it('resolves the authenticated home for candidate-only users', () => {
    expect(getAuthenticatedHomePath(false)).toBe(surfacePaths.candidate.profile)
  })

  it('resolves the authenticated home for workspace users', () => {
    expect(getAuthenticatedHomePath(true)).toBe(surfacePaths.workspace.root)
  })
})
