import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { permissionCatalog } from '@/shared/constants/permissions'

export function RbacOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roles"
        title="Revisa permisos y estructura de acceso del workspace"
        description="Esta vista resume las capacidades disponibles para seguir organizando roles con una lectura más clara."
      >
        <StatCard label="Permisos" value={permissionCatalog.length} helper="Capacidades documentadas y reutilizables dentro del producto." />
        <StatCard label="Modelo" value="RBAC" helper="El acceso del workspace se mantiene gobernado por permisos verificables." />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Catalogo de permisos</CardTitle>
          <CardDescription>
            La navegación y los módulos del workspace se filtran con esta base para mantener acceso consistente y predecible.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {permissionCatalog.map((permission) => (
            <div
              key={permission}
              className="rounded-2xl border border-(--app-border) bg-(--app-surface-muted) px-4 py-3 text-sm font-medium text-(--app-text)"
            >
              {permission}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
