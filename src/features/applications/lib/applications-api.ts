import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/shared/types/database'

export interface ApplicationAnswerDraft {
  screeningQuestionId: string
  answerText?: string
  answerJson?: Record<string, unknown> | null
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no esta configurado. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}

export async function submitApplication(input: {
  jobPostingId: string
  submittedResumeId?: string | null
  coverLetter?: string
  answers: ApplicationAnswerDraft[]
}) {
  const client = requireSupabase()
  const response = await (client as typeof client & {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  }).rpc('submit_application', {
    p_job_posting_id: input.jobPostingId,
    p_submitted_resume_id: input.submittedResumeId ?? null,
    p_cover_letter: input.coverLetter?.trim() || null,
    p_answers: input.answers.map((answer) => ({
      screening_question_id: answer.screeningQuestionId,
      answer_text: answer.answerText?.trim() || null,
      answer_json: answer.answerJson ?? null
    }))
  })

  if (response.error) {
    throw response.error
  }

  return response.data as Tables<'applications'>
}

export async function listMyApplications(userId: string) {
  const client = requireSupabase()
  const profileResponse = await client.from('candidate_profiles').select('id').eq('user_id', userId).maybeSingle()

  if (profileResponse.error) {
    throw profileResponse.error
  }

  if (!profileResponse.data) {
    return []
  }

  const response = await client
    .from('applications')
    .select(
      `
        *,
        job_posting:job_postings!applications_job_posting_id_fkey (
          id,
          title,
          slug,
          employment_type,
          workplace_type,
          city_name,
          country_code,
          company_profile:company_profiles!job_postings_company_profile_id_fkey (
            display_name,
            logo_path
          )
        )
      `
    )
    .eq('candidate_profile_id', profileResponse.data.id)
    .order('submitted_at', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data ?? []
}

export async function listTenantApplications(tenantId: string) {
  const client = requireSupabase()
  const response = await client
    .from('applications')
    .select(
      `
        *,
        job_posting:job_postings!applications_job_posting_id_fkey (
          id,
          title,
          slug,
          tenant_id
        ),
        candidate_profile:candidate_profiles!applications_candidate_profile_id_fkey (
          id,
          desired_role,
          city_name,
          country_code,
          user:users!candidate_profiles_user_id_fkey (
            id,
            full_name,
            display_name,
            email,
            avatar_path
          )
        )
      `
    )
    .eq('job_posting.tenant_id', tenantId)
    .order('submitted_at', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data ?? []
}
