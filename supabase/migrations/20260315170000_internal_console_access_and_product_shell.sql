alter table public.users
add column if not exists is_internal_developer boolean not null default false;

create or replace function public.can_access_internal_console()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists(
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.is_internal_developer = true
    );
$$;

grant execute on function public.can_access_internal_console() to authenticated;
