import type { ReactElement } from 'react'

import { Navigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { appRoutes } from '@/app/router/routes'
import { surfacePaths } from '@/app/router/surface-paths'

function findTopLevelRoute(path: string) {
  return appRoutes.find((route) => route.path === path)
}

function expectNavigateTarget(path: string, expectedTarget: string) {
  const route = findTopLevelRoute(path)

  expect(route).toBeDefined()

  const element = route!.element as ReactElement<{ to: string; replace?: boolean }>

  expect(element.type).toBe(Navigate)
  expect(element.props.to).toBe(expectedTarget)
  expect(element.props.replace).toBe(true)
}

describe('app route contract', () => {
  it('defines the canonical top-level surfaces', () => {
    expect(findTopLevelRoute('/')).toBeDefined()
    expect(findTopLevelRoute(surfacePaths.auth.root)).toBeDefined()
    expect(findTopLevelRoute(surfacePaths.app.home)).toBeDefined()
    expect(findTopLevelRoute(surfacePaths.candidate.root)).toBeDefined()
    expect(findTopLevelRoute(surfacePaths.workspace.root)).toBeDefined()
    expect(findTopLevelRoute(surfacePaths.admin.root)).toBeDefined()
  })

  it('keeps legacy candidate aliases redirecting to canonical candidate routes', () => {
    expectNavigateTarget('/applications', surfacePaths.candidate.applications)
    expectNavigateTarget('/onboarding', surfacePaths.candidate.onboarding)
    expectNavigateTarget('/recruiter-request', surfacePaths.candidate.recruiterRequest)
    expectNavigateTarget('/candidate/profile', surfacePaths.candidate.profile)
  })

  it('keeps legacy workspace aliases redirecting to canonical workspace routes', () => {
    expectNavigateTarget('/jobs/manage', surfacePaths.workspace.jobs)
    expectNavigateTarget('/talent', surfacePaths.workspace.talent)
    expectNavigateTarget('/pipeline', surfacePaths.workspace.pipeline)
    expectNavigateTarget('/rbac', surfacePaths.workspace.access)
  })

  it('keeps legacy internal/admin aliases redirecting to canonical admin routes', () => {
    expectNavigateTarget('/internal', surfacePaths.admin.root)
    expectNavigateTarget('/internal/approvals', surfacePaths.admin.approvals)
    expectNavigateTarget('/internal/platform', surfacePaths.admin.platform)
    expectNavigateTarget('/internal/moderation', surfacePaths.admin.moderation)
    expectNavigateTarget('/internal/errors', surfacePaths.admin.errors)
    expectNavigateTarget('/internal/bootstrap-owner', surfacePaths.admin.bootstrapOwner)
    expectNavigateTarget(surfacePaths.admin.recruiterRequests, surfacePaths.admin.approvals)
    expectNavigateTarget(surfacePaths.auth.bootstrapOwner, surfacePaths.admin.bootstrapOwner)
  })
})
