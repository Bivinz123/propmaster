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
  postalCode: string
  type: string
  units: number
  purchasePrice: number | null
  currentValue: number | null
}

interface EditPropertyFormProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPropertyForm({ property, open, onOpenChange, onSuccess }: EditPropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    type: 'APARTMENT',
    units: '1',
    purchasePrice: '',
    currentValue: '',
  })

  useEffect(() => {
    if (property) {
      setFormData({
        address: property.address,
        city: property.city,
        postalCode: property.postalCode,
        type: property.type,
        units: String(property.units),
        purchasePrice: property.purchasePrice ? String(property.purchasePrice) : '',
        currentValue: property.currentValue ? String(property.currentValue) : '',
      })
    }
  }, [property])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update property')
      }

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

  if (!property) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update the property details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Hauptstraße 45"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Berlin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                placeholder="10115"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <SimpleSelect
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="COMMERCIAL">Commercial</option>
              </SimpleSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Units *</Label>
              <Input
                id="units"
                name="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (EUR)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="450000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value (EUR)</Label>
              <Input
                id="currentValue"
                name="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={handleChange}
                placeholder="500000"
              />
            </div>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
