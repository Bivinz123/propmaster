import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Details</h1>
          <p className="text-muted-foreground">Tenant ID: {id}</p>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">
          Tenant detail page under construction...
        </p>
      </Card>
    </div>
  )
}
