create type public.job_posting_status as enum ('draft', 'published', 'closed', 'archived');
create type public.job_workplace_type as enum ('on_site', 'hybrid', 'remote');
create type public.job_employment_type as enum ('full_time', 'part_time', 'contract', 'temporary', 'internship');
create type public.job_screening_answer_type as enum ('short_text', 'long_text', 'yes_no', 'single_select');

create table if not exists public.job_postings (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  company_profile_id uuid not null references public.company_profiles (id) on delete cascade,
  created_by_user_id uuid references public.users (id) on delete set null,
  title text not null,
  slug text not null,
  status public.job_posting_status not null default 'draft',
  summary text not null,
  description text not null,
  workplace_type public.job_workplace_type not null default 'remote',
  employment_type public.job_employment_type not null default 'full_time',
  city_name text,
  country_code text,
  salary_visible boolean not null default false,
  salary_min_amount integer,
  salary_max_amount integer,
  salary_currency text,
  experience_level text,
  is_featured boolean not null default false,
  published_at timestamptz,
  closed_at timestamptz,
  archived_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint job_postings_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint job_postings_salary_range_chk check (
    salary_min_amount is null
    or salary_max_amount is null
    or salary_min_amount <= salary_max_amount
  )
);

create unique index if not exists job_postings_slug_unique_idx on public.job_postings (lower(slug));
create index if not exists job_postings_tenant_status_idx on public.job_postings (tenant_id, status);
create index if not exists job_postings_public_idx on public.job_postings (status, published_at desc);

create table if not exists public.job_screening_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  job_posting_id uuid not null references public.job_postings (id) on delete cascade,
  question_text text not null,
  answer_type public.job_screening_answer_type not null default 'short_text',
  helper_text text,
  options_json jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists job_screening_questions_job_idx
  on public.job_screening_questions (job_posting_id, sort_order);

create table if not exists public.saved_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  job_posting_id uuid not null references public.job_postings (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (candidate_profile_id, job_posting_id)
);

create index if not exists saved_jobs_candidate_idx
  on public.saved_jobs (candidate_profile_id, created_at desc);

create table if not exists public.job_alerts (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  label text not null,
  criteria_json jsonb not null default '{}'::jsonb,
  frequency text not null default 'weekly',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_job_posting_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' and new.published_at is null then
    new.published_at := timezone('utc', now());
  end if;

  if new.status = 'closed' and old.status is distinct from 'closed' and new.closed_at is null then
    new.closed_at := timezone('utc', now());
  end if;

  if new.status = 'archived' and old.status is distinct from 'archived' and new.archived_at is null then
    new.archived_at := timezone('utc', now());
  end if;

  if new.status <> 'closed' then
    new.closed_at := null;
  end if;

  if new.status <> 'archived' then
    new.archived_at := null;
  end if;

  return new;
end;
$$;

grant select, insert, update, delete on public.job_postings to authenticated;
grant select, insert, update, delete on public.job_screening_questions to authenticated;
grant select, insert, delete on public.saved_jobs to authenticated;
grant select, insert, update, delete on public.job_alerts to authenticated;

alter table public.job_postings enable row level security;
alter table public.job_screening_questions enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_alerts enable row level security;

create policy "job_postings_public_or_tenant_read"
on public.job_postings
for select
to authenticated, anon
using (
  status = 'published'
  or public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'job:read')
);

create policy "job_postings_insert_for_creators"
on public.job_postings
for insert
to authenticated
with check (public.has_tenant_permission(tenant_id, 'job:create'));

create policy "job_postings_update_for_authorized_members"
on public.job_postings
for update
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'job:update')
  or (status = 'published' and public.has_tenant_permission(tenant_id, 'job:publish'))
)
with check (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'job:update')
  or (
    status in ('published', 'closed', 'archived')
    and (
      public.has_tenant_permission(tenant_id, 'job:publish')
      or public.has_tenant_permission(tenant_id, 'job:close')
      or public.has_tenant_permission(tenant_id, 'job:archive')
    )
  )
);

create policy "job_screening_questions_public_or_tenant_read"
on public.job_screening_questions
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and (
        jp.status = 'published'
        or public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'job:read')
      )
  )
);

create policy "job_screening_questions_write_for_authorized_members"
on public.job_screening_questions
for all
to authenticated
using (
  exists (
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
  exists (
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

create policy "saved_jobs_select_own"
on public.saved_jobs
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "saved_jobs_insert_own"
on public.saved_jobs
for insert
to authenticated
with check (
  public.is_candidate_profile_owner(candidate_profile_id)
  and exists (
    select 1
    from public.job_postings jp
    where jp.id = job_posting_id
      and jp.status = 'published'
  )
);

create policy "saved_jobs_delete_own"
on public.saved_jobs
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "job_alerts_select_own"
on public.job_alerts
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "job_alerts_insert_own"
on public.job_alerts
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "job_alerts_update_own"
on public.job_alerts
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "job_alerts_delete_own"
on public.job_alerts
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at
before update on public.job_postings
for each row execute procedure public.set_row_updated_at();

drop trigger if exists job_postings_status_timestamps on public.job_postings;
create trigger job_postings_status_timestamps
before update on public.job_postings
for each row execute procedure public.touch_job_posting_status_timestamps();

drop trigger if exists job_screening_questions_set_updated_at on public.job_screening_questions;
create trigger job_screening_questions_set_updated_at
before update on public.job_screening_questions
for each row execute procedure public.set_row_updated_at();

drop trigger if exists job_alerts_set_updated_at on public.job_alerts;
create trigger job_alerts_set_updated_at
before update on public.job_alerts
for each row execute procedure public.set_row_updated_at();

select private.attach_audit_trigger('public', 'job_postings');
select private.attach_audit_trigger('public', 'job_screening_questions');
select private.attach_audit_trigger('public', 'saved_jobs');
select private.attach_audit_trigger('public', 'job_alerts');
