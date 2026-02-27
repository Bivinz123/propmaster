'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Euro, FileText, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddCostForm } from '@/components/nka/AddCostForm'

interface PeriodDetail {
  id: string
  year: number
  startDate: string
  endDate: string
  status: 'DRAFT' | 'FINALIZED' | 'SENT' | 'ARCHIVED'
  property: {
    id: string
    address: string
    city: string
    units: number
    totalSquareMeters: number | null
  }
  costItems: Array<{
    id: string
    totalAmount: number
    allocableAmount: number | null
    description: string | null
    invoiceNumber: string | null
    category: {
      nameDE: string
      allocationType: string
      betrkvSection: string | null
    }
  }>
}

const statusConfig = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-500' },
  FINALIZED: { label: 'Finalisiert', color: 'bg-blue-500' },
  SENT: { label: 'Versendet', color: 'bg-green-500' },
  ARCHIVED: { label: 'Archiviert', color: 'bg-slate-500' }
}

const allocationLabels: Record<string, string> = {
  PER_UNIT: 'Nach Einheiten',
  PER_SQM: 'Nach Wohnfläche',
  PER_PERSON: 'Nach Personenzahl',
  CONSUMPTION: 'Nach Verbrauch',
  MEA: 'Nach Miteigentumsanteil',
  HEATING_MIXED: 'Heizung (70% Verbrauch + 30% Fläche)'
}

export default function PeriodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [period, setPeriod] = useState<PeriodDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchPeriod = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/nka/periods/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPeriod(data)
      }
    } catch (error) {
      console.error('Error fetching period:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriod()
  }, [params.id])

  const handleCostAdded = () => {
    setIsDialogOpen(false)
    fetchPeriod()
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }

  if (!period) {
    return (
      <div className="p-8">
        <p>Zeitraum nicht gefunden</p>
      </div>
    )
  }

  const totalCosts = period.costItems.reduce((sum, item) => sum + Number(item.totalAmount), 0)
  const allocableCosts = period.costItems.reduce(
    (sum, item) => sum + Number(item.allocableAmount || item.totalAmount),
    0
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Abrechnungsjahr {period.year}</h1>
            <p className="text-slate-600">
              {period.property.address}, {period.property.city}
            </p>
          </div>
          <Badge className={`${statusConfig[period.status].color} text-white`}>
            {statusConfig[period.status].label}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Zeitraum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-slate-400" />
              <div className="text-sm">
                {new Date(period.startDate).toLocaleDateString('de-DE')} -{' '}
                {new Date(period.endDate).toLocaleDateString('de-DE')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Gesamtkosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="mr-2 h-4 w-4 text-slate-400" />
              <span className="text-2xl font-bold">{totalCosts.toFixed(2)}€</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Umlagefähig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-slate-400" />
              <span className="text-2xl font-bold">{allocableCosts.toFixed(2)}€</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Kostenarten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-slate-400" />
              <span className="text-2xl font-bold">{period.costItems.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Kostenarten</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Kosten hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Kosten hinzufügen</DialogTitle>
                </DialogHeader>
                <AddCostForm periodId={period.id} onSuccess={handleCostAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {period.costItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 mb-4">Noch keine Kosten erfasst</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Kosten hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Kosten hinzufügen</DialogTitle>
                  </DialogHeader>
                  <AddCostForm periodId={period.id} onSuccess={handleCostAdded} />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {period.costItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.category.nameDE}</h4>
                        <Badge variant="outline" className="text-xs">
                          {allocationLabels[item.category.allocationType]}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-600 mb-1">{item.description}</p>
                      )}
                      {item.invoiceNumber && (
                        <p className="text-xs text-slate-500">
                          Rechnungsnr.: {item.invoiceNumber}
                        </p>
                      )}
                      {item.category.betrkvSection && (
                        <p className="text-xs text-slate-500">{item.category.betrkvSection}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{Number(item.totalAmount).toFixed(2)}€</p>
                      {item.allocableAmount && item.allocableAmount !== item.totalAmount && (
                        <p className="text-sm text-slate-600">
                          Umlagefähig: {Number(item.allocableAmount).toFixed(2)}€
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {period.costItems.length > 0 && period.status === 'DRAFT' && (
        <div className="mt-8 flex gap-4">
          <Link href={`/dashboard/nka/periods/${period.id}/calculate`}>
            <Button size="lg">
              <FileText className="mr-2 h-4 w-4" />
              Abrechnungen erstellen
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
