begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_kind') then
    create type public.tenant_kind as enum ('company', 'ministry', 'project', 'field', 'generic_profile');
  end if;

  if not exists (select 1 from pg_type where typname = 'opportunity_type') then
    create type public.opportunity_type as enum ('employment', 'project', 'volunteer', 'professional_service');
  end if;

  if not exists (select 1 from pg_type where typname = 'opportunity_compensation_type') then
    create type public.opportunity_compensation_type as enum (
      'salary',
      'stipend',
      'budget',
      'unpaid',
      'donation_based',
      'not_disclosed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'user_approval_status') then
    create type public.user_approval_status as enum (
      'pending_review',
      'needs_more_info',
      'approved',
      'rejected',
      'suspended',
      'revoked'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'asi_membership_status') then
    create type public.asi_membership_status as enum (
      'none',
      'pending',
      'active',
      'grace_period',
      'expired',
      'suspended',
      'revoked'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'user_subscription_status') then
    create type public.user_subscription_status as enum (
      'none',
      'trialing',
      'active',
      'past_due',
      'grace_period',
      'cancelled',
      'ended'
    );
  end if;
end
$$;

alter table public.users
  add column if not exists user_approval_status public.user_approval_status,
  add column if not exists asi_membership_status public.asi_membership_status,
  add column if not exists user_subscription_status public.user_subscription_status,
  add column if not exists membership_expires_at timestamptz,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists approval_reviewed_at timestamptz,
  add column if not exists approval_reviewed_by_user_id uuid references public.users(id) on delete set null,
  add column if not exists manual_access_override_until timestamptz,
  add column if not exists manual_access_override_reason text,
  add column if not exists manual_access_override_by_user_id uuid references public.users(id) on delete set null;

update public.users
set
  user_approval_status = coalesce(user_approval_status, 'approved'::public.user_approval_status),
  asi_membership_status = coalesce(asi_membership_status, 'active'::public.asi_membership_status),
  user_subscription_status = coalesce(user_subscription_status, 'active'::public.user_subscription_status)
where user_approval_status is null
   or asi_membership_status is null
   or user_subscription_status is null;

alter table public.users
  alter column user_approval_status set default 'pending_review',
  alter column asi_membership_status set default 'none',
  alter column user_subscription_status set default 'none',
  alter column user_approval_status set not null,
  alter column asi_membership_status set not null,
  alter column user_subscription_status set not null;

create index if not exists users_access_gate_status_idx
  on public.users (status, user_approval_status, asi_membership_status, user_subscription_status);

alter table public.tenants
  add column if not exists tenant_kind public.tenant_kind;

update public.tenants
set tenant_kind = coalesce(tenant_kind, 'company'::public.tenant_kind)
where tenant_kind is null;

alter table public.tenants
  alter column tenant_kind set default 'company',
  alter column tenant_kind set not null;

create index if not exists tenants_kind_status_idx
  on public.tenants (tenant_kind, status);

alter table public.company_profiles
  add column if not exists profile_kind public.tenant_kind,
  add column if not exists profile_metadata jsonb not null default '{}'::jsonb;

update public.company_profiles cp
set profile_kind = coalesce(cp.profile_kind, t.tenant_kind, 'company'::public.tenant_kind)
from public.tenants t
where t.id = cp.tenant_id
  and cp.profile_kind is null;

alter table public.company_profiles
  alter column profile_kind set default 'company',
  alter column profile_kind set not null;

alter table public.recruiter_requests
  add column if not exists requested_tenant_kind public.tenant_kind,
  add column if not exists request_metadata jsonb not null default '{}'::jsonb;

update public.recruiter_requests
set requested_tenant_kind = coalesce(requested_tenant_kind, 'company'::public.tenant_kind)
where requested_tenant_kind is null;

alter table public.recruiter_requests
  alter column requested_tenant_kind set default 'company',
  alter column requested_tenant_kind set not null;

alter table public.job_postings
  add column if not exists opportunity_type public.opportunity_type,
  add column if not exists compensation_type public.opportunity_compensation_type,
  add column if not exists compensation_min_amount integer,
  add column if not exists compensation_max_amount integer,
  add column if not exists compensation_currency text,
  add column if not exists opportunity_metadata jsonb not null default '{}'::jsonb;

update public.job_postings
set
  opportunity_type = coalesce(opportunity_type, 'employment'::public.opportunity_type),
  compensation_type = coalesce(
    compensation_type,
    case
      when salary_visible or salary_min_amount is not null or salary_max_amount is not null then 'salary'::public.opportunity_compensation_type
      else 'not_disclosed'::public.opportunity_compensation_type
    end
  ),
  compensation_min_amount = coalesce(compensation_min_amount, salary_min_amount),
  compensation_max_amount = coalesce(compensation_max_amount, salary_max_amount),
  compensation_currency = coalesce(compensation_currency, salary_currency)
where opportunity_type is null
   or compensation_type is null
   or compensation_min_amount is null and salary_min_amount is not null
   or compensation_max_amount is null and salary_max_amount is not null
   or compensation_currency is null and salary_currency is not null;

alter table public.job_postings
  alter column opportunity_type set default 'employment',
  alter column compensation_type set default 'not_disclosed',
  alter column opportunity_type set not null,
  alter column compensation_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_postings_compensation_range_chk'
      and conrelid = 'public.job_postings'::regclass
  ) then
    alter table public.job_postings
      add constraint job_postings_compensation_range_chk check (
        compensation_min_amount is null
        or compensation_max_amount is null
        or compensation_min_amount <= compensation_max_amount
      );
  end if;
