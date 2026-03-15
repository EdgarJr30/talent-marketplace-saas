alter table public.candidate_profiles
  add column if not exists is_visible_to_recruiters boolean not null default false,
  add column if not exists visibility_updated_at timestamptz not null default timezone('utc', now());

create index if not exists candidate_profiles_visible_idx
  on public.candidate_profiles (is_visible_to_recruiters, updated_at desc);

create index if not exists candidate_profiles_country_role_idx
  on public.candidate_profiles (country_code, lower(desired_role))
  where is_visible_to_recruiters = true;

insert into public.permissions (code, resource, action, scope, description)
values
  (
    'candidate_directory:read',
    'candidate_directory',
    'read',
    'tenant',
    'Search opt-in candidate profiles outside the application pipeline'
  ),
  (
    'candidate_profile:read_full',
    'candidate_profile',
    'read_full',
    'tenant',
    'Read the full opt-in candidate profile outside the application pipeline'
  )
on conflict (code) do update
set
  resource = excluded.resource,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description;

insert into public.tenant_role_permissions (role_id, permission_id)
select tr.id, p.id
from public.tenant_roles tr
join public.permissions p
  on p.code in ('candidate_directory:read', 'candidate_profile:read_full')
where tr.tenant_id is null
  and tr.code in ('tenant_owner', 'tenant_admin', 'recruiter', 'hiring_manager')
on conflict do nothing;

insert into public.tenant_role_permissions (role_id, permission_id)
select tr.id, p.id
from public.tenant_roles tr
join public.permissions p
  on p.code = 'candidate_directory:read'
where tr.tenant_id is null
  and tr.code = 'readonly_analyst'
on conflict do nothing;

