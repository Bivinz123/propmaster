"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateNebenkostenabrechnungPDF } from '@/lib/pdfUtils'
import { FileText, Download } from 'lucide-react'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  property: {
    address: string
  }
}

export function NebenAbrechnungGenerator() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      const data = await response.json()
      setTenants(data.tenants)
    } catch (error) {
      console.error('Failed to load tenants:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedTenant || !selectedYear) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/nebenkostenabrechnung?tenantId=${selectedTenant}&year=${selectedYear}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate Nebenkostenabrechnung')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!report) return

    try {
      const pdf = generateNebenkostenabrechnungPDF(report)
      pdf.save(`Nebenkostenabrechnung-${report.tenant.name.replace(/\s+/g, '-')}-${report.period.year}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const categoryLabels: Record<string, string> = {
    HEATING: 'Heizkosten (Heating)',
    WATER: 'Wasser/Abwasser (Water/Sewage)',
    TRASH: 'Müllabfuhr (Trash Collection)',
    INSURANCE: 'Gebäudeversicherung (Building Insurance)',
    TAX: 'Grundsteuer (Property Tax)',
    MAINTENANCE: 'Hausmeister/Reinigung (Maintenance)',
    REPAIR: 'Reparaturen (Repairs)',
    MORTGAGE: 'Hypothek (Mortgage)',
    OTHER: 'Sonstige (Other)',
  }

  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Nebenkostenabrechnung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select
                id="tenant"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
              >
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName} - {tenant.property.address}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={!selectedTenant || !selectedYear || loading}
          >
            <FileText className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Nebenkostenabrechnung {report.period.year}
            </CardTitle>
            <Button onClick={downloadPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tenant & Property Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Mieter (Tenant)</h3>
                <p>{report.tenant.name}</p>
                <p className="text-sm text-muted-foreground">{report.tenant.email}</p>
                <p className="text-sm text-muted-foreground">
                  Lease: {formatDate(report.tenant.leaseStart)} - 
                  {report.tenant.leaseEnd ? formatDate(report.tenant.leaseEnd) : 'Ongoing'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Objekt (Property)</h3>
                <p>{report.property.address}</p>
                <p className="text-sm text-muted-foreground">{report.property.city}</p>
                <p className="text-sm text-muted-foreground">
                  Units: {report.property.totalUnits} ({report.property.occupiedUnits} occupied)
                </p>
              </div>
            </div>

            {/* Period Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Abrechnungszeitraum (Accounting Period)</h3>
              <p>Year: {report.period.year}</p>
              <p>Months Active: {report.period.monthsActive} / 12</p>
              <p>Adjustment Factor: {(report.period.monthlyFactor * 100).toFixed(1)}%</p>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="font-semibold mb-4">Kostenaufstellung (Cost Breakdown)</h3>
              <div className="space-y-2">
                {Object.entries(report.costs.byCategory).map(([category, costs]: [string, any]) => (
                  <div 
                    key={category}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {categoryLabels[category] || category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Allocation: {costs.basis}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(costs.tenantShare)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of {formatCurrency(costs.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Total Property Expenses:</span>
                <span className="font-semibold">{formatCurrency(report.costs.totalPropertyExpenses)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Your Share (before adjustment):</span>
                <span className="font-semibold">{formatCurrency(report.costs.totalTenantCosts)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Your Share (adjusted):</span>
                <span className="text-red-600">{formatCurrency(report.costs.adjustedTenantCosts)}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Zusammenfassung (Summary)</h3>
              <div className="flex justify-between">
                <span>Rent Paid:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(report.summary.rentPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nebenkosten Costs:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(report.summary.nebenkostenCosts)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Balance:</span>
                <span className={report.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(report.summary.balance)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {report.summary.balance >= 0 
                  ? '✓ Tenant has paid sufficient rent to cover Nebenkosten'
                  : '⚠ Additional payment required from tenant'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