end
$$;

create index if not exists job_postings_opportunity_type_status_idx
  on public.job_postings (opportunity_type, status, published_at desc);

create table if not exists public.opportunity_stage_templates (
  id uuid primary key default gen_random_uuid(),
  opportunity_type public.opportunity_type not null,
  code text not null,
  name text not null,
  position integer not null default 0,
  color_token text,
  is_default boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opportunity_stage_templates_code_format_chk check (code ~ '^[a-z0-9_]+$')
);

create unique index if not exists opportunity_stage_templates_type_code_unique_idx
  on public.opportunity_stage_templates (opportunity_type, lower(code));

insert into public.opportunity_stage_templates (opportunity_type, code, name, position, color_token)
values
  ('employment', 'applied', 'Applied', 0, 'sky'),
  ('employment', 'screening', 'Screening', 1, 'amber'),
  ('employment', 'interview', 'Interview', 2, 'violet'),
  ('employment', 'offer', 'Offer', 3, 'emerald'),
  ('employment', 'hired', 'Hired', 4, 'emerald'),
  ('employment', 'rejected', 'Rejected', 5, 'rose'),
  ('project', 'submitted', 'Submitted', 0, 'sky'),
  ('project', 'under_review', 'Under review', 1, 'amber'),
  ('project', 'approved', 'Approved', 2, 'emerald'),
  ('project', 'active', 'Active', 3, 'violet'),
  ('project', 'completed', 'Completed', 4, 'emerald'),
  ('project', 'declined', 'Declined', 5, 'rose'),
  ('volunteer', 'registered', 'Registered', 0, 'sky'),
  ('volunteer', 'validating', 'Validating', 1, 'amber'),
  ('volunteer', 'assigned', 'Assigned', 2, 'violet'),
  ('volunteer', 'completed', 'Completed', 3, 'emerald'),
  ('volunteer', 'not_selected', 'Not selected', 4, 'rose'),
  ('volunteer', 'withdrawn', 'Withdrawn', 5, 'slate'),
  ('professional_service', 'requested', 'Requested', 0, 'sky'),
  ('professional_service', 'reviewing', 'Reviewing', 1, 'amber'),
  ('professional_service', 'conversation', 'Conversation', 2, 'violet'),
  ('professional_service', 'selected', 'Selected', 3, 'emerald'),
  ('professional_service', 'closed', 'Closed', 4, 'emerald'),
  ('professional_service', 'declined', 'Declined', 5, 'rose')
on conflict do nothing;

grant select on public.opportunity_stage_templates to authenticated;
alter table public.opportunity_stage_templates enable row level security;

create or replace function public.has_active_asi_access(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = p_user_id
      and u.status = 'active'
      and (
        (
          u.user_approval_status = 'approved'
          and u.asi_membership_status in ('active', 'grace_period')
          and u.user_subscription_status in ('trialing', 'active', 'grace_period')
          and (u.membership_expires_at is null or u.membership_expires_at > timezone('utc', now()))
          and (u.subscription_expires_at is null or u.subscription_expires_at > timezone('utc', now()))
        )
        or (
          u.manual_access_override_until is not null
          and u.manual_access_override_until > timezone('utc', now())
        )
      )
  );
$$;

create or replace function public.has_active_tenant_subscription(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_subscriptions ts
    join public.tenants t on t.id = ts.tenant_id
    where ts.tenant_id = p_tenant_id
      and t.status = 'active'
      and ts.status in ('trialing', 'active')
      and (ts.ends_at is null or ts.ends_at > timezone('utc', now()))
  );
$$;