create or replace function public.search_candidate_profiles(
  p_tenant_id uuid,
  p_query text default null,
  p_country_code text default null,
  p_language text default null,
  p_skill text default null,
  p_limit integer default 24
)
returns table (
  candidate_profile_id uuid,
  user_id uuid,
  full_name text,
  display_name text,
  avatar_path text,
  headline text,
  desired_role text,
  city_name text,
  country_code text,
  summary text,
  completeness_score integer,
  latest_role_title text,
  total_experiences bigint,
  skill_names text[],
  language_names text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_query text := nullif(trim(p_query), '');
  normalized_skill text := nullif(trim(p_skill), '');
  normalized_language text := nullif(trim(p_language), '');
  normalized_country text := nullif(upper(trim(p_country_code)), '');
  bounded_limit integer := greatest(1, least(coalesce(p_limit, 24), 50));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_tenant_permission(p_tenant_id, 'candidate_directory:read') then
    raise exception 'Permission denied to search the candidate directory';
  end if;

  return query
  select
    cp.id as candidate_profile_id,
    cp.user_id,
    u.full_name,
    coalesce(u.display_name, u.full_name) as display_name,
    u.avatar_path,
    cp.headline,
    cp.desired_role,
    cp.city_name,
    cp.country_code,
    cp.summary,
    cp.completeness_score,
    (
      select ce.role_title
      from public.candidate_experiences ce
      where ce.candidate_profile_id = cp.id
      order by ce.is_current desc, ce.start_date desc, ce.sort_order asc
      limit 1
    ) as latest_role_title,
    (
      select count(*)
      from public.candidate_experiences ce
      where ce.candidate_profile_id = cp.id
    ) as total_experiences,
    coalesce(
      (
        select array_agg(cs.skill_name order by cs.sort_order asc)
        from public.candidate_skills cs
        where cs.candidate_profile_id = cp.id
      ),
      array[]::text[]
    ) as skill_names,
    coalesce(
      (
        select array_agg(cl.language_name order by cl.sort_order asc)
        from public.candidate_languages cl
        where cl.candidate_profile_id = cp.id
      ),
      array[]::text[]
    ) as language_names
  from public.candidate_profiles cp
  join public.users u
    on u.id = cp.user_id
  where cp.is_visible_to_recruiters = true
    and (
      normalized_query is null
      or cp.desired_role ilike '%' || normalized_query || '%'
      or cp.headline ilike '%' || normalized_query || '%'
      or cp.summary ilike '%' || normalized_query || '%'
      or exists (
        select 1
        from public.candidate_experiences ce
        where ce.candidate_profile_id = cp.id
          and (
            ce.role_title ilike '%' || normalized_query || '%'
            or ce.company_name ilike '%' || normalized_query || '%'
            or coalesce(ce.summary, '') ilike '%' || normalized_query || '%'
          )
      )
      or exists (
        select 1
        from public.candidate_skills cs
        where cs.candidate_profile_id = cp.id
          and cs.skill_name ilike '%' || normalized_query || '%'
      )
    )
    and (
      normalized_country is null
      or cp.country_code = normalized_country
    )
    and (
      normalized_skill is null
      or exists (
        select 1
        from public.candidate_skills cs
        where cs.candidate_profile_id = cp.id
          and cs.skill_name ilike '%' || normalized_skill || '%'
      )
    )
    and (
      normalized_language is null
      or exists (
        select 1
        from public.candidate_languages cl
        where cl.candidate_profile_id = cp.id
          and cl.language_name ilike '%' || normalized_language || '%'
      )
    )
  order by cp.completeness_score desc, cp.updated_at desc
  limit bounded_limit;
end;
$$;

create or replace function public.get_candidate_profile_for_tenant(
  p_tenant_id uuid,
  p_candidate_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_record record;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_tenant_permission(p_tenant_id, 'candidate_profile:read_full') then
    raise exception 'Permission denied to read the full candidate profile';
  end if;

  select
    cp.id,
    cp.user_id,
    cp.headline,
    cp.summary,
    cp.city_name,
    cp.country_code,
    cp.desired_role,
    cp.completeness_score,
    cp.is_visible_to_recruiters,
    cp.updated_at,
    u.full_name,
    coalesce(u.display_name, u.full_name) as display_name,
    u.email,
    u.locale,
    u.avatar_path
  into profile_record
  from public.candidate_profiles cp
  join public.users u
    on u.id = cp.user_id
  where cp.id = p_candidate_profile_id
    and cp.is_visible_to_recruiters = true;

  if not found then
    raise exception 'Candidate profile not found or not visible';
  end if;

  result := jsonb_build_object(
    'profile',
    jsonb_build_object(
      'id', profile_record.id,
      'user_id', profile_record.user_id,
      'full_name', profile_record.full_name,
      'display_name', profile_record.display_name,
      'email', profile_record.email,
      'locale', profile_record.locale,
      'avatar_path', profile_record.avatar_path,
      'headline', profile_record.headline,
      'summary', profile_record.summary,
      'city_name', profile_record.city_name,
      'country_code', profile_record.country_code,
      'desired_role', profile_record.desired_role,
      'completeness_score', profile_record.completeness_score,
      'updated_at', profile_record.updated_at
    ),
    'experiences',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ce.id,
            'company_name', ce.company_name,
            'role_title', ce.role_title,
            'employment_type', ce.employment_type,
            'city_name', ce.city_name,
            'country_code', ce.country_code,
            'start_date', ce.start_date,
            'end_date', ce.end_date,
            'is_current', ce.is_current,
            'summary', ce.summary
          )
          order by ce.sort_order asc
        )
        from public.candidate_experiences ce
        where ce.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    ),
    'educations',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ed.id,
            'institution_name', ed.institution_name,
            'degree_name', ed.degree_name,
            'field_of_study', ed.field_of_study,
            'start_date', ed.start_date,
            'end_date', ed.end_date,
            'is_current', ed.is_current,
            'summary', ed.summary
          )
          order by ed.sort_order asc
        )
        from public.candidate_educations ed
        where ed.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    ),
    'skills',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', cs.id,
            'skill_name', cs.skill_name,
            'proficiency_label', cs.proficiency_label
          )
          order by cs.sort_order asc
        )
        from public.candidate_skills cs
        where cs.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    ),
    'languages',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', cl.id,
            'language_name', cl.language_name,
            'proficiency_label', cl.proficiency_label
          )
          order by cl.sort_order asc
        )
        from public.candidate_languages cl
        where cl.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    ),
    'links',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ck.id,
            'link_type', ck.link_type,
            'label', ck.label,
            'url', ck.url
          )
          order by ck.sort_order asc
        )
        from public.candidate_links ck
        where ck.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    ),
    'resumes',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', cr.id,
            'filename', cr.filename,
            'mime_type', cr.mime_type,
            'file_size_bytes', cr.file_size_bytes,
            'is_default', cr.is_default,
            'created_at', cr.created_at
          )
          order by cr.is_default desc, cr.created_at desc
        )
        from public.candidate_resumes cr
        where cr.candidate_profile_id = profile_record.id
      ),
      '[]'::jsonb
    )
  );

  insert into public.audit_logs (
    tenant_id,
    actor_user_id,
    entity_type,
    entity_id,
    event_type,
    payload
  )
  values (
    p_tenant_id,
    auth.uid(),
    'candidate_profiles',
    p_candidate_profile_id,
    'candidate_profile_viewed',
    jsonb_build_object(
      'source', 'candidate_directory',
      'visibility_opt_in', true
    )
  );

  return result;
end;
$$;

grant execute on function public.search_candidate_profiles(uuid, text, text, text, text, integer) to authenticated;
grant execute on function public.get_candidate_profile_for_tenant(uuid, uuid) to authenticated;

select private.attach_audit_trigger('public', 'company_profiles');
