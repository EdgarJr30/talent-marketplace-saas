import { Navigate } from 'react-router-dom'

export function AuthPage() {
  return <Navigate replace to="/auth/sign-in" />
}
