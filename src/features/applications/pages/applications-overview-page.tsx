import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useAppSession } from '@/app/providers/app-session-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toErrorMessage } from '@/features/auth/lib/auth-api'
import { exportApplicationsCsv, listMyApplications, listTenantApplications } from '@/features/applications/lib/applications-api'

export function ApplicationsOverviewPage() {
  const session = useAppSession()
  const canReviewApplications = session.permissions.includes('application:read')
  const canExportApplications = session.permissions.includes('application:export')

  const myApplicationsQuery = useQuery({
    queryKey: ['applications', 'mine', session.authUser?.id ?? null],
    enabled: session.isAuthenticated,
    queryFn: async () => listMyApplications(session.authUser!.id)
  })

  const tenantApplicationsQuery = useQuery({
    queryKey: ['applications', 'tenant', session.primaryMembership?.tenantId ?? null],
    enabled: canReviewApplications && Boolean(session.primaryMembership?.tenantId),
    queryFn: async () => listTenantApplications(session.primaryMembership!.tenantId)
  })

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary-100 bg-[radial-gradient(circle_at_top_left,#ede9fe_0,transparent_30%),linear-gradient(135deg,#faf5ff,white_42%,#eff6ff_80%)] dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.18)_0,transparent_28%),linear-gradient(135deg,rgba(22,14,35,0.96),rgba(9,9,11,0.94)_44%,rgba(10,18,36,0.95))]">
        <CardHeader className="space-y-3">
          <Badge variant="soft">Applications</Badge>
          <CardTitle>Seguimiento de postulaciones y applicants</CardTitle>
          <CardDescription>
            Esta fase conecta el discovery con un flujo real de apply y deja una vista inicial para candidatos y equipos recruiter.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Mi historial</CardTitle>
            <CardDescription>Como candidato puedes revisar a que vacantes ya aplicaste y en que estado publico van.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApplicationsQuery.isLoading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando historial...</p>
            ) : myApplicationsQuery.error ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{toErrorMessage(myApplicationsQuery.error)}</p>
            ) : myApplicationsQuery.data?.length ? (
              myApplicationsQuery.data.map((application) => (
                <div key={application.id} className="rounded-[24px] border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {application.job_posting?.title || 'Vacante'}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {application.job_posting?.company_profile?.display_name || 'Company'}
                      </p>
                    </div>
                    <Badge variant="outline">{application.status_public}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/jobs/${application.job_posting?.slug}`}>
                      <Button variant="outline">Ver vacante</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                Todavia no has enviado postulaciones.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicant list employer</CardTitle>
            <CardDescription>Los miembros con `application:read` ya pueden revisar candidatos aplicados por vacante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canExportApplications && tenantApplicationsQuery.data?.length ? (
              <Button variant="outline" onClick={() => exportApplicationsCsv(tenantApplicationsQuery.data)}>
                Exportar applicants CSV
              </Button>
            ) : null}
            {!canReviewApplications ? (
              <div className="rounded-[24px] border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                Esta bandeja se habilita cuando tu membership employer tiene permiso para revisar applications.
              </div>
            ) : tenantApplicationsQuery.isLoading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando applicants...</p>
            ) : tenantApplicationsQuery.error ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{toErrorMessage(tenantApplicationsQuery.error)}</p>
            ) : tenantApplicationsQuery.data?.length ? (
              tenantApplicationsQuery.data.map((application) => (
                <div key={application.id} className="rounded-[24px] border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {application.candidate_display_name_snapshot}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {application.job_posting?.title || 'Vacante'}
                      </p>
                    </div>
                    <Badge variant="outline">{application.status_public}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {application.candidate_profile?.desired_role || application.candidate_headline_snapshot || 'Perfil candidato'}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                Todavia no hay applicants para este tenant.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
