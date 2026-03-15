create table if not exists public.candidate_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  headline text,
  summary text,
  city_name text,
  country_code text,
  desired_role text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  completeness_score integer not null default 0 check (completeness_score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.candidate_resumes (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  storage_path text not null unique,
  filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 5242880),
  is_default boolean not null default false,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.candidate_experiences (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  company_name text not null,
  role_title text not null,
  employment_type text,
  city_name text,
  country_code text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint candidate_experiences_date_range check (end_date is null or end_date >= start_date)
);

create table if not exists public.candidate_educations (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  institution_name text not null,
  degree_name text not null,
  field_of_study text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint candidate_educations_date_range check (
    start_date is null
    or end_date is null
    or end_date >= start_date
  )
);

create table if not exists public.candidate_skills (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  skill_name text not null,
  proficiency_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.candidate_languages (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  language_name text not null,
  proficiency_label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.candidate_links (
  id uuid primary key default extensions.gen_random_uuid(),
  candidate_profile_id uuid not null references public.candidate_profiles (id) on delete cascade,
  link_type text not null default 'other' check (link_type in ('portfolio', 'linkedin', 'github', 'website', 'other')),
  label text,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists candidate_resumes_default_idx
  on public.candidate_resumes (candidate_profile_id)
  where is_default = true;

create index if not exists candidate_resumes_profile_idx
  on public.candidate_resumes (candidate_profile_id, uploaded_at desc);

create index if not exists candidate_experiences_profile_idx
  on public.candidate_experiences (candidate_profile_id, sort_order, start_date desc);

create index if not exists candidate_educations_profile_idx
  on public.candidate_educations (candidate_profile_id, sort_order, end_date desc);

create index if not exists candidate_skills_profile_idx
  on public.candidate_skills (candidate_profile_id, sort_order);

create index if not exists candidate_languages_profile_idx
  on public.candidate_languages (candidate_profile_id, sort_order);

create index if not exists candidate_links_profile_idx
  on public.candidate_links (candidate_profile_id, sort_order);

create or replace function public.is_candidate_profile_owner(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.candidate_profiles candidate_profile
    where candidate_profile.id = p_profile_id
      and candidate_profile.user_id = auth.uid()
  );
$$;

create or replace function public.set_candidate_profile_completeness()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  score integer := 0;
  experience_count integer := 0;
  education_count integer := 0;
  skill_count integer := 0;
  language_count integer := 0;
  link_count integer := 0;
  resume_count integer := 0;
begin
  select count(*) into experience_count
  from public.candidate_experiences
  where candidate_profile_id = new.id;

  select count(*) into education_count
  from public.candidate_educations
  where candidate_profile_id = new.id;

  select count(*) into skill_count
  from public.candidate_skills
  where candidate_profile_id = new.id;

  select count(*) into language_count
  from public.candidate_languages
  where candidate_profile_id = new.id;

  select count(*) into link_count
  from public.candidate_links
  where candidate_profile_id = new.id;

  select count(*) into resume_count
  from public.candidate_resumes
  where candidate_profile_id = new.id;

  if nullif(trim(coalesce(new.headline, '')), '') is not null then
    score := score + 10;
  end if;

  if nullif(trim(coalesce(new.summary, '')), '') is not null then
    score := score + 10;
  end if;

  if nullif(trim(coalesce(new.city_name, '')), '') is not null
     and nullif(trim(coalesce(new.country_code, '')), '') is not null then
    score := score + 10;
  end if;

  if nullif(trim(coalesce(new.desired_role, '')), '') is not null then
    score := score + 10;
  end if;

  if experience_count > 0 then
    score := score + 15;
  end if;

  if education_count > 0 then
    score := score + 10;
  end if;

  if skill_count >= 3 then
    score := score + 15;
  elsif skill_count > 0 then
    score := score + 8;
  end if;

  if language_count > 0 then
    score := score + 10;
  end if;

  if link_count > 0 then
    score := score + 5;
  end if;

  if resume_count > 0 then
    score := score + 15;
  end if;

  new.completeness_score := least(score, 100);
  return new;
end;
$$;

create or replace function public.touch_candidate_profile_after_child_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_profile_id uuid := coalesce(new.candidate_profile_id, old.candidate_profile_id);
begin
  if target_profile_id is not null then
    update public.candidate_profiles
    set updated_at = timezone('utc', now())
    where id = target_profile_id;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.ensure_candidate_resume_default()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_default then
    update public.candidate_resumes
    set is_default = false
    where candidate_profile_id = new.candidate_profile_id
      and id <> coalesce(new.id, extensions.gen_random_uuid())
      and is_default = true;

    return new;
  end if;

  if not exists (
    select 1
    from public.candidate_resumes candidate_resume
    where candidate_resume.candidate_profile_id = new.candidate_profile_id
      and candidate_resume.id <> coalesce(new.id, extensions.gen_random_uuid())
      and candidate_resume.is_default = true
  ) then
    new.is_default := true;
  end if;

  return new;
end;
$$;

create or replace function public.promote_latest_candidate_resume_after_delete()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  replacement_resume_id uuid;
begin
  if old.is_default then
    select candidate_resume.id into replacement_resume_id
    from public.candidate_resumes candidate_resume
    where candidate_resume.candidate_profile_id = old.candidate_profile_id
    order by candidate_resume.uploaded_at desc
    limit 1;

    if replacement_resume_id is not null then
      update public.candidate_resumes
      set is_default = true
      where id = replacement_resume_id;
    end if;
  end if;

  return old;
end;
$$;

grant execute on function public.is_candidate_profile_owner(uuid) to authenticated;

grant select, insert, update, delete on public.candidate_profiles to authenticated;
grant select, insert, update, delete on public.candidate_resumes to authenticated;
grant select, insert, update, delete on public.candidate_experiences to authenticated;
grant select, insert, update, delete on public.candidate_educations to authenticated;
grant select, insert, update, delete on public.candidate_skills to authenticated;
grant select, insert, update, delete on public.candidate_languages to authenticated;
grant select, insert, update, delete on public.candidate_links to authenticated;

alter table public.candidate_profiles enable row level security;
alter table public.candidate_resumes enable row level security;
alter table public.candidate_experiences enable row level security;
alter table public.candidate_educations enable row level security;
alter table public.candidate_skills enable row level security;
alter table public.candidate_languages enable row level security;
alter table public.candidate_links enable row level security;

create policy "candidate_profiles_select_own"
on public.candidate_profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "candidate_profiles_insert_own"
on public.candidate_profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy "candidate_profiles_update_own"
on public.candidate_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "candidate_profiles_delete_own"
on public.candidate_profiles
for delete
to authenticated
using (user_id = auth.uid());

create policy "candidate_resumes_select_own"
on public.candidate_resumes
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_resumes_insert_own"
on public.candidate_resumes
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_resumes_update_own"
on public.candidate_resumes
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_resumes_delete_own"
on public.candidate_resumes
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_experiences_select_own"
on public.candidate_experiences
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_experiences_insert_own"
on public.candidate_experiences
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_experiences_update_own"
on public.candidate_experiences
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_experiences_delete_own"
on public.candidate_experiences
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_educations_select_own"
on public.candidate_educations
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_educations_insert_own"
on public.candidate_educations
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_educations_update_own"
on public.candidate_educations
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_educations_delete_own"
on public.candidate_educations
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_skills_select_own"
on public.candidate_skills
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_skills_insert_own"
on public.candidate_skills
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_skills_update_own"
on public.candidate_skills
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_skills_delete_own"
on public.candidate_skills
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_languages_select_own"
on public.candidate_languages
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_languages_insert_own"
on public.candidate_languages
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_languages_update_own"
on public.candidate_languages
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_languages_delete_own"
on public.candidate_languages
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_links_select_own"
on public.candidate_links
for select
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_links_insert_own"
on public.candidate_links
for insert
to authenticated
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_links_update_own"
on public.candidate_links
for update
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id))
with check (public.is_candidate_profile_owner(candidate_profile_id));

create policy "candidate_links_delete_own"
on public.candidate_links
for delete
to authenticated
using (public.is_candidate_profile_owner(candidate_profile_id));

drop trigger if exists candidate_profiles_set_updated_at on public.candidate_profiles;
create trigger candidate_profiles_set_updated_at
before update on public.candidate_profiles
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_profiles_set_completeness on public.candidate_profiles;
create trigger candidate_profiles_set_completeness
before insert or update on public.candidate_profiles
for each row execute procedure public.set_candidate_profile_completeness();

drop trigger if exists candidate_resumes_set_updated_at on public.candidate_resumes;
create trigger candidate_resumes_set_updated_at
before update on public.candidate_resumes
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_resumes_default_guard on public.candidate_resumes;
create trigger candidate_resumes_default_guard
before insert or update on public.candidate_resumes
for each row execute procedure public.ensure_candidate_resume_default();

drop trigger if exists candidate_resumes_touch_profile_after_change on public.candidate_resumes;
create trigger candidate_resumes_touch_profile_after_change
after insert or update or delete on public.candidate_resumes
for each row execute procedure public.touch_candidate_profile_after_child_change();

drop trigger if exists candidate_resumes_promote_after_delete on public.candidate_resumes;
create trigger candidate_resumes_promote_after_delete
after delete on public.candidate_resumes
for each row execute procedure public.promote_latest_candidate_resume_after_delete();

drop trigger if exists candidate_experiences_set_updated_at on public.candidate_experiences;
create trigger candidate_experiences_set_updated_at
before update on public.candidate_experiences
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_experiences_touch_profile_after_change on public.candidate_experiences;
create trigger candidate_experiences_touch_profile_after_change
after insert or update or delete on public.candidate_experiences
for each row execute procedure public.touch_candidate_profile_after_child_change();

drop trigger if exists candidate_educations_set_updated_at on public.candidate_educations;
create trigger candidate_educations_set_updated_at
before update on public.candidate_educations
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_educations_touch_profile_after_change on public.candidate_educations;
create trigger candidate_educations_touch_profile_after_change
after insert or update or delete on public.candidate_educations
for each row execute procedure public.touch_candidate_profile_after_child_change();

drop trigger if exists candidate_skills_set_updated_at on public.candidate_skills;
create trigger candidate_skills_set_updated_at
before update on public.candidate_skills
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_skills_touch_profile_after_change on public.candidate_skills;
create trigger candidate_skills_touch_profile_after_change
after insert or update or delete on public.candidate_skills
for each row execute procedure public.touch_candidate_profile_after_child_change();

drop trigger if exists candidate_languages_set_updated_at on public.candidate_languages;
create trigger candidate_languages_set_updated_at
before update on public.candidate_languages
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_languages_touch_profile_after_change on public.candidate_languages;
create trigger candidate_languages_touch_profile_after_change
after insert or update or delete on public.candidate_languages
for each row execute procedure public.touch_candidate_profile_after_child_change();

drop trigger if exists candidate_links_set_updated_at on public.candidate_links;
create trigger candidate_links_set_updated_at
before update on public.candidate_links
for each row execute procedure public.set_row_updated_at();

drop trigger if exists candidate_links_touch_profile_after_change on public.candidate_links;
create trigger candidate_links_touch_profile_after_change
after insert or update or delete on public.candidate_links
for each row execute procedure public.touch_candidate_profile_after_child_change();

select private.attach_audit_trigger('public', 'candidate_profiles');
select private.attach_audit_trigger('public', 'candidate_resumes');
select private.attach_audit_trigger('public', 'candidate_experiences');
select private.attach_audit_trigger('public', 'candidate_educations');
select private.attach_audit_trigger('public', 'candidate_skills');
select private.attach_audit_trigger('public', 'candidate_languages');
select private.attach_audit_trigger('public', 'candidate_links');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-resumes',
  'candidate-resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "candidate_resumes_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "candidate_resumes_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'candidate-resumes'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "candidate_resumes_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "candidate_resumes_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
