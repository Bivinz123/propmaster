import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Euro, Plus } from 'lucide-react'

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and generate reports
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Expense
        </Button>
      </div>

      <Card className="p-12 text-center">
        <Euro className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Financial tracking and Nebenkostenabrechnung module under construction
        </p>
      </Card>
    </div>
  )
}
