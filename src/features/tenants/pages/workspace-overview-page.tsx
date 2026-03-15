import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toErrorMessage } from '@/features/auth/lib/auth-api'
import {
  createWorkspaceAssetUrl,
  fetchWorkspaceBundle,
  replaceMembershipPrimaryRole,
  updateWorkspaceProfile,
  uploadWorkspaceLogo,
  type WorkspaceBundle
} from '@/features/tenants/lib/workspace-api'
import { reportErrorWithToast } from '@/lib/errors/error-reporting'
import { UploadConstraintError } from '@/lib/uploads/media'

const WORKSPACE_QUERY_KEY = ['workspace', 'primary'] as const

function createEditorKey(bundle: WorkspaceBundle) {
  return [
    bundle.tenant.updated_at,
    bundle.companyProfile?.updated_at ?? 'no-company-profile',
    bundle.memberships.length,
    bundle.roles.length
  ].join(':')
}

function WorkspaceEditor({ bundle }: { bundle: WorkspaceBundle }) {
  const session = useAppSession()
  const queryClient = useQueryClient()
  const profile = bundle.companyProfile
  const [displayName, setDisplayName] = useState(profile?.display_name ?? bundle.tenant.name)
  const [legalName, setLegalName] = useState(profile?.legal_name ?? bundle.tenant.name)
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url ?? '')
  const [companyEmail, setCompanyEmail] = useState(profile?.company_email ?? '')
  const [companyPhone, setCompanyPhone] = useState(profile?.company_phone ?? '')
  const [countryCode, setCountryCode] = useState(profile?.country_code ?? session.profile?.country_code ?? 'DO')
  const [industry, setIndustry] = useState(profile?.industry ?? '')
  const [sizeRange, setSizeRange] = useState(profile?.size_range ?? '')
  const [description, setDescription] = useState(profile?.description ?? '')
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true)

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      return updateWorkspaceProfile({
        tenantId: bundle.tenant.id,
        displayName,
        legalName,
        websiteUrl,
        companyEmail,
        companyPhone,
        countryCode,
        industry,
        sizeRange,
        description,
        isPublic
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY })
      toast.success('Workspace actualizado', {
        description: 'La presencia de empresa ya quedo alineada para recruiters y jobs.'
      })
    },
    onError: async (error) => {
      await reportErrorWithToast({
        title: 'No pudimos guardar el workspace',
        source: 'workspace.save-profile',
        route: '/workspace',
        userId: session.authUser?.id ?? null,
        error
      })
    }
  })

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session.authUser) {
        throw new Error('Necesitas una sesion activa para subir el logo.')
      }

      const logoPath = await uploadWorkspaceLogo({
        tenantId: bundle.tenant.id,
        userId: session.authUser.id,
        file
      })

      await updateWorkspaceProfile({
        tenantId: bundle.tenant.id,
        displayName,
        legalName,
        websiteUrl,
        companyEmail,
        companyPhone,
        countryCode,
        industry,
        sizeRange,
        description,
        isPublic,
        logoPath
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY })
      toast.success('Logo actualizado', {
        description: 'La identidad visual del workspace ya quedo guardada en Supabase Storage.'
      })
    },
    onError: async (error) => {
      const userMessage = error instanceof UploadConstraintError ? error.userMessage : toErrorMessage(error)
      await reportErrorWithToast({
        title: 'No pudimos subir el logo',
        source: 'workspace.upload-logo',
        route: '/workspace',
        userId: session.authUser?.id ?? null,
        error,
        userMessage
      })
    }
  })

  const replaceRoleMutation = useMutation({
    mutationFn: async (input: { membershipId: string; roleId: string }) => {
      if (!session.authUser) {
        throw new Error('Necesitas una sesion activa para administrar roles.')
      }

      return replaceMembershipPrimaryRole({
        membershipId: input.membershipId,
        tenantId: bundle.tenant.id,
        nextRoleId: input.roleId,
        actorUserId: session.authUser.id
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY })
      await session.refresh()
      toast.success('Rol actualizado', {
        description: 'La membresia ya refleja el rol principal seleccionado.'
      })
    },
    onError: async (error) => {
      await reportErrorWithToast({
        title: 'No pudimos actualizar el rol del miembro',
        source: 'workspace.replace-role',
        route: '/workspace',
        userId: session.authUser?.id ?? null,
        error
      })
    }
  })

  async function openLogoPreview() {
    if (!profile?.logo_path) {
      return
    }

    try {
      const url = await createWorkspaceAssetUrl(profile.logo_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      await reportErrorWithToast({
        title: 'No pudimos abrir el logo',
        source: 'workspace.preview-logo',
        route: '/workspace',
        userId: session.authUser?.id ?? null,
        error
      })
    }
  }

  const assignableRoles = bundle.roles.filter((role) => role.tenant_id === null || role.tenant_id === bundle.tenant.id)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary-100 bg-[radial-gradient(circle_at_top_left,#dbeafe_0,transparent_30%),linear-gradient(135deg,#eff6ff,white_38%,#f0fdf4_76%)] dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.24)_0,transparent_28%),linear-gradient(135deg,rgba(9,18,33,0.96),rgba(9,9,11,0.94)_42%,rgba(8,24,20,0.95))]">
        <CardHeader className="space-y-3">
          <Badge variant="soft">Employer foundations</Badge>
          <CardTitle>Configura la identidad operativa de tu workspace</CardTitle>
          <CardDescription>
            Este modulo deja usable la presencia de empresa, el branding base y el control de miembros antes de abrir
            jobs, sourcing y pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/75">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Tenant slug</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{bundle.tenant.slug}</p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/75">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Estado</p>
              <p className="mt-2 text-lg font-semibold capitalize text-zinc-950 dark:text-zinc-50">
                {bundle.tenant.status}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/75">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Miembros activos</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{bundle.memberships.length}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 dark:border-zinc-800 dark:bg-zinc-950/80">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Launch readiness</p>
            <div className="mt-3 grid gap-2">
              <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                Company profile editable con RLS real.
              </div>
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                Roles de membresia gestionados desde la app.
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Logo y multimedia viven en Supabase Storage con limite de 5 MB.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
            <CardDescription>
              Ajusta la identidad publica y operativa que usaremos en jobs, solicitudes recruiter y discovery.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Nombre visible</span>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Nombre legal</span>
                <Input value={legalName} onChange={(event) => setLegalName(event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Website</span>
                <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Email company</span>
                <Input value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} placeholder="careers@empresa.com" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm">
                <span>Telefono</span>
                <Input value={companyPhone} onChange={(event) => setCompanyPhone(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Pais</span>
                <Input value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase())} maxLength={2} />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Industria</span>
                <Input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="Energy, SaaS, Health..." />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[0.55fr_0.45fr]">
              <label className="grid gap-2 text-sm">
                <span>Rango de tamano</span>
                <Select value={sizeRange} onChange={(event) => setSizeRange(event.target.value)}>
                  <option value="">Selecciona un rango</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </Select>
              </label>
              <label className="flex items-center gap-3 rounded-[24px] border border-zinc-200 px-4 py-4 text-sm dark:border-zinc-800">
                <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                <span>Permitir que el perfil de empresa sea visible en discovery publico.</span>
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span>Descripcion</span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                placeholder="Explica a que se dedica la empresa, su cultura y el tipo de talento que atrae."
              />
            </label>

            <div className="grid gap-3 rounded-[24px] border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Logo del workspace</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Acepta PNG, JPG, WEBP o SVG. Se comprime cuando aplica y no puede superar 5 MB.
                  </p>
                </div>
                {profile?.logo_path ? (
                  <Button variant="outline" onClick={() => void openLogoPreview()}>
                    Ver logo actual
                  </Button>
                ) : null}
              </div>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void uploadLogoMutation.mutateAsync(file)
                  }
                  event.currentTarget.value = ''
                }}
              />
            </div>

            <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
              {saveProfileMutation.isPending ? 'Guardando workspace...' : 'Guardar workspace'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipo y roles</CardTitle>
            <CardDescription>
              La gestion de miembros usa membresias multi-tenant y permisos RBAC reales en la base de datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bundle.memberships.map((membership) => {
              const activeRoleId = membership.membership_roles?.find((item) => item.role)?.role?.id ?? ''

              return (
                <div key={membership.id} className="rounded-[24px] border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {membership.user?.display_name || membership.user?.full_name || membership.user?.email || 'Miembro'}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{membership.user?.email}</p>
                    </div>
                    <Badge variant="outline">{membership.status}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label className="grid gap-2 text-sm">
                      <span>Rol principal</span>
                      <Select
                        value={activeRoleId}
                        onChange={(event) => {
                          if (event.target.value) {
                            void replaceRoleMutation.mutateAsync({
                              membershipId: membership.id,
                              roleId: event.target.value
                            })
                          }
                        }}
                      >
                        <option value="">Selecciona un rol</option>
                        {assignableRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {membership.membership_roles?.flatMap((item) => (item.role?.name ? [item.role.name] : [])).join(', ') ||
                        'Sin rol activo'}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export function WorkspaceOverviewPage() {
  const session = useAppSession()
  const tenantId = session.primaryMembership?.tenantId ?? null
  const workspaceQuery = useQuery({
    queryKey: WORKSPACE_QUERY_KEY,
    enabled: Boolean(tenantId),
    queryFn: async () => fetchWorkspaceBundle(tenantId!)
  })

  if (!tenantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No tienes un workspace employer activo</CardTitle>
          <CardDescription>
            Esta seccion se habilita cuando una solicitud recruiter ya fue aprobada y creo el tenant de empresa.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (workspaceQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando workspace</CardTitle>
          <CardDescription>Estamos recuperando la configuracion, miembros y branding del tenant actual.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (workspaceQuery.error || !workspaceQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No pudimos cargar el workspace</CardTitle>
          <CardDescription>{toErrorMessage(workspaceQuery.error)}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <WorkspaceEditor key={createEditorKey(workspaceQuery.data)} bundle={workspaceQuery.data} />
}