create or replace function public.can_publish_opportunity(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_asi_access(auth.uid())
    and public.has_active_tenant_subscription(p_tenant_id)
    and public.has_tenant_permission(p_tenant_id, 'job:publish');
$$;

grant execute on function public.has_active_asi_access(uuid) to authenticated;
grant execute on function public.has_active_tenant_subscription(uuid) to authenticated;
grant execute on function public.can_publish_opportunity(uuid) to authenticated;

drop policy if exists "opportunity_stage_templates_authenticated_read" on public.opportunity_stage_templates;
create policy "opportunity_stage_templates_authenticated_read"
on public.opportunity_stage_templates
for select
to authenticated
using (public.has_active_asi_access(auth.uid()) or public.is_platform_admin());

drop policy if exists "job_postings_public_or_tenant_read" on public.job_postings;
drop policy if exists "job_postings_protected_or_tenant_read" on public.job_postings;
create policy "job_postings_protected_or_tenant_read"
on public.job_postings
for select
to authenticated
using (
  public.is_platform_admin()
  or (
    public.has_active_asi_access(auth.uid())
    and (
      status = 'published'
      or public.has_tenant_permission(tenant_id, 'job:read')
    )
  )
);

drop policy if exists "job_postings_insert_for_creators" on public.job_postings;
create policy "job_postings_insert_for_creators"
on public.job_postings
for insert
to authenticated
with check (
  public.has_active_asi_access(auth.uid())
  and public.has_tenant_permission(tenant_id, 'job:create')
);

drop policy if exists "job_postings_update_for_authorized_members" on public.job_postings;
create policy "job_postings_update_for_authorized_members"
on public.job_postings
for update
to authenticated
using (
  public.is_platform_admin()
  or (
    public.has_active_asi_access(auth.uid())
    and (
      public.has_tenant_permission(tenant_id, 'job:update')
      or (status = 'published' and public.has_tenant_permission(tenant_id, 'job:publish'))
    )
  )
)
with check (
  public.is_platform_admin()
  or (
    public.has_active_asi_access(auth.uid())
    and (
      public.has_tenant_permission(tenant_id, 'job:update')
      or (
        status = 'published'
        and public.has_active_tenant_subscription(tenant_id)
        and public.has_tenant_permission(tenant_id, 'job:publish')
      )
      or (
        status = 'closed'
        and public.has_tenant_permission(tenant_id, 'job:close')
      )
      or (
        status = 'archived'
        and public.has_tenant_permission(tenant_id, 'job:archive')
      )
    )
  )
);

drop policy if exists "job_screening_questions_public_or_tenant_read" on public.job_screening_questions;
drop policy if exists "job_screening_questions_protected_or_tenant_read" on public.job_screening_questions;
create policy "job_screening_questions_protected_or_tenant_read"
on public.job_screening_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and (
        public.is_platform_admin()
        or (
          public.has_active_asi_access(auth.uid())
          and (
            jp.status = 'published'
            or public.has_tenant_permission(jp.tenant_id, 'job:read')
          )
        )
      )
  )
);

drop policy if exists "job_screening_questions_write_for_authorized_members" on public.job_screening_questions;
create policy "job_screening_questions_write_for_authorized_members"
on public.job_screening_questions
for all
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'job:update')
        or public.has_tenant_permission(jp.tenant_id, 'job:publish')
      )
  )
)
with check (
  public.has_active_asi_access(auth.uid())
  and exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'job:update')
        or public.has_tenant_permission(jp.tenant_id, 'job:publish')
      )
  )
);

drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own"
on public.saved_jobs
for select
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own"
on public.saved_jobs
for insert
to authenticated
with check (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
  and exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and jp.status = 'published'
  )
);

drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own"
on public.saved_jobs
for delete
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

drop policy if exists "job_alerts_select_own" on public.job_alerts;
create policy "job_alerts_select_own"
on public.job_alerts
for select
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

