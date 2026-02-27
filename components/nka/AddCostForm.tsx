'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CostCategory {
  id: string
  nameDE: string
  allocationType: string
  isAllocable: boolean
  betrkvSection: string | null
}

interface AddCostFormProps {
  periodId: string
  onSuccess: () => void
}

export function AddCostForm({ periodId, onSuccess }: AddCostFormProps) {
  const [categories, setCategories] = useState<CostCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: '',
    totalAmount: '',
    allocableAmount: '',
    description: '',
    invoiceNumber: '',
    invoiceDate: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/nka/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/nka/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId,
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          allocableAmount: formData.allocableAmount
            ? parseFloat(formData.allocableAmount)
            : parseFloat(formData.totalAmount)
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      console.error('Error adding cost:', error)
      alert('Fehler beim Hinzufügen der Kosten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="category">Kostenart *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Kostenart auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nameDE}
                {category.betrkvSection && ` (${category.betrkvSection})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCategory && (
          <p className="text-sm text-slate-600 mt-1">
            Verteilerschlüssel: {selectedCategory.allocationType} •{' '}
            {selectedCategory.isAllocable ? 'Umlagefähig' : 'Nicht umlagefähig'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalAmount">Gesamtbetrag (€) *</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="allocableAmount">Umlagefähiger Betrag (€)</Label>
          <Input
            id="allocableAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Optional (Standard: Gesamtbetrag)"
            value={formData.allocableAmount}
            onChange={(e) => setFormData({ ...formData, allocableAmount: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">
            Nur ausfüllen, wenn teilweise nicht umlagefähig
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Input
          id="description"
          placeholder="z.B. Heizöllieferung Q1"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
          <Input
            id="invoiceNumber"
            placeholder="z.B. RE-2025-001"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
          <Input
            id="invoiceDate"
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Hinweis:</strong> Der Verteilerschlüssel wird automatisch anhand der
          gewählten Kostenart angewendet.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Speichere...' : 'Kosten hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
