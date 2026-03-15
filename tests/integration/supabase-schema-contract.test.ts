import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = resolve(import.meta.dirname, '../..')
const migrationPath = resolve(repoRoot, 'supabase/migrations/20260314070000_initial_identity_access.sql')
const hardeningMigrationPath = resolve(repoRoot, 'supabase/migrations/20260314073000_identity_access_hardening.sql')
const notificationsMigrationPath = resolve(
  repoRoot,
  'supabase/migrations/20260314113000_notifications_and_audit_hardening.sql'
)
const pushWorkflowMigrationPath = resolve(
  repoRoot,
  'supabase/migrations/20260314130000_push_delivery_workflow.sql'
)
const storageAlignmentMigrationPath = resolve(
  repoRoot,
  'supabase/migrations/20260315023000_align_storage_mime_support_and_limits.sql'
)
const candidateFoundationsMigrationPath = resolve(
  repoRoot,
  'supabase/migrations/20260315031500_candidate_profile_foundations.sql'
)
const employerTalentMigrationPath = resolve(
  repoRoot,
  'supabase/migrations/20260315043000_employer_workspace_and_talent_search.sql'
)

describe('supabase schema contract', () => {
  it('keeps the identity, notification, and push workflow migrations in place', () => {
    expect(existsSync(migrationPath)).toBe(true)
    expect(existsSync(hardeningMigrationPath)).toBe(true)
    expect(existsSync(notificationsMigrationPath)).toBe(true)
    expect(existsSync(pushWorkflowMigrationPath)).toBe(true)
    expect(existsSync(storageAlignmentMigrationPath)).toBe(true)
    expect(existsSync(candidateFoundationsMigrationPath)).toBe(true)
    expect(existsSync(employerTalentMigrationPath)).toBe(true)
  })

  it('defines the core identity, approval, and storage foundations', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('create table public.users')
    expect(migration).toContain('create table public.recruiter_requests')
    expect(migration).toContain('create table public.tenants')
    expect(migration).toContain("create or replace function public.bootstrap_first_platform_owner()")
    expect(migration).toContain("create or replace function public.review_recruiter_request(")
    expect(migration).toContain("insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)")
    expect(migration).toContain("'verification-documents'")
  })

  it('keeps the hardening migration that closes initial advisor warnings', () => {
    const migration = readFileSync(hardeningMigrationPath, 'utf8')

    expect(migration).toContain('create or replace function public.set_row_updated_at()')
    expect(migration).toContain('drop policy if exists "users_select_self_or_platform_admin"')
    expect(migration).toContain('create index if not exists recruiter_requests_reviewed_by_user_id_idx')
  })

  it('keeps auditable notification storage and delivery primitives', () => {
    const migration = readFileSync(notificationsMigrationPath, 'utf8')

    expect(migration).toContain('create table if not exists public.notification_preferences')
    expect(migration).toContain('create table if not exists public.notifications')
    expect(migration).toContain('create table if not exists public.push_subscriptions')
    expect(migration).toContain('create table if not exists public.notification_deliveries')
    expect(migration).toContain('create table if not exists public.notification_delivery_logs')
    expect(migration).toContain("create or replace function public.register_push_subscription(")
  })

  it('keeps the push workflow secured behind rls and auditable rpc helpers', () => {
    const migration = readFileSync(pushWorkflowMigrationPath, 'utf8')

    expect(migration).toContain('alter table public.notification_preferences enable row level security;')
    expect(migration).toContain("create or replace function public.upsert_notification_preferences(")
    expect(migration).toContain("create or replace function public.queue_push_notification(")
    expect(migration).toContain("create or replace function public.update_push_delivery_status(")
    expect(migration).toContain("create or replace function public.mark_notification_clicked(")
  })

  it('keeps storage bucket limits and mime support aligned with upload rules', () => {
    const migration = readFileSync(storageAlignmentMigrationPath, 'utf8')

    expect(migration).toContain("where id = 'user-media'")
    expect(migration).toContain("where id = 'company-assets'")
    expect(migration).toContain("where id = 'verification-documents'")
    expect(migration).toContain("'image/svg+xml'")
    expect(migration).toContain("'application/pdf'")
    expect(migration).toContain('file_size_limit = 5242880')
  })

  it('keeps the candidate profile foundations migration in place', () => {
    const migration = readFileSync(candidateFoundationsMigrationPath, 'utf8')

    expect(migration).toContain('create table if not exists public.candidate_profiles')
    expect(migration).toContain('create table if not exists public.candidate_resumes')
    expect(migration).toContain("insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)")
    expect(migration).toContain("'candidate-resumes'")
    expect(migration).toContain('create or replace function public.set_candidate_profile_completeness()')
    expect(migration).toContain("select private.attach_audit_trigger('public', 'candidate_profiles')")
  })

  it('keeps employer foundations and talent search opt-in aligned with the schema contract', () => {
    const migration = readFileSync(employerTalentMigrationPath, 'utf8')

    expect(migration).toContain('add column if not exists is_visible_to_recruiters boolean not null default false')
    expect(migration).toContain("'candidate_directory:read'")
    expect(migration).toContain("'candidate_profile:read_full'")
    expect(migration).toContain("create or replace function public.search_candidate_profiles(")
    expect(migration).toContain("create or replace function public.get_candidate_profile_for_tenant(")
    expect(migration).toContain("'candidate_profile_viewed'")
  })
})
