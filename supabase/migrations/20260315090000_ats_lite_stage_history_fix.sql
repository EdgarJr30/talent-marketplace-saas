begin;

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
  v_target_stage public.pipeline_stages%rowtype;
  v_actor_user_id uuid := auth.uid();
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_previous_stage_id uuid;
begin
  if v_actor_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_application
  from public.applications
  where id = p_application_id;

  if not found then
    raise exception 'Application not found';
  end if;

  select *
  into v_job
  from public.job_postings
  where id = v_application.job_posting_id;

  if not found then
    raise exception 'Job posting not found';
  end if;

  if not public.has_tenant_permission(v_job.tenant_id, 'application:move_stage') then
    raise exception 'You do not have permission to move applications for this tenant';
  end if;

  select *
  into v_target_stage
  from public.pipeline_stages
  where id = p_to_stage_id
    and (tenant_id is null or tenant_id = v_job.tenant_id);

  if not found then
    raise exception 'Target stage is not available for this tenant';
  end if;

  v_previous_stage_id := v_application.current_stage_id;

  update public.applications
  set
    current_stage_id = v_target_stage.id,
    status_public = public.sync_application_public_status_from_stage(v_target_stage.code),
    updated_at = timezone('utc', now())
  where id = v_application.id
  returning * into v_application;

  insert into public.application_stage_history (
    application_id,
    from_stage_id,
    to_stage_id,
    changed_by_user_id,
    note,
    changed_at
  )
  values (
    v_application.id,
    v_previous_stage_id,
    v_target_stage.id,
    v_actor_user_id,
    v_note,
    timezone('utc', now())
  );

  return v_application;
end;
$$;

commit;
