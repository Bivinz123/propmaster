'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  property: {
    address: string
    city: string
  }
}

interface AccountingPeriod {
  id: string
  year: number
  property: {
    id: string
    address: string
    city: string
  }
}

interface AddAdvancePaymentFormProps {
  onSuccess: () => void
}

export function AddAdvancePaymentForm({ onSuccess }: AddAdvancePaymentFormProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [periods, setPeriods] = useState<AccountingPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    tenantId: '',
    periodId: '',
    monthlyAmount: '',
    monthsPaid: '12',
    startMonth: '',
    endMonth: ''
  })

  useEffect(() => {
    fetchTenants()
    fetchPeriods()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    }
  }

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/nka/periods')
      if (response.ok) {
        const data = await response.json()
        setPeriods(data)
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
  }

  // Auto-calculate total and set dates based on period
  useEffect(() => {
    const selectedPeriod = periods.find((p) => p.id === formData.periodId)
    if (selectedPeriod && !formData.startMonth) {
      const year = selectedPeriod.year
      setFormData((prev) => ({
        ...prev,
        startMonth: `${year}-01-01`,
        endMonth: `${year}-12-31`
      }))
    }
  }, [formData.periodId, periods, formData.startMonth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const totalPaid = parseFloat(formData.monthlyAmount) * parseInt(formData.monthsPaid)

    try {
      const response = await fetch('/api/nka/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyAmount: parseFloat(formData.monthlyAmount),
          monthsPaid: parseInt(formData.monthsPaid),
          totalPaid
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      console.error('Error adding advance payment:', error)
      alert('Fehler beim Erfassen der Vorauszahlung')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPaid = formData.monthlyAmount && formData.monthsPaid
    ? (parseFloat(formData.monthlyAmount) * parseInt(formData.monthsPaid)).toFixed(2)
    : '0.00'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="tenant">Mieter *</Label>
        <Select
          value={formData.tenantId}
          onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Mieter auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName} - {tenant.property.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="period">Abrechnungszeitraum *</Label>
        <Select
          value={formData.periodId}
          onValueChange={(value) => setFormData({ ...formData, periodId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Zeitraum auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.year} - {period.property.address}, {period.property.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyAmount">Monatlicher Betrag (€) *</Label>
          <Input
            id="monthlyAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="150.00"
            value={formData.monthlyAmount}
            onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="monthsPaid">Anzahl Monate *</Label>
          <Input
            id="monthsPaid"
            type="number"
            min="1"
            max="12"
            placeholder="12"
            value={formData.monthsPaid}
            onChange={(e) => setFormData({ ...formData, monthsPaid: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startMonth">Von *</Label>
          <Input
            id="startMonth"
            type="date"
            value={formData.startMonth}
            onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endMonth">Bis *</Label>
          <Input
            id="endMonth"
            type="date"
            value={formData.endMonth}
            onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Gesamt gezahlt:</strong> €{totalPaid}
        </p>
        <p className="text-xs text-blue-700 mt-1">
          ({formData.monthlyAmount || '0'}€ × {formData.monthsPaid || '0'} Monate)
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Speichere...' : 'Vorauszahlung erfassen'}
        </Button>
      </div>
    </form>
  )
}
