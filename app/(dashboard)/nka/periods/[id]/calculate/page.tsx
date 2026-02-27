'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, CheckCircle } from 'lucide-react'
import { generateNebenkostenabrechnungPDF } from '@/lib/pdfUtilsNKA'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  squareMeters: number | null
  numberOfPersons: number
}

interface PeriodDetail {
  id: string
  year: number
  startDate: string
  endDate: string
  property: {
    id: string
    address: string
    city: string
    units: number
    totalSquareMeters: number | null
  }
}

interface CalculationResult {
  period: any
  tenant: any
  property: any
  calculation: {
    tenant: { activeMonths: number; factor: number }
    property: { totalSquareMeters: number; totalUnits: number; totalPersons: number }
    costs: {
      byCategory: Record<string, any>
      totalPropertyCosts: number
      totalTenantCosts: number
    }
    advancePayments: {
      monthlyAmount: number
      months: number
      total: number
    }
    balance: {
      costs: number
      advances: number
      difference: number
      type: 'NACHZAHLUNG' | 'GUTHABEN'
    }
  }
}

export default function CalculateNKAPage() {
  const params = useParams()
  const router = useRouter()
  const [period, setPeriod] = useState<PeriodDetail | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPeriodAndTenants()
  }, [params.id])

  const fetchPeriodAndTenants = async () => {
    setIsLoading(true)
    try {
      // Fetch period
      const periodRes = await fetch(`/api/nka/periods/${params.id}`)
      if (periodRes.ok) {
        const periodData = await periodRes.json()
        setPeriod(periodData)

        // Fetch tenants for this property
        const tenantsRes = await fetch(`/api/tenants?propertyId=${periodData.property.id}`)
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json()
          setTenants(tenantsData.tenants.filter((t: Tenant) => t.squareMeters))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculate = async (tenantId: string) => {
    setIsCalculating(true)
    setSelectedTenant(tenantId)
    try {
      const response = await fetch(`/api/nka-pro/generate?tenantId=${tenantId}&periodId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCalculation(data)
      } else {
        const error = await response.json()
        alert(`Fehler: ${error.error || 'Berechnung fehlgeschlagen'}`)
        setCalculation(null)
      }
    } catch (error) {
      console.error('Error calculating:', error)
      alert('Fehler bei der Berechnung')
      setCalculation(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!calculation) return
    generateNebenkostenabrechnungPDF(calculation, `${calculation.tenant.name}-${calculation.period.year}`)
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <h1 className="text-3xl font-bold mb-2">Abrechnungen erstellen</h1>
        <p className="text-slate-600">
          {period.property.address}, {period.property.city} - Jahr {period.year}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenants List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Mieter ({tenants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <p className="text-sm text-slate-600">
                Keine Mieter mit vollständigen Daten gefunden. Bitte fügen Sie Wohnfläche hinzu.
              </p>
            ) : (
              <div className="space-y-2">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleCalculate(tenant.id)}
                    disabled={isCalculating}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTenant === tenant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {tenant.firstName} {tenant.lastName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {tenant.squareMeters}m² • {tenant.numberOfPersons} Pers.
                        </p>
                      </div>
                      {selectedTenant === tenant.id && calculation && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculation Result */}
        <div className="lg:col-span-2">
          {!calculation ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600">
                  Wählen Sie einen Mieter aus, um die Abrechnung zu berechnen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {calculation.tenant.name}
                      </CardTitle>
                      <p className="text-slate-600">{calculation.tenant.email}</p>
                    </div>
                    <Button onClick={handleDownloadPDF}>
                      <Download className="mr-2 h-4 w-4" />
                      PDF herunterladen
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Gesamtkosten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      €{calculation.calculation.costs.totalTenantCosts.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Vorauszahlungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      €{calculation.calculation.advancePayments.total.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className={
                  calculation.calculation.balance.type === 'GUTHABEN'
                    ? 'border-green-500'
                    : 'border-red-500'
                }>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {calculation.calculation.balance.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${
                      calculation.calculation.balance.type === 'GUTHABEN'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      €{calculation.calculation.balance.difference.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Kostenaufschlüsselung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(calculation.calculation.costs.byCategory).map(([category, data]: [string, any]) => (
                      <div key={category} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">{category}</span>
                          <span className="font-bold">€{data.tenantShare.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {data.allocationType} • {data.calculation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Aktive Monate</p>
                      <p className="font-semibold">{calculation.calculation.tenant.activeMonths} Monate</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Anpassungsfaktor</p>
                      <p className="font-semibold">{calculation.calculation.tenant.factor.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Wohnfläche Mieter</p>
                      <p className="font-semibold">{calculation.tenant.squareMeters}m²</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Gesamtwohnfläche</p>
                      <p className="font-semibold">{calculation.property.totalSquareMeters}m²</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
