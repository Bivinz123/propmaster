'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Euro } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddAdvancePaymentForm } from '@/components/nka/AddAdvancePaymentForm'

interface AdvancePayment {
  id: string
  monthlyAmount: number
  monthsPaid: number
  totalPaid: number
  startMonth: string
  endMonth: string
  tenant: {
    id: string
    firstName: string
    lastName: string
  }
  period: {
    id: string
    year: number
    property: {
      address: string
      city: string
    }
  }
}

export default function AdvancePaymentsPage() {
  const [advances, setAdvances] = useState<AdvancePayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchAdvances = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/nka/advances')
      if (response.ok) {
        const data = await response.json()
        setAdvances(data)
      }
    } catch (error) {
      console.error('Error fetching advances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvances()
  }, [])

  const handleAdvanceAdded = () => {
    setIsDialogOpen(false)
    fetchAdvances()
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vorauszahlungen</h1>
          <p className="text-slate-600 mt-2">
            Erfassung von Nebenkosten-Vorauszahlungen
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Vorauszahlung erfassen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vorauszahlung erfassen</DialogTitle>
            </DialogHeader>
            <AddAdvancePaymentForm onSuccess={handleAdvanceAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {advances.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Euro className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Vorauszahlungen erfasst</h3>
            <p className="text-slate-600 mb-4">
              Erfassen Sie Nebenkosten-Vorauszahlungen für die Abrechnung.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Vorauszahlung erfassen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Vorauszahlung erfassen</DialogTitle>
                </DialogHeader>
                <AddAdvancePaymentForm onSuccess={handleAdvanceAdded} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {advances.map((advance) => (
            <Card key={advance.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {advance.tenant.firstName} {advance.tenant.lastName}
                    </CardTitle>
                    <p className="text-slate-600 text-sm mt-1">
                      {advance.period.property.address}, {advance.period.property.city}
                    </p>
                    <p className="text-slate-500 text-sm">
                      Abrechnungsjahr {advance.period.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      €{advance.totalPaid.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">Gesamt gezahlt</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Monatlich</p>
                    <p className="font-semibold">€{advance.monthlyAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Monate</p>
                    <p className="font-semibold">{advance.monthsPaid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Zeitraum</p>
                    <p className="font-semibold text-sm">
                      {new Date(advance.startMonth).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })} -{' '}
                      {new Date(advance.endMonth).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
