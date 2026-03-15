create type public.application_public_status as enum (
  'submitted',
  'in_review',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
  'hired'
);

create table if not exists public.applications (
  id uuid primary key default extensions.gen_random_uuid(),
  job_posting_id uuid not null references public.job_postings (id) on delete cascade,
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  submitted_resume_id uuid references public.candidate_resumes (id) on delete set null,
  status_public public.application_public_status not null default 'submitted',
  cover_letter text,
  candidate_display_name_snapshot text not null,
  candidate_email_snapshot text,
  candidate_headline_snapshot text,
  candidate_summary_snapshot text,
  submitted_resume_filename text,
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (job_posting_id, candidate_profile_id)
);

create index if not exists applications_candidate_idx
  on public.applications (candidate_profile_id, submitted_at desc);

create index if not exists applications_job_idx
  on public.applications (job_posting_id, submitted_at desc);

create table if not exists public.application_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  screening_question_id uuid not null references public.job_screening_questions (id) on delete cascade,
  answer_text text,
  answer_json jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (application_id, screening_question_id)
);

create index if not exists application_answers_application_idx
  on public.application_answers (application_id);

create or replace function public.can_read_application(p_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    join public.job_postings jp
      on jp.id = a.job_posting_id
    where a.id = p_application_id
      and (
        public.is_candidate_profile_owner(a.candidate_profile_id)
        or public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:read')
      )
  );
$$;

create or replace function public.submit_application(
  p_job_posting_id uuid,
  p_submitted_resume_id uuid default null,
  p_cover_letter text default null,
  p_answers jsonb default '[]'::jsonb
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.job_postings%rowtype;
  v_candidate_profile public.candidate_profiles%rowtype;
  v_user public.users%rowtype;
  v_resume public.candidate_resumes%rowtype;
  v_application public.applications%rowtype;
  v_answer jsonb;
  v_question public.job_screening_questions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_job
  from public.job_postings
  where id = p_job_posting_id;

  if not found then
    raise exception 'Job not found';
  end if;

  if v_job.status <> 'published' then
    raise exception 'This job is not accepting applications right now';
  end if;

  select *
  into v_candidate_profile
  from public.candidate_profiles
  where user_id = auth.uid();

  if not found then
    raise exception 'Candidate profile is required before applying';
  end if;

  select *
  into v_user
  from public.users
  where id = auth.uid();

  if exists (
    select 1
    from public.applications a
    where a.job_posting_id = p_job_posting_id
      and a.candidate_profile_id = v_candidate_profile.id
  ) then
    raise exception 'You already applied to this job';
  end if;

  if p_submitted_resume_id is not null then
    select *
    into v_resume
    from public.candidate_resumes
    where id = p_submitted_resume_id
      and public.is_candidate_profile_owner(candidate_profile_id);

    if not found then
      raise exception 'Selected resume does not belong to your candidate profile';
    end if;
  end if;

  for v_question in
    select *
    from public.job_screening_questions jq
    where jq.job_posting_id = p_job_posting_id
      and jq.is_required = true
  loop
    if not exists (
      select 1
      from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) answer_item
      where (answer_item ->> 'screening_question_id')::uuid = v_question.id
        and nullif(trim(coalesce(answer_item ->> 'answer_text', '')), '') is not null
    ) then
      raise exception 'A required screening question is still unanswered';
    end if;
  end loop;

  insert into public.applications (
    job_posting_id,
    candidate_profile_id,
    submitted_resume_id,
    cover_letter,
    candidate_display_name_snapshot,
    candidate_email_snapshot,
    candidate_headline_snapshot,
    candidate_summary_snapshot,
    submitted_resume_filename
  )
  values (
    p_job_posting_id,
    v_candidate_profile.id,
    p_submitted_resume_id,
    nullif(trim(coalesce(p_cover_letter, '')), ''),
    coalesce(v_user.display_name, v_user.full_name),
    v_user.email,
    v_candidate_profile.headline,
    v_candidate_profile.summary,
    v_resume.filename
  )
  returning * into v_application;

  for v_answer in
    select *
    from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb))
  loop
    insert into public.application_answers (
      application_id,
      screening_question_id,
      answer_text,
      answer_json
    )
    values (
      v_application.id,
      (v_answer ->> 'screening_question_id')::uuid,
      nullif(trim(coalesce(v_answer ->> 'answer_text', '')), ''),
      v_answer -> 'answer_json'
    );
  end loop;

  return v_application;
end;
$$;

grant select on public.applications to authenticated;
grant select on public.application_answers to authenticated;
grant execute on function public.can_read_application(uuid) to authenticated;
grant execute on function public.submit_application(uuid, uuid, text, jsonb) to authenticated;

alter table public.applications enable row level security;
alter table public.application_answers enable row level security;

create policy "applications_select_for_owner_or_tenant_readers"
on public.applications
for select
to authenticated
using (
  public.is_candidate_profile_owner(candidate_profile_id)
  or exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:read')
      )
  )
);

create policy "application_answers_select_for_application_readers"
on public.application_answers
for select
to authenticated
using (public.can_read_application(application_id));

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute procedure public.set_row_updated_at();

drop trigger if exists application_answers_set_updated_at on public.application_answers;
create trigger application_answers_set_updated_at
before update on public.application_answers
for each row execute procedure public.set_row_updated_at();

select private.attach_audit_trigger('public', 'applications');
select private.attach_audit_trigger('public', 'application_answers');
