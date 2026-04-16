begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_workflow_status') then
    create type public.review_workflow_status as enum (
      'submitted',
      'under_review',
      'needs_more_info',
      'approved',
      'rejected',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'authority_scope_type') then
    create type public.authority_scope_type as enum ('union', 'association', 'district', 'church');
  end if;

  if not exists (select 1 from pg_type where typname = 'authority_role_type') then
    create type public.authority_role_type as enum ('pastor_administrator', 'regional_administrator');
  end if;

  if not exists (select 1 from pg_type where typname = 'authority_scope_status') then
    create type public.authority_scope_status as enum ('active', 'revoked');
  end if;

  if not exists (select 1 from pg_type where typname = 'pastoral_reference_status') then
    create type public.pastoral_reference_status as enum (
      'pending',
      'contacted',
      'endorsed',
      'declined',
      'waived'
    );
  end if;
end
$$;

create table if not exists public.church_unions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  country_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint church_unions_code_format_chk check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.church_associations (
  id uuid primary key default gen_random_uuid(),
  union_id uuid not null references public.church_unions (id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint church_associations_code_format_chk check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists church_associations_union_code_unique_idx
  on public.church_associations (union_id, lower(code));

create table if not exists public.church_districts (
  id uuid primary key default gen_random_uuid(),
  association_id uuid not null references public.church_associations (id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint church_districts_code_format_chk check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists church_districts_association_code_unique_idx
  on public.church_districts (association_id, lower(code));

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.church_districts (id) on delete cascade,
  code text not null,
  name text not null,
  city text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint churches_code_format_chk check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists churches_district_code_unique_idx
  on public.churches (district_id, lower(code));

create table if not exists public.institutional_membership_applications (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid references public.users (id) on delete set null,
  status public.review_workflow_status not null default 'submitted',
  pastoral_reference_status public.pastoral_reference_status not null default 'pending',
  category_slug text not null,
  category_name text not null,
  dues text not null,
  applicant_first_name text not null,
  applicant_last_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  pastor_name text not null,
  pastor_email text not null,
  pastor_phone text not null,
  home_church_name text not null,
  church_city text not null,
  church_state_province text not null,
  conference_name text not null,
  submitted_form_snapshot jsonb not null default '{}'::jsonb,
  eligibility_snapshot jsonb not null default '{}'::jsonb,
  review_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists institutional_membership_applications_requester_status_idx
  on public.institutional_membership_applications (requester_user_id, status);

create index if not exists institutional_membership_applications_status_submitted_idx
  on public.institutional_membership_applications (status, submitted_at desc);

create table if not exists public.pastor_authority_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.users (id) on delete cascade,
  status public.review_workflow_status not null default 'submitted',
  identity_document_number text not null,
  identity_document_file_path text not null,
  first_names text not null,
  last_names text not null,
  phone_number text not null,
  union_id uuid references public.church_unions (id) on delete set null,
  association_id uuid references public.church_associations (id) on delete set null,
  district_id uuid references public.church_districts (id) on delete set null,
  church_ids uuid[] not null default '{}'::uuid[],
  pastor_status_attestation boolean not null default false,
  notes text,
  submitted_form_snapshot jsonb not null default '{}'::jsonb,
  review_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references public.users (id) on delete set null,
  approved_scope_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists pastor_authority_requests_open_request_per_user_unique_idx
  on public.pastor_authority_requests (requester_user_id)
  where status in ('submitted', 'under_review', 'needs_more_info');

create index if not exists pastor_authority_requests_status_submitted_idx
  on public.pastor_authority_requests (status, submitted_at desc);

create table if not exists public.regional_administrator_authority_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.users (id) on delete cascade,
  status public.review_workflow_status not null default 'submitted',
  identity_document_number text not null,
  identity_document_file_path text not null,
  first_names text not null,
  last_names text not null,
  phone_number text not null,
  admin_scope_type public.authority_scope_type not null,
  union_id uuid references public.church_unions (id) on delete set null,
  association_id uuid references public.church_associations (id) on delete set null,
  position_title text not null,
  appointment_document_file_path text not null,
  notes text,
  submitted_form_snapshot jsonb not null default '{}'::jsonb,
  review_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references public.users (id) on delete set null,
  approved_scope_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists regional_authority_requests_open_request_per_user_unique_idx
  on public.regional_administrator_authority_requests (requester_user_id)
  where status in ('submitted', 'under_review', 'needs_more_info');

create index if not exists regional_authority_requests_status_submitted_idx
  on public.regional_administrator_authority_requests (status, submitted_at desc);

create table if not exists public.user_authority_scopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  authority_role public.authority_role_type not null,
  scope_type public.authority_scope_type not null,
  status public.authority_scope_status not null default 'active',
  union_id uuid references public.church_unions (id) on delete set null,
  association_id uuid references public.church_associations (id) on delete set null,
  district_id uuid references public.church_districts (id) on delete set null,
  church_ids uuid[] not null default '{}'::uuid[],
  source_request_type text not null,
  source_request_id uuid not null,
  notes text,
  granted_by_user_id uuid references public.users (id) on delete set null,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_by_user_id uuid references public.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_authority_scopes_request_type_chk
    check (source_request_type in ('pastor_authority_request', 'regional_authority_request'))
);

create index if not exists user_authority_scopes_user_status_idx
  on public.user_authority_scopes (user_id, status);

create unique index if not exists user_authority_scopes_active_unique_idx
  on public.user_authority_scopes (
    user_id,
    authority_role,
    coalesce(union_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(association_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(district_id, '00000000-0000-0000-0000-000000000000'::uuid),
    scope_type
  )
  where status = 'active';

insert into public.permissions (code, resource, action, scope, description)
values
  ('user:approve', 'user', 'approve', 'platform', 'Approve user-level access and review states'),
  ('license:activate', 'license', 'activate', 'platform', 'Activate final ASI product licenses'),
  ('pastor_authority_request:read', 'pastor_authority_request', 'read', 'platform', 'Read pastor authority requests'),
  ('pastor_authority_request:review', 'pastor_authority_request', 'review', 'platform', 'Approve, reject, or request more information for pastor authority requests'),
  ('regional_authority_request:read', 'regional_authority_request', 'read', 'platform', 'Read regional administrator authority requests'),
  ('regional_authority_request:review', 'regional_authority_request', 'review', 'platform', 'Approve, reject, or request more information for regional administrator authority requests'),
  ('scoped_user_authorization:read', 'scoped_user_authorization', 'read', 'platform', 'Read scoped territorial authorization queues'),
  ('scoped_user_authorization:review', 'scoped_user_authorization', 'review', 'platform', 'Review scoped territorial user authorizations'),
  ('support_ticket:read', 'support_ticket', 'read', 'platform', 'Read support tickets and support-facing cases'),
  ('support_ticket:update', 'support_ticket', 'update', 'platform', 'Update support tickets and support-facing cases'),
  ('app_error_log:read', 'app_error_log', 'read', 'platform', 'Read captured application error logs'),
  ('candidate_profile:read_full', 'candidate_profile', 'read_full', 'tenant', 'Read full candidate profile data')
on conflict (code) do update
set
  resource = excluded.resource,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description;

insert into public.platform_roles (code, name, description, is_system, is_locked)
values
  ('super_administrator', 'Super Administrator', 'Full platform authority including licensing, authority review, and platform governance', true, true),
  ('platform_support', 'Platform Support', 'Operational support with licensing and diagnostics visibility', true, true),
  ('platform_moderator', 'Platform Moderator', 'Trust and safety reviewer without support or licensing powers by default', true, true),
  ('readonly_platform_auditor', 'Readonly Platform Auditor', 'Read-only operational and audit visibility', true, true),
  ('regional_administrator', 'Regional Administrator', 'Territorial administrator scoped to union or association approvals', true, true),
  ('pastor_administrator', 'Pastor Administrator', 'Pastoral authority scoped to district or church approvals', true, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_locked = excluded.is_locked;

insert into public.tenant_roles (tenant_id, code, name, description, is_system, is_locked)
values
  (null, 'opportunity_manager', 'Opportunity Manager', 'Coordinates opportunities and ATS workflow without tenant governance access', true, true),
  (null, 'application_reviewer', 'Application Reviewer', 'Reviews applications without owning opportunity creation', true, true),
  (null, 'tenant_billing_contact', 'Tenant Billing Contact', 'Reads tenant billing and plan status without recruiting operations', true, true),
  (null, 'professional_individual_user', 'Professional Individual User', 'Individual ASI member without tenant publishing authority', true, true)
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'platform_dashboard:read',
    'user:read',
    'user:update',
    'user:approve',
    'license:activate',
    'tenant:read',
    'tenant:create',
    'tenant:suspend',
    'tenant:restore',
    'recruiter_request:read',
    'recruiter_request:review',
    'pastor_authority_request:read',
    'pastor_authority_request:review',
    'regional_authority_request:read',
    'regional_authority_request:review',
    'scoped_user_authorization:read',
    'scoped_user_authorization:review',
    'role:read',
    'role:create',
    'role:update',
    'role:delete',
    'role:assign',
    'moderation:read',
    'moderation:act',
    'support_ticket:read',
    'support_ticket:update',
    'app_error_log:read',
    'audit_log:read',
    'plan:read',
    'plan:update',
    'billing:read',
    'feature_flag:read',
    'feature_flag:update'
  )
where pr.code = 'super_administrator'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'platform_dashboard:read',
    'user:read',
    'user:update',
    'license:activate',
    'tenant:read',
    'support_ticket:read',
    'support_ticket:update',
    'app_error_log:read',
    'audit_log:read',
    'billing:read',
    'plan:read'
  )
where pr.code = 'platform_support'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'moderation:read',
    'moderation:act',
    'tenant:read',
    'user:read',
    'audit_log:read'
  )
where pr.code = 'platform_moderator'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'platform_dashboard:read',
    'tenant:read',
    'user:read',
    'audit_log:read',
    'app_error_log:read'
  )
where pr.code = 'readonly_platform_auditor'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'pastor_authority_request:read',
    'pastor_authority_request:review',
    'scoped_user_authorization:read',
    'scoped_user_authorization:review',
    'user:read'
  )
where pr.code = 'regional_administrator'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select pr.id, p.id
from public.platform_roles pr
join public.permissions p
  on p.code in (
    'scoped_user_authorization:read',
    'scoped_user_authorization:review',
    'user:read'
  )
where pr.code = 'pastor_administrator'
on conflict do nothing;

insert into public.tenant_role_permissions (role_id, permission_id)
select tr.id, p.id
from public.tenant_roles tr
join public.permissions p
  on p.code in (
    'workspace:read',
    'company_profile:read',
    'job:create',
    'job:read',
    'job:update',
    'job:publish',
    'job:archive',
    'job:close',
    'application:read',
    'application:move_stage',
    'application:add_note',
    'application:rate'
  )
where tr.tenant_id is null
  and tr.code = 'opportunity_manager'
on conflict do nothing;

insert into public.tenant_role_permissions (role_id, permission_id)
select tr.id, p.id
from public.tenant_roles tr
join public.permissions p
  on p.code in (
    'workspace:read',
    'job:read',
    'application:read',
    'application:add_note',
    'application:rate',
    'candidate_profile:read_limited'
  )
where tr.tenant_id is null
  and tr.code = 'application_reviewer'
on conflict do nothing;

insert into public.tenant_role_permissions (role_id, permission_id)
select tr.id, p.id
from public.tenant_roles tr
join public.permissions p
  on p.code in ('workspace:read', 'plan:read', 'billing:read')
where tr.tenant_id is null
  and tr.code = 'tenant_billing_contact'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select legacy.id, target.permission_id
from public.platform_roles legacy
join (
  select prp.permission_id
  from public.platform_role_permissions prp
  join public.platform_roles pr on pr.id = prp.role_id
  where pr.code = 'super_administrator'
) as target on true
where legacy.code = 'platform_owner'
on conflict do nothing;

insert into public.platform_role_permissions (role_id, permission_id)
select legacy.id, target.permission_id
from public.platform_roles legacy
join (
  select prp.permission_id
  from public.platform_role_permissions prp
  join public.platform_roles pr on pr.id = prp.role_id
  where pr.code = 'platform_support'
) as target on true
where legacy.code = 'support_agent'
on conflict do nothing;

create or replace function public.guard_pastor_authority_request_submission()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> new.requester_user_id then
    raise exception 'You can only submit your own pastor authority request';
  end if;

  if not new.pastor_status_attestation then
    raise exception 'Pastor status attestation is required';
  end if;

  if new.union_id is null or new.association_id is null or new.district_id is null then
    raise exception 'Union, association, and district are required';
  end if;

  return new;
end;
$$;

create or replace function public.guard_regional_authority_request_submission()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> new.requester_user_id then
    raise exception 'You can only submit your own regional authority request';
  end if;

  if new.admin_scope_type not in ('union', 'association') then
    raise exception 'Regional administrators must request union or association scope';
  end if;

  if new.union_id is null then
    raise exception 'Union is required';
  end if;

  if new.admin_scope_type = 'association' and new.association_id is null then
    raise exception 'Association scope requires an association id';
  end if;

  return new;
end;
$$;

create or replace function public.has_active_authority_scope(
  p_role public.authority_role_type,
  p_union_id uuid default null,
  p_association_id uuid default null,
  p_district_id uuid default null,
  p_church_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.user_authority_scopes uas
    where uas.user_id = auth.uid()
      and uas.status = 'active'
      and uas.authority_role = p_role
      and (p_union_id is null or uas.union_id = p_union_id)
      and (p_association_id is null or uas.association_id = p_association_id)
      and (p_district_id is null or uas.district_id = p_district_id)
      and (
        p_church_id is null
        or coalesce(array_length(uas.church_ids, 1), 0) = 0
        or p_church_id = any(uas.church_ids)
      )
  );
$$;

create or replace function public.review_pastor_authority_request(
  p_request_id uuid,
  p_decision public.review_workflow_status,
  p_review_notes text default null
)
returns public.pastor_authority_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.pastor_authority_requests;
  v_scope public.user_authority_scopes;
  v_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_platform_permission('pastor_authority_request:review') then
    raise exception 'Only authorized reviewers can review pastor authority requests';
  end if;

  if p_decision not in ('approved', 'rejected', 'needs_more_info') then
    raise exception 'Pastor authority requests may only be approved, rejected, or marked as needing more information';
  end if;

  select *
  into v_request
  from public.pastor_authority_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Pastor authority request not found';
  end if;

  if v_request.status not in ('submitted', 'under_review', 'needs_more_info') then
    raise exception 'Pastor authority request is not pending review';
  end if;

  if p_decision = 'approved' then
    insert into public.user_authority_scopes (
      user_id,
      authority_role,
      scope_type,
      union_id,
      association_id,
      district_id,
      church_ids,
      source_request_type,
      source_request_id,
      notes,
      granted_by_user_id
    )
    values (
      v_request.requester_user_id,
      'pastor_administrator',
      case
        when coalesce(array_length(v_request.church_ids, 1), 0) > 0 then 'church'
        else 'district'
      end,
      v_request.union_id,
      v_request.association_id,
      v_request.district_id,
      v_request.church_ids,
      'pastor_authority_request',
      v_request.id,
      nullif(trim(p_review_notes), ''),
      auth.uid()
    )
    on conflict do nothing
    returning * into v_scope;

    if v_scope.id is null then
      select *
      into v_scope
      from public.user_authority_scopes
      where user_id = v_request.requester_user_id
        and authority_role = 'pastor_administrator'
        and status = 'active'
        and district_id is not distinct from v_request.district_id
      order by created_at desc
      limit 1;
    end if;

    select id
    into v_role_id
    from public.platform_roles
    where code = 'pastor_administrator';

    if v_role_id is null then
      raise exception 'Pastor administrator role not found';
    end if;

    insert into public.user_platform_roles (user_id, role_id, assigned_by_user_id)
    values (v_request.requester_user_id, v_role_id, auth.uid())
    on conflict (user_id, role_id) do update
    set
      assigned_at = timezone('utc', now()),
      assigned_by_user_id = excluded.assigned_by_user_id,
      revoked_at = null,
      revoked_by_user_id = null;
  end if;

  update public.pastor_authority_requests
  set
    status = p_decision,
    review_notes = nullif(trim(p_review_notes), ''),
    reviewed_at = timezone('utc', now()),
    reviewed_by_user_id = auth.uid(),
    approved_scope_id = case when p_decision = 'approved' then v_scope.id else approved_scope_id end,
    updated_at = timezone('utc', now())
  where id = p_request_id
  returning * into v_request;

  insert into public.audit_logs (actor_user_id, event_type, entity_type, entity_id, payload)
  values (
    auth.uid(),
    concat('pastor_authority_request_', p_decision::text),
    'pastor_authority_requests',
    v_request.id::text,
    jsonb_build_object(
      'requester_user_id', v_request.requester_user_id,
      'approved_scope_id', v_scope.id
    )
  );

  return v_request;
end;
$$;

create or replace function public.review_regional_authority_request(
  p_request_id uuid,
  p_decision public.review_workflow_status,
  p_review_notes text default null
)
returns public.regional_administrator_authority_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.regional_administrator_authority_requests;
  v_scope public.user_authority_scopes;
  v_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_platform_permission('regional_authority_request:review') then
    raise exception 'Only authorized reviewers can review regional authority requests';
  end if;

  if p_decision not in ('approved', 'rejected', 'needs_more_info') then
    raise exception 'Regional authority requests may only be approved, rejected, or marked as needing more information';
  end if;

  select *
  into v_request
  from public.regional_administrator_authority_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Regional authority request not found';
  end if;

  if v_request.status not in ('submitted', 'under_review', 'needs_more_info') then
    raise exception 'Regional authority request is not pending review';
  end if;

  if p_decision = 'approved' then
    insert into public.user_authority_scopes (
      user_id,
      authority_role,
      scope_type,
      union_id,
      association_id,
      source_request_type,
      source_request_id,
      notes,
      granted_by_user_id
    )
    values (
      v_request.requester_user_id,
      'regional_administrator',
      v_request.admin_scope_type,
      v_request.union_id,
      v_request.association_id,
      'regional_authority_request',
      v_request.id,
      nullif(trim(p_review_notes), ''),
      auth.uid()
    )
    on conflict do nothing
    returning * into v_scope;

    if v_scope.id is null then
      select *
      into v_scope
      from public.user_authority_scopes
      where user_id = v_request.requester_user_id
        and authority_role = 'regional_administrator'
        and status = 'active'
        and union_id is not distinct from v_request.union_id
        and association_id is not distinct from v_request.association_id
      order by created_at desc
      limit 1;
    end if;

    select id
    into v_role_id
    from public.platform_roles
    where code = 'regional_administrator';

    if v_role_id is null then
      raise exception 'Regional administrator role not found';
    end if;

    insert into public.user_platform_roles (user_id, role_id, assigned_by_user_id)
    values (v_request.requester_user_id, v_role_id, auth.uid())
    on conflict (user_id, role_id) do update
    set
      assigned_at = timezone('utc', now()),
      assigned_by_user_id = excluded.assigned_by_user_id,
      revoked_at = null,
      revoked_by_user_id = null;
  end if;

  update public.regional_administrator_authority_requests
  set
    status = p_decision,
    review_notes = nullif(trim(p_review_notes), ''),
    reviewed_at = timezone('utc', now()),
    reviewed_by_user_id = auth.uid(),
    approved_scope_id = case when p_decision = 'approved' then v_scope.id else approved_scope_id end,
    updated_at = timezone('utc', now())
  where id = p_request_id
  returning * into v_request;

  insert into public.audit_logs (actor_user_id, event_type, entity_type, entity_id, payload)
  values (
    auth.uid(),
    concat('regional_authority_request_', p_decision::text),
    'regional_administrator_authority_requests',
    v_request.id::text,
    jsonb_build_object(
      'requester_user_id', v_request.requester_user_id,
      'approved_scope_id', v_scope.id
    )
  );

  return v_request;
end;
$$;

create or replace function public.validate_job_posting_tenant_kind()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_tenant_kind public.tenant_kind;
begin
  if new.opportunity_type <> 'employment' then
    return new;
  end if;

  select tenant_kind
  into v_tenant_kind
  from public.tenants
  where id = new.tenant_id;

  if v_tenant_kind is null then
    raise exception 'Employment opportunities require a valid tenant';
  end if;

  if v_tenant_kind <> 'company' then
    raise exception 'Only company tenants may create or publish employment opportunities';
  end if;

  return new;
end;
$$;

drop trigger if exists pastor_authority_requests_validate on public.pastor_authority_requests;
create trigger pastor_authority_requests_validate
before insert or update on public.pastor_authority_requests
for each row
execute function public.guard_pastor_authority_request_submission();

drop trigger if exists regional_authority_requests_validate on public.regional_administrator_authority_requests;
create trigger regional_authority_requests_validate
before insert or update on public.regional_administrator_authority_requests
for each row
execute function public.guard_regional_authority_request_submission();

drop trigger if exists job_postings_validate_tenant_kind on public.job_postings;
create trigger job_postings_validate_tenant_kind
before insert or update on public.job_postings
for each row
execute function public.validate_job_posting_tenant_kind();

drop trigger if exists church_unions_set_updated_at on public.church_unions;
create trigger church_unions_set_updated_at
before update on public.church_unions
for each row
execute function public.set_row_updated_at();

drop trigger if exists church_associations_set_updated_at on public.church_associations;
create trigger church_associations_set_updated_at
before update on public.church_associations
for each row
execute function public.set_row_updated_at();

drop trigger if exists church_districts_set_updated_at on public.church_districts;
create trigger church_districts_set_updated_at
before update on public.church_districts
for each row
execute function public.set_row_updated_at();

drop trigger if exists churches_set_updated_at on public.churches;
create trigger churches_set_updated_at
before update on public.churches
for each row
execute function public.set_row_updated_at();

drop trigger if exists institutional_membership_applications_set_updated_at on public.institutional_membership_applications;
create trigger institutional_membership_applications_set_updated_at
before update on public.institutional_membership_applications
for each row
execute function public.set_row_updated_at();

drop trigger if exists pastor_authority_requests_set_updated_at on public.pastor_authority_requests;
create trigger pastor_authority_requests_set_updated_at
before update on public.pastor_authority_requests
for each row
execute function public.set_row_updated_at();

drop trigger if exists regional_authority_requests_set_updated_at on public.regional_administrator_authority_requests;
create trigger regional_authority_requests_set_updated_at
before update on public.regional_administrator_authority_requests
for each row
execute function public.set_row_updated_at();

drop trigger if exists user_authority_scopes_set_updated_at on public.user_authority_scopes;
create trigger user_authority_scopes_set_updated_at
before update on public.user_authority_scopes
for each row
execute function public.set_row_updated_at();

alter table public.church_unions enable row level security;
alter table public.church_associations enable row level security;
alter table public.church_districts enable row level security;
alter table public.churches enable row level security;
alter table public.institutional_membership_applications enable row level security;
alter table public.pastor_authority_requests enable row level security;
alter table public.regional_administrator_authority_requests enable row level security;
alter table public.user_authority_scopes enable row level security;

drop policy if exists "church_unions_readable_to_authenticated" on public.church_unions;
create policy "church_unions_readable_to_authenticated"
on public.church_unions
for select
to authenticated
using (true);

drop policy if exists "church_associations_readable_to_authenticated" on public.church_associations;
create policy "church_associations_readable_to_authenticated"
on public.church_associations
for select
to authenticated
using (true);

drop policy if exists "church_districts_readable_to_authenticated" on public.church_districts;
create policy "church_districts_readable_to_authenticated"
on public.church_districts
for select
to authenticated
using (true);

drop policy if exists "churches_readable_to_authenticated" on public.churches;
create policy "churches_readable_to_authenticated"
on public.churches
for select
to authenticated
using (true);

drop policy if exists "institutional_membership_applications_insert_public" on public.institutional_membership_applications;
create policy "institutional_membership_applications_insert_public"
on public.institutional_membership_applications
for insert
to anon, authenticated
with check (
  requester_user_id is null
  or requester_user_id = auth.uid()
);

drop policy if exists "institutional_membership_applications_read_self_or_reviewer" on public.institutional_membership_applications;
create policy "institutional_membership_applications_read_self_or_reviewer"
on public.institutional_membership_applications
for select
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('user:approve')
  or public.has_platform_permission('audit_log:read')
);

drop policy if exists "institutional_membership_applications_reviewer_update" on public.institutional_membership_applications;
create policy "institutional_membership_applications_reviewer_update"
on public.institutional_membership_applications
for update
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('user:approve')
)
with check (
  requester_user_id = auth.uid()
  or public.has_platform_permission('user:approve')
);