drop policy if exists "job_alerts_insert_own" on public.job_alerts;
create policy "job_alerts_insert_own"
on public.job_alerts
for insert
to authenticated
with check (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

drop policy if exists "job_alerts_update_own" on public.job_alerts;
create policy "job_alerts_update_own"
on public.job_alerts
for update
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
)
with check (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

drop policy if exists "job_alerts_delete_own" on public.job_alerts;
create policy "job_alerts_delete_own"
on public.job_alerts
for delete
to authenticated
using (
  public.has_active_asi_access(auth.uid())
  and public.is_candidate_profile_owner(candidate_profile_id)
);

revoke all on public.job_postings from anon;
revoke all on public.job_screening_questions from anon;
revoke all on public.saved_jobs from anon;
revoke all on public.job_alerts from anon;

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
        public.is_platform_admin()
        or (
          public.has_active_asi_access(auth.uid())
          and (
            public.is_candidate_profile_owner(a.candidate_profile_id)
            or public.has_tenant_permission(jp.tenant_id, 'application:read')
          )
        )
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

  if not public.has_active_asi_access(auth.uid()) then
    raise exception 'Active ASI membership and subscription are required to apply';
  end if;

  select *
  into v_job
  from public.job_postings
  where id = p_job_posting_id;

  if not found then
    raise exception 'Opportunity not found';
  end if;

  if v_job.status <> 'published' then
    raise exception 'This opportunity is not accepting applications right now';
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
    raise exception 'You already applied to this opportunity';
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

drop policy if exists "applications_select_for_owner_or_tenant_readers" on public.applications;
create policy "applications_select_for_owner_or_tenant_readers"
on public.applications
for select
to authenticated
using (
  public.is_platform_admin()
  or (
    public.has_active_asi_access(auth.uid())
    and (
      public.is_candidate_profile_owner(candidate_profile_id)
      or exists (
        select 1
        from public.job_postings jp
        where jp.id = job_posting_id
          and public.has_tenant_permission(jp.tenant_id, 'application:read')
      )
    )
  )
);

create or replace function public.review_recruiter_request(
  p_request_id uuid,
  p_decision public.recruiter_request_status,
  p_review_notes text default null
)
returns public.recruiter_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.recruiter_requests;
  v_tenant_id uuid;
  v_membership_id uuid;
  v_owner_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_platform_permission('recruiter_request:review') then
    raise exception 'Only platform admins can review recruiter requests';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Recruiter requests can only be approved or rejected';
  end if;

  select *
  into v_request
  from public.recruiter_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Recruiter request not found';
  end if;

  if v_request.status not in ('submitted', 'under_review') then
    raise exception 'Recruiter request is not pending review';
  end if;

  if p_decision = 'approved' then
    insert into public.tenants (slug, name, status, tenant_kind, created_by_user_id)
    values (
      v_request.requested_tenant_slug,
      v_request.requested_company_name,
      'active',
      v_request.requested_tenant_kind,
      v_request.requester_user_id
    )
    returning id into v_tenant_id;

    insert into public.company_profiles (
      tenant_id,
      profile_kind,
      legal_name,
      display_name,
      website_url,
      company_email,
      company_phone,
      country_code,
      description,
      logo_path,
      profile_metadata,
      is_public
    )
    values (
      v_tenant_id,
      v_request.requested_tenant_kind,
      coalesce(nullif(v_request.requested_company_legal_name, ''), v_request.requested_company_name),
      v_request.requested_company_name,
      v_request.company_website_url,
      v_request.company_email,
      v_request.company_phone,
      v_request.company_country_code,
      v_request.company_description,
      v_request.company_logo_path,
      v_request.request_metadata,
      false
    );

    insert into public.memberships (tenant_id, user_id, status, joined_at)
    values (v_tenant_id, v_request.requester_user_id, 'active', timezone('utc', now()))
    returning id into v_membership_id;

    select id
    into v_owner_role_id
    from public.tenant_roles
    where tenant_id is null
      and code = 'tenant_owner';

    if v_owner_role_id is null then
      raise exception 'Tenant owner role not found';
    end if;

    insert into public.membership_roles (membership_id, role_id, assigned_by_user_id)
    values (v_membership_id, v_owner_role_id, auth.uid())
    on conflict (membership_id, role_id) do update
    set
      assigned_at = timezone('utc', now()),
      assigned_by_user_id = excluded.assigned_by_user_id,
      revoked_at = null,
      revoked_by_user_id = null;

    update public.recruiter_requests
    set
      status = 'approved',
      review_notes = nullif(trim(p_review_notes), ''),
      reviewed_at = timezone('utc', now()),
      reviewed_by_user_id = auth.uid(),
      approved_tenant_id = v_tenant_id,
      updated_at = timezone('utc', now())
    where id = p_request_id
    returning * into v_request;

    insert into public.audit_logs (actor_user_id, tenant_id, event_type, entity_type, entity_id, payload)
    values (
      auth.uid(),
      v_tenant_id,
      'recruiter_request_approved',
      'recruiter_requests',
      v_request.id::text,
      jsonb_build_object(
        'requester_user_id', v_request.requester_user_id,
        'approved_tenant_id', v_tenant_id,
        'membership_id', v_membership_id,
        'requested_tenant_kind', v_request.requested_tenant_kind,
        'company_logo_path_retained_on_request', v_request.company_logo_path
      )
    );
  else
    update public.recruiter_requests
    set
      status = 'rejected',
      review_notes = nullif(trim(p_review_notes), ''),
      reviewed_at = timezone('utc', now()),
      reviewed_by_user_id = auth.uid(),
      updated_at = timezone('utc', now())
    where id = p_request_id
    returning * into v_request;

    insert into public.audit_logs (actor_user_id, event_type, entity_type, entity_id, payload)
    values (
      auth.uid(),
      'recruiter_request_rejected',
      'recruiter_requests',
      v_request.id::text,
      jsonb_build_object(
        'requester_user_id', v_request.requester_user_id,
        'requested_tenant_kind', v_request.requested_tenant_kind
      )
    );
  end if;

  return v_request;
end;
$$;

select private.attach_audit_trigger('public', 'opportunity_stage_templates');

commit;
