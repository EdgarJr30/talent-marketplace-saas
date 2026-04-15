import type { Tables } from '@/shared/types/database'

const activeMembershipStatuses = new Set(['active', 'grace_period'])
const activeSubscriptionStatuses = new Set(['trialing', 'active', 'grace_period'])

function isFutureDate(value: string | null, now: Date) {
  if (!value) {
    return true
  }

  const date = new Date(value)

  return Number.isFinite(date.getTime()) && date > now
}

export function hasActiveAsiAccess(profile: Tables<'users'> | null, now = new Date()) {
  if (!profile || profile.status !== 'active') {
    return false
  }

  if (profile.manual_access_override_until && isFutureDate(profile.manual_access_override_until, now)) {
    return true
  }

  return (
    profile.user_approval_status === 'approved' &&
    activeMembershipStatuses.has(profile.asi_membership_status) &&
    activeSubscriptionStatuses.has(profile.user_subscription_status) &&
    isFutureDate(profile.membership_expires_at, now) &&
    isFutureDate(profile.subscription_expires_at, now)
  )
}
