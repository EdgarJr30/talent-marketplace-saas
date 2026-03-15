create table if not exists public.pipeline_stages (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  code text not null,
  name text not null,
  position integer not null default 0,
  color_token text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pipeline_stages_code_format_chk check (code ~ '^[a-z0-9_]+$')
);

create unique index if not exists pipeline_stages_system_code_unique_idx
  on public.pipeline_stages (lower(code))
  where tenant_id is null;

create unique index if not exists pipeline_stages_tenant_code_unique_idx
  on public.pipeline_stages (tenant_id, lower(code))
  where tenant_id is not null;

alter table public.applications
  add column if not exists current_stage_id uuid references public.pipeline_stages (id) on delete set null;

create table if not exists public.application_stage_history (
  id uuid primary key default extensions.gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  from_stage_id uuid references public.pipeline_stages (id) on delete set null,
  to_stage_id uuid not null references public.pipeline_stages (id) on delete restrict,
  changed_by_user_id uuid references public.users (id) on delete set null,
  note text,
  changed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists application_stage_history_application_idx
  on public.application_stage_history (application_id, changed_at desc);

create table if not exists public.application_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_user_id uuid references public.users (id) on delete set null,
  body text not null,
  visibility text not null default 'tenant',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists application_notes_application_idx
  on public.application_notes (application_id, created_at desc);

create table if not exists public.application_ratings (
  id uuid primary key default extensions.gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_user_id uuid references public.users (id) on delete set null,
  score integer not null,
  rubric_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint application_ratings_score_chk check (score between 1 and 5),
  unique (application_id, author_user_id)
);

create index if not exists application_ratings_application_idx
  on public.application_ratings (application_id, created_at desc);

insert into public.pipeline_stages (tenant_id, code, name, position, color_token, is_system)
values
  (null, 'applied', 'Applied', 0, 'sky', true),
  (null, 'screening', 'Screening', 1, 'amber', true),
  (null, 'interview', 'Interview', 2, 'violet', true),
  (null, 'offer', 'Offer', 3, 'emerald', true),
  (null, 'hired', 'Hired', 4, 'emerald', true),
  (null, 'rejected', 'Rejected', 5, 'rose', true)
on conflict do nothing;

update public.applications a
set current_stage_id = stage.id
from public.pipeline_stages stage
where a.current_stage_id is null
  and stage.tenant_id is null
  and stage.code = case
    when a.status_public = 'submitted' then 'applied'
    when a.status_public = 'in_review' then 'screening'
    when a.status_public = 'interviewing' then 'interview'
    when a.status_public = 'offer' then 'offer'
    when a.status_public = 'hired' then 'hired'
    when a.status_public in ('rejected', 'withdrawn') then 'rejected'
    else 'applied'
  end;

insert into public.application_stage_history (
  application_id,
  from_stage_id,
  to_stage_id,
  changed_by_user_id,
  note
)
select
  a.id,
  null,
  a.current_stage_id,
  null,
  'Initial ATS stage seeded from application status'
from public.applications a
where a.current_stage_id is not null
  and not exists (
    select 1
    from public.application_stage_history ash
    where ash.application_id = a.id
  );

create or replace function public.sync_application_public_status_from_stage(stage_code text)
returns public.application_public_status
language sql
immutable
as $$
  select case stage_code
    when 'applied' then 'submitted'::public.application_public_status
    when 'screening' then 'in_review'::public.application_public_status
    when 'interview' then 'interviewing'::public.application_public_status
    when 'offer' then 'offer'::public.application_public_status
    when 'hired' then 'hired'::public.application_public_status
    when 'rejected' then 'rejected'::public.application_public_status
    else 'in_review'::public.application_public_status
  end;
$$;

create or replace function public.move_application_stage(
  p_application_id uuid,
  p_to_stage_id uuid,
  p_note text default null
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.applications%rowtype;
  v_job public.job_postings%rowtype;
  v_to_stage public.pipeline_stages%rowtype;
  v_from_stage_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_application
  from public.applications
  where id = p_application_id;

  if not found then
    raise exception 'Application not found';
  end if;

  select * into v_job
  from public.job_postings
  where id = v_application.job_posting_id;

  if not found then
    raise exception 'Job not found for application';
  end if;

  if not public.has_tenant_permission(v_job.tenant_id, 'application:move_stage') then
    raise exception 'Permission denied to move this application';
  end if;

  select * into v_to_stage
  from public.pipeline_stages
  where id = p_to_stage_id
    and (tenant_id is null or tenant_id = v_job.tenant_id);

  if not found then
    raise exception 'Stage not available for this tenant';
  end if;

  v_from_stage_id := v_application.current_stage_id;

  update public.applications
  set
    current_stage_id = v_to_stage.id,
    status_public = public.sync_application_public_status_from_stage(v_to_stage.code)
  where id = p_application_id
  returning * into v_application;

  insert into public.application_stage_history (
    application_id,
    from_stage_id,
    to_stage_id,
    changed_by_user_id,
    note
  )
  values (
    p_application_id,
    v_from_stage_id,
    v_to_stage.id,
    auth.uid(),
    nullif(trim(coalesce(p_note, '')), '')
  );

  return v_application;
end;
$$;

grant select, insert, update, delete on public.pipeline_stages to authenticated;
grant select, insert on public.application_stage_history to authenticated;
grant select, insert, update, delete on public.application_notes to authenticated;
grant select, insert, update, delete on public.application_ratings to authenticated;
grant execute on function public.sync_application_public_status_from_stage(text) to authenticated;
grant execute on function public.move_application_stage(uuid, uuid, text) to authenticated;

alter table public.pipeline_stages enable row level security;
alter table public.application_stage_history enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_ratings enable row level security;

create policy "pipeline_stages_select_public_or_tenant_readers"
on public.pipeline_stages
for select
to authenticated
using (
  tenant_id is null
  or public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'application:read')
);

create policy "pipeline_stages_manage_for_tenant_authority"
on public.pipeline_stages
for all
to authenticated
using (
  tenant_id is not null
  and (
    public.is_platform_admin()
    or public.has_tenant_permission(tenant_id, 'role:update')
  )
)
with check (
  tenant_id is not null
  and (
    public.is_platform_admin()
    or public.has_tenant_permission(tenant_id, 'role:update')
  )
);

create policy "application_stage_history_select_for_application_readers"
on public.application_stage_history
for select
to authenticated
using (public.can_read_application(application_id));

create policy "application_notes_select_for_application_readers"
on public.application_notes
for select
to authenticated
using (public.can_read_application(application_id));

create policy "application_notes_write_for_note_authors"
on public.application_notes
for all
to authenticated
using (
  exists (
    select 1
    from public.applications a
    join public.job_postings jp
      on jp.id = a.job_posting_id
    where a.id = application_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:add_note')
      )
  )
)
with check (
  exists (
    select 1
    from public.applications a
    join public.job_postings jp
      on jp.id = a.job_posting_id
    where a.id = application_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:add_note')
      )
  )
);

