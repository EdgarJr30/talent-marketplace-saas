import { createPrivateFileUrl, removePrivateFile, uploadPrivateFile } from '@/features/auth/lib/auth-api'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/shared/types/database'

export interface CandidateProfileBundle {
  profile: Tables<'candidate_profiles'> | null
  resumes: Tables<'candidate_resumes'>[]
  experiences: Tables<'candidate_experiences'>[]
  educations: Tables<'candidate_educations'>[]
  skills: Tables<'candidate_skills'>[]
  languages: Tables<'candidate_languages'>[]
  links: Tables<'candidate_links'>[]
}

interface CandidateProfileQueryRow extends Tables<'candidate_profiles'> {
  candidate_resumes?: Tables<'candidate_resumes'>[] | null
  candidate_experiences?: Tables<'candidate_experiences'>[] | null
  candidate_educations?: Tables<'candidate_educations'>[] | null
  candidate_skills?: Tables<'candidate_skills'>[] | null
  candidate_languages?: Tables<'candidate_languages'>[] | null
  candidate_links?: Tables<'candidate_links'>[] | null
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no esta configurado. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}

function sortByOrder<T extends { sort_order: number | null }>(items: T[]) {
  return [...items].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
}

function emptyCandidateBundle(): CandidateProfileBundle {
  return {
    profile: null,
    resumes: [],
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    links: []
  }
}

