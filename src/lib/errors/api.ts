import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/shared/types/database'

type ErrorLogUser = Pick<Tables<'users'>, 'id' | 'email' | 'display_name' | 'full_name'>

export interface AppErrorLogRecord extends Tables<'app_error_logs'> {
  affected_user: ErrorLogUser | null
  resolved_by_user: ErrorLogUser | null
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no esta configurado. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}

export async function listAppErrorLogs(limit = 50) {
  const client = requireSupabase()
  const response = await client
    .from('app_error_logs')
    .select(
      `
        *,
        affected_user:users!app_error_logs_user_id_fkey (
          id,
          email,
          display_name,
          full_name
        ),
        resolved_by_user:users!app_error_logs_resolved_by_user_id_fkey (
          id,
          email,
          display_name,
          full_name
        )
      `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (response.error) {
    throw response.error
  }

  return (response.data ?? []) as AppErrorLogRecord[]
}

export async function updateAppErrorResolution(values: {
  errorId: string
  isResolved: boolean
  resolvedByUserId: string
}) {
  const client = requireSupabase()
  const response = await client
    .from('app_error_logs')
    .update({
      is_resolved: values.isResolved,
      resolved_at: values.isResolved ? new Date().toISOString() : null,
      resolved_by_user_id: values.isResolved ? values.resolvedByUserId : null
    })
    .eq('id', values.errorId)
    .select('*')
    .single()

  if (response.error) {
    throw response.error
  }

  return response.data satisfies Tables<'app_error_logs'>
}