drop policy if exists "pastor_authority_requests_select_self_or_reviewer" on public.pastor_authority_requests;
create policy "pastor_authority_requests_select_self_or_reviewer"
on public.pastor_authority_requests
for select
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('pastor_authority_request:read')
  or public.has_platform_permission('pastor_authority_request:review')
);

drop policy if exists "pastor_authority_requests_insert_self" on public.pastor_authority_requests;
create policy "pastor_authority_requests_insert_self"
on public.pastor_authority_requests
for insert
to authenticated
with check (requester_user_id = auth.uid());

drop policy if exists "pastor_authority_requests_update_self_or_reviewer" on public.pastor_authority_requests;
create policy "pastor_authority_requests_update_self_or_reviewer"
on public.pastor_authority_requests
for update
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('pastor_authority_request:review')
)
with check (
  requester_user_id = auth.uid()
  or public.has_platform_permission('pastor_authority_request:review')
);

drop policy if exists "regional_authority_requests_select_self_or_reviewer" on public.regional_administrator_authority_requests;
create policy "regional_authority_requests_select_self_or_reviewer"
on public.regional_administrator_authority_requests
for select
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('regional_authority_request:read')
  or public.has_platform_permission('regional_authority_request:review')
);

drop policy if exists "regional_authority_requests_insert_self" on public.regional_administrator_authority_requests;
create policy "regional_authority_requests_insert_self"
on public.regional_administrator_authority_requests
for insert
to authenticated
with check (requester_user_id = auth.uid());

