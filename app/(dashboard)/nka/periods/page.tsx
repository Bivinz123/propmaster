'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Calendar, CheckCircle, Send, Archive } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreatePeriodForm } from '@/components/nka/CreatePeriodForm'

interface AccountingPeriod {
  id: string
  year: number
  startDate: string
  endDate: string
  status: 'DRAFT' | 'FINALIZED' | 'SENT' | 'ARCHIVED'
  property: {
    id: string
    address: string
    city: string
  }
  _count: {
    costItems: number
  }
}

const statusConfig = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-500', icon: FileText },
  FINALIZED: { label: 'Finalisiert', color: 'bg-blue-500', icon: CheckCircle },
  SENT: { label: 'Versendet', color: 'bg-green-500', icon: Send },
  ARCHIVED: { label: 'Archiviert', color: 'bg-slate-500', icon: Archive }
}

export default function AccountingPeriodsPage() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchPeriods = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/nka/periods')
      if (response.ok) {
        const data = await response.json()
        setPeriods(data)
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const handlePeriodCreated = () => {
    setIsDialogOpen(false)
    fetchPeriods()
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Abrechnungszeiträume</h1>
          <p className="text-slate-600 mt-2">
            Verwalten Sie Nebenkostenabrechnungen nach § 556 BGB
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Zeitraum
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Abrechnungszeitraum erstellen</DialogTitle>
            </DialogHeader>
            <CreatePeriodForm onSuccess={handlePeriodCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Abrechnungszeiträume</h3>
            <p className="text-slate-600 mb-4">
              Erstellen Sie Ihren ersten Abrechnungszeitraum für Nebenkostenabrechnungen.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Zeitraum erstellen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Abrechnungszeitraum erstellen</DialogTitle>
                </DialogHeader>
                <CreatePeriodForm onSuccess={handlePeriodCreated} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {periods.map((period) => {
            const StatusIcon = statusConfig[period.status].icon
            return (
              <Card key={period.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        Abrechnungsjahr {period.year}
                      </CardTitle>
                      <p className="text-slate-600">
                        {period.property.address}, {period.property.city}
                      </p>
                    </div>
                    <Badge className={`${statusConfig[period.status].color} text-white`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[period.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-600">Zeitraum</p>
                      <p className="font-semibold">
                        {new Date(period.startDate).toLocaleDateString('de-DE')} -{' '}
                        {new Date(period.endDate).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Kostenarten</p>
                      <p className="font-semibold">{period._count.costItems} erfasst</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="font-semibold">{statusConfig[period.status].label}</p>
                    </div>
                    <div className="flex items-end">
                      <Link href={`/dashboard/nka/periods/${period.id}`}>
                        <Button variant="outline" className="w-full">
                          Details öffnen
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
