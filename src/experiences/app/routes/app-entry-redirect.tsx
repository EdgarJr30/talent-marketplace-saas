import { Navigate } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { getAuthenticatedHomePath } from '@/app/router/surface-paths'

export function AppEntryRedirect() {
  const session = useAppSession()

  return <Navigate replace to={getAuthenticatedHomePath(session.permissions.includes('workspace:read'))} />
}