drop policy if exists "regional_authority_requests_update_self_or_reviewer" on public.regional_administrator_authority_requests;
create policy "regional_authority_requests_update_self_or_reviewer"
on public.regional_administrator_authority_requests
for update
to authenticated
using (
  requester_user_id = auth.uid()
  or public.has_platform_permission('regional_authority_request:review')
)
with check (
  requester_user_id = auth.uid()
  or public.has_platform_permission('regional_authority_request:review')
);

drop policy if exists "user_authority_scopes_read_self_or_reviewer" on public.user_authority_scopes;
create policy "user_authority_scopes_read_self_or_reviewer"
on public.user_authority_scopes
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_platform_permission('scoped_user_authorization:read')
  or public.has_platform_permission('scoped_user_authorization:review')
);

drop policy if exists "user_authority_scopes_reviewer_manage" on public.user_authority_scopes;
create policy "user_authority_scopes_reviewer_manage"
on public.user_authority_scopes
for all
to authenticated
using (public.has_platform_permission('scoped_user_authorization:review'))
with check (public.has_platform_permission('scoped_user_authorization:review'));

grant select on public.church_unions to authenticated;
grant select on public.church_associations to authenticated;
grant select on public.church_districts to authenticated;
grant select on public.churches to authenticated;
grant select, insert, update on public.institutional_membership_applications to anon, authenticated;
grant select, insert, update on public.pastor_authority_requests to authenticated;
grant select, insert, update on public.regional_administrator_authority_requests to authenticated;
grant select, insert, update, delete on public.user_authority_scopes to authenticated;
grant execute on function public.has_active_authority_scope(public.authority_role_type, uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.review_pastor_authority_request(uuid, public.review_workflow_status, text) to authenticated;
grant execute on function public.review_regional_authority_request(uuid, public.review_workflow_status, text) to authenticated;

insert into public.church_unions (code, name, country_code)
values ('republica-dominicana', 'Republica Dominicana', 'DO')
on conflict (code) do update
set
  name = excluded.name,
  country_code = excluded.country_code;

insert into public.church_associations (union_id, code, name)
select cu.id, values_table.code, values_table.name
from public.church_unions cu
cross join (
  values
    ('asociacion-sur', 'Asociacion Sur'),
    ('asociacion-norte', 'Asociacion Norte'),
    ('asociacion-sureste', 'Asociacion Sureste')
) as values_table(code, name)
where cu.code = 'republica-dominicana'
on conflict do nothing;

commit;