create policy "application_ratings_select_for_application_readers"
on public.application_ratings
for select
to authenticated
using (public.can_read_application(application_id));

create policy "application_ratings_write_for_raters"
on public.application_ratings
for all
to authenticated
using (
  exists (
    select 1
    from public.applications a
    join public.job_postings jp
      on jp.id = a.job_posting_id
    where a.id = application_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:rate')
      )
  )
)
with check (
  exists (
    select 1
    from public.applications a
    join public.job_postings jp
      on jp.id = a.job_posting_id
    where a.id = application_id
      and (
        public.is_platform_admin()
        or public.has_tenant_permission(jp.tenant_id, 'application:rate')
      )
  )
);

drop trigger if exists pipeline_stages_set_updated_at on public.pipeline_stages;
create trigger pipeline_stages_set_updated_at
before update on public.pipeline_stages
for each row execute procedure public.set_row_updated_at();

drop trigger if exists application_notes_set_updated_at on public.application_notes;
create trigger application_notes_set_updated_at
before update on public.application_notes
for each row execute procedure public.set_row_updated_at();

drop trigger if exists application_ratings_set_updated_at on public.application_ratings;
create trigger application_ratings_set_updated_at
before update on public.application_ratings
for each row execute procedure public.set_row_updated_at();

select private.attach_audit_trigger('public', 'pipeline_stages');
select private.attach_audit_trigger('public', 'application_stage_history');
select private.attach_audit_trigger('public', 'application_notes');
select private.attach_audit_trigger('public', 'application_ratings');