export async function fetchMyCandidateProfile(userId: string): Promise<CandidateProfileBundle> {
  const client = requireSupabase()
  const response = await client
    .from('candidate_profiles')
    .select(
      `
        *,
        candidate_resumes (*),
        candidate_experiences (*),
        candidate_educations (*),
        candidate_skills (*),
        candidate_languages (*),
        candidate_links (*)
      `
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (response.error) {
    throw response.error
  }

  if (!response.data) {
    return emptyCandidateBundle()
  }

  const row = response.data as CandidateProfileQueryRow

  return {
    profile: row,
    resumes: [...(row.candidate_resumes ?? [])].sort(
      (left, right) => Number(right.is_default) - Number(left.is_default)
    ),
    experiences: sortByOrder(row.candidate_experiences ?? []),
    educations: sortByOrder(row.candidate_educations ?? []),
    skills: sortByOrder(row.candidate_skills ?? []),
    languages: sortByOrder(row.candidate_languages ?? []),
    links: sortByOrder(row.candidate_links ?? [])
  }
}

export async function ensureCandidateProfile(userId: string) {
  const client = requireSupabase()
  const response = await client
    .from('candidate_profiles')
    .upsert(
      {
        user_id: userId
      },
      {
        onConflict: 'user_id'
      }
    )
    .select('*')
    .single()

  if (response.error) {
    throw response.error
  }

  return response.data
}

export async function saveCandidateProfileBundle(input: {
  userId: string
  profile: {
    headline?: string
    summary?: string
    cityName?: string
    countryCode?: string
    desiredRole?: string
    isVisibleToRecruiters?: boolean
  }
  experiences: Array<{
    companyName: string
    roleTitle: string
    employmentType?: string
    cityName?: string
    countryCode?: string
    startDate: string
    endDate?: string
    isCurrent: boolean
    summary?: string
  }>
  educations: Array<{
    institutionName: string
    degreeName: string
    fieldOfStudy?: string
    startDate?: string
    endDate?: string
    isCurrent: boolean
    summary?: string
  }>
  skills: Array<{
    skillName: string
    proficiencyLabel?: string
  }>
  languages: Array<{
    languageName: string
    proficiencyLabel: string
  }>
  links: Array<{
    linkType: 'portfolio' | 'linkedin' | 'github' | 'website' | 'other'
    label?: string
    url: string
  }>
}) {
  const client = requireSupabase()
  const profileResponse = await client
    .from('candidate_profiles')
    .upsert(
      {
        user_id: input.userId,
        headline: input.profile.headline ?? null,
        summary: input.profile.summary ?? null,
        city_name: input.profile.cityName ?? null,
        country_code: input.profile.countryCode ?? null,
        desired_role: input.profile.desiredRole ?? null,
        is_visible_to_recruiters: input.profile.isVisibleToRecruiters ?? false
      },
      {
        onConflict: 'user_id'
      }
    )
    .select('*')
    .single()

  if (profileResponse.error) {
    throw profileResponse.error
  }

  const profile = profileResponse.data

  const deleteTargets = [
    client.from('candidate_experiences').delete().eq('candidate_profile_id', profile.id),
    client.from('candidate_educations').delete().eq('candidate_profile_id', profile.id),
    client.from('candidate_skills').delete().eq('candidate_profile_id', profile.id),
    client.from('candidate_languages').delete().eq('candidate_profile_id', profile.id),
    client.from('candidate_links').delete().eq('candidate_profile_id', profile.id)
  ]

  const deleteResults = await Promise.all(deleteTargets)

  for (const result of deleteResults) {
    if (result.error) {
      throw result.error
    }
  }

  if (input.experiences.length > 0) {
    const response = await client.from('candidate_experiences').insert(
      input.experiences.map((item, index) => ({
        candidate_profile_id: profile.id,
        company_name: item.companyName,
        role_title: item.roleTitle,
        employment_type: item.employmentType || null,
        city_name: item.cityName || null,
        country_code: item.countryCode || null,
        start_date: item.startDate,
        end_date: item.endDate || null,
        is_current: item.isCurrent,
        summary: item.summary || null,
        sort_order: index
      }))
    )

    if (response.error) {
      throw response.error
    }
  }

  if (input.educations.length > 0) {
    const response = await client.from('candidate_educations').insert(
      input.educations.map((item, index) => ({
        candidate_profile_id: profile.id,
        institution_name: item.institutionName,
        degree_name: item.degreeName,
        field_of_study: item.fieldOfStudy || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
        is_current: item.isCurrent,
        summary: item.summary || null,
        sort_order: index
      }))
    )

    if (response.error) {
      throw response.error
    }
  }

  if (input.skills.length > 0) {
    const response = await client.from('candidate_skills').insert(
      input.skills.map((item, index) => ({
        candidate_profile_id: profile.id,
        skill_name: item.skillName,
        proficiency_label: item.proficiencyLabel || null,
        sort_order: index
      }))
    )

    if (response.error) {
      throw response.error
    }
  }

  if (input.languages.length > 0) {
    const response = await client.from('candidate_languages').insert(
      input.languages.map((item, index) => ({
        candidate_profile_id: profile.id,
        language_name: item.languageName,
        proficiency_label: item.proficiencyLabel,
        sort_order: index
      }))
    )

    if (response.error) {
      throw response.error
    }
  }

  if (input.links.length > 0) {
    const response = await client.from('candidate_links').insert(
      input.links.map((item, index) => ({
        candidate_profile_id: profile.id,
        link_type: item.linkType,
        label: item.label || null,
        url: item.url,
        sort_order: index
      }))
    )

    if (response.error) {
      throw response.error
    }
  }

  return fetchMyCandidateProfile(input.userId)
}

export async function updateCandidateVisibility(input: {
  userId: string
  isVisibleToRecruiters: boolean
}) {
  const client = requireSupabase()
  const response = await client
    .from('candidate_profiles')
    .upsert(
      {
        user_id: input.userId,
        is_visible_to_recruiters: input.isVisibleToRecruiters,
        visibility_updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id'
      }
    )
    .select('*')
    .single()

  if (response.error) {
    throw response.error
  }

  return response.data
}

export async function uploadCandidateResume(input: {
  userId: string
  file: File
}) {
  const client = requireSupabase()
  const profile = await ensureCandidateProfile(input.userId)
  const storagePath = await uploadPrivateFile({
    bucket: 'candidate-resumes',
    ownerUserId: input.userId,
    file: input.file,
    prefix: 'resume'
  })

  const insertResponse = await client
    .from('candidate_resumes')
    .insert({
      candidate_profile_id: profile.id,
      storage_path: storagePath,
      filename: input.file.name,
      mime_type: input.file.type || 'application/octet-stream',
      file_size_bytes: input.file.size
    })
    .select('*')
    .single()

  if (insertResponse.error) {
    await removePrivateFile({
      bucket: 'candidate-resumes',
      path: storagePath
    }).catch(() => undefined)

    throw insertResponse.error
  }

  return insertResponse.data
}

export async function setDefaultCandidateResume(resumeId: string) {
  const client = requireSupabase()
  const response = await client
    .from('candidate_resumes')
    .update({
      is_default: true
    })
    .eq('id', resumeId)
    .select('*')
    .single()

  if (response.error) {
    throw response.error
  }

  return response.data
}

export async function deleteCandidateResume(resume: Tables<'candidate_resumes'>) {
  const client = requireSupabase()

  await removePrivateFile({
    bucket: 'candidate-resumes',
    path: resume.storage_path
  })

  const response = await client.from('candidate_resumes').delete().eq('id', resume.id)

  if (response.error) {
    throw response.error
  }
}

export async function createCandidateResumeUrl(storagePath: string) {
  return createPrivateFileUrl('candidate-resumes', storagePath)
}
