'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Property {
  id: string
  address: string
  city: string
}

interface CreatePeriodFormProps {
  onSuccess: () => void
}

export function CreatePeriodForm({ onSuccess }: CreatePeriodFormProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    propertyId: '',
    year: new Date().getFullYear(),
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleYearChange = (year: string) => {
    setFormData({
      ...formData,
      year: parseInt(year),
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/nka/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      console.error('Error creating period:', error)
      alert('Fehler beim Erstellen des Zeitraums')
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="property">Objekt *</Label>
        <Select
          value={formData.propertyId}
          onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Objekt auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.address}, {property.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="year">Abrechnungsjahr *</Label>
        <Select
          value={formData.year.toString()}
          onValueChange={handleYearChange}
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Startdatum *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Enddatum *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Hinweis:</strong> Nach § 556 BGB muss die Abrechnung innerhalb von 12 Monaten
          nach Ende des Abrechnungszeitraums erstellt werden.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Erstelle...' : 'Zeitraum erstellen'}
        </Button>
      </div>
    </form>
  )
}
