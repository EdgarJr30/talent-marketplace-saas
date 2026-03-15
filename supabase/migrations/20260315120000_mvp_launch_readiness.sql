create or replace function public.invite_tenant_member(
  p_tenant_id uuid,
  p_email text,
  p_role_id uuid default null
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_user public.users;
  v_membership public.memberships;
  v_existing_membership public.memberships;
  v_role public.tenant_roles;
begin
  if v_actor_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.is_platform_admin()
    or public.has_tenant_permission(p_tenant_id, 'member:invite')
  ) then
    raise exception 'Not enough permissions to invite members into this tenant';
  end if;

  select *
  into v_user
  from public.users
  where lower(email) = lower(trim(coalesce(p_email, '')))
  limit 1;

  if v_user.id is null then
    raise exception 'The invited email must belong to a registered platform user before it can join a workspace';
  end if;

  if p_role_id is not null then
    if not (
      public.is_platform_admin()
      or public.has_tenant_permission(p_tenant_id, 'role:assign')
    ) then
      raise exception 'Not enough permissions to assign roles in this tenant';
    end if;

    select *
    into v_role
    from public.tenant_roles
    where id = p_role_id
      and (tenant_id is null or tenant_id = p_tenant_id)
    limit 1;

    if v_role.id is null then
      raise exception 'The requested role does not belong to this tenant';
    end if;
  end if;

  select *
  into v_existing_membership
  from public.memberships
  where tenant_id = p_tenant_id
    and user_id = v_user.id
  for update;

  if v_existing_membership.id is null then
    insert into public.memberships (
      tenant_id,
      user_id,
      invited_by_user_id,
      status,
      joined_at
    )
    values (
      p_tenant_id,
      v_user.id,
      v_actor_user_id,
      'invited',
      timezone('utc', now())
    )
    returning * into v_membership;
  else
    update public.memberships
    set
      invited_by_user_id = v_actor_user_id,
      status = case
        when v_existing_membership.status = 'active' then 'active'
        else 'invited'
      end,
      updated_at = timezone('utc', now())
    where id = v_existing_membership.id
    returning * into v_membership;
  end if;

  if p_role_id is not null then
    update public.membership_roles
    set
      revoked_at = timezone('utc', now()),
      revoked_by_user_id = v_actor_user_id
    where membership_id = v_membership.id
      and revoked_at is null
      and role_id <> p_role_id;

    insert into public.membership_roles (
      membership_id,
      role_id,
      assigned_by_user_id,
      revoked_at,
      revoked_by_user_id
    )
    values (
      v_membership.id,
      p_role_id,
      v_actor_user_id,
      null,
      null
    )
    on conflict (membership_id, role_id) do update
    set
      assigned_at = timezone('utc', now()),
      assigned_by_user_id = excluded.assigned_by_user_id,
      revoked_at = null,
      revoked_by_user_id = null;
  end if;

  insert into public.audit_logs (
    actor_user_id,
    tenant_id,
    event_type,
    entity_type,
    entity_id,
    payload
  )
  values (
    v_actor_user_id,
    p_tenant_id,
    'member_invited',
    'memberships',
    v_membership.id::text,
    jsonb_build_object(
      'invited_user_id', v_user.id,
      'invited_email', v_user.email,
      'status', v_membership.status,
      'role_id', p_role_id
    )
  );

  return v_membership;
end;
$$;

create or replace function public.revoke_membership_invite(
  p_membership_id uuid
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_membership public.memberships;
begin
  if v_actor_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_membership
  from public.memberships
  where id = p_membership_id
  for update;

  if v_membership.id is null then
    raise exception 'Membership not found';
  end if;

  if not (
    public.is_platform_admin()
    or public.has_tenant_permission(v_membership.tenant_id, 'member:remove')
    or public.has_tenant_permission(v_membership.tenant_id, 'member:update')
  ) then
    raise exception 'Not enough permissions to revoke this invite';
  end if;

  if v_membership.status <> 'invited' then
    raise exception 'Only invited memberships can be revoked from this flow';
  end if;

  update public.memberships
  set
    status = 'revoked',
    updated_at = timezone('utc', now())
  where id = p_membership_id
  returning * into v_membership;

  update public.membership_roles
  set
    revoked_at = timezone('utc', now()),
    revoked_by_user_id = v_actor_user_id
  where membership_id = p_membership_id
    and revoked_at is null;

  insert into public.audit_logs (
    actor_user_id,
    tenant_id,
    event_type,
    entity_type,
    entity_id,
    payload
  )
  values (
    v_actor_user_id,
    v_membership.tenant_id,
    'member_invite_revoked',
    'memberships',
    v_membership.id::text,
    jsonb_build_object(
      'invited_user_id', v_membership.user_id,
      'status', v_membership.status
    )
  );

  return v_membership;
end;
$$;

grant execute on function public.invite_tenant_member(uuid, text, uuid) to authenticated;
grant execute on function public.revoke_membership_invite(uuid) to authenticated;
