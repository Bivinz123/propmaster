"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleSelect } from '@/components/ui/simple-select'

interface Property {
  id: string
  address: string
  city: string
}

interface AddExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preSelectedPropertyId?: string
}

export function AddExpenseForm({ open, onOpenChange, onSuccess, preSelectedPropertyId }: AddExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    propertyId: preSelectedPropertyId || '',
    category: 'OTHER',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => {
    if (open) {
      loadProperties()
    }
  }, [open])

  useEffect(() => {
    if (preSelectedPropertyId) {
      setFormData(prev => ({ ...prev, propertyId: preSelectedPropertyId }))
    }
  }, [preSelectedPropertyId])

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      const data = await response.json()
      setProperties(data.properties)
    } catch (error) {
      console.error('Failed to load properties:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create expense')
      }

      setFormData({
        propertyId: preSelectedPropertyId || '',
        category: 'OTHER',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
          <DialogDescription>
            Add a property expense or cost
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property *</Label>
            <SimpleSelect
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}, {property.city}
                </option>
              ))}
            </SimpleSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <SimpleSelect
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="HEATING">Heating (Heizkosten)</option>
              <option value="WATER">Water/Sewage (Wasser)</option>
              <option value="TRASH">Trash Collection (Müllabfuhr)</option>
              <option value="INSURANCE">Building Insurance (Gebäudeversicherung)</option>
              <option value="TAX">Property Tax (Grundsteuer)</option>
              <option value="MAINTENANCE">Maintenance (Instandhaltung)</option>
              <option value="REPAIR">Repair (Reparatur)</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="OTHER">Other</option>
            </SimpleSelect>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (EUR) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="1200.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Expense Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Boiler repair, window replacement, etc."
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
