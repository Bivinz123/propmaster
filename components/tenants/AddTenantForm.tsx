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

interface AddTenantFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preSelectedPropertyId?: string
}

export function AddTenantForm({ open, onOpenChange, onSuccess, preSelectedPropertyId }: AddTenantFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: preSelectedPropertyId || '',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: '',
    deposit: '',
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
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create tenant')
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        propertyId: preSelectedPropertyId || '',
        leaseStart: '',
        leaseEnd: '',
        rentAmount: '',
        deposit: '',
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Enter the tenant and lease details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Maria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Schmidt"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="maria.schmidt@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 123 456789"
            />
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leaseStart">Lease Start *</Label>
              <Input
                id="leaseStart"
                name="leaseStart"
                type="date"
                value={formData.leaseStart}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaseEnd">Lease End</Label>
              <Input
                id="leaseEnd"
                name="leaseEnd"
                type="date"
                value={formData.leaseEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent (EUR) *</Label>
              <Input
                id="rentAmount"
                name="rentAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.rentAmount}
                onChange={handleChange}
                required
                placeholder="850.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (EUR) *</Label>
              <Input
                id="deposit"
                name="deposit"
                type="number"
                step="0.01"
                min="0"
                value={formData.deposit}
                onChange={handleChange}
                required
                placeholder="2550.00"
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
              {loading ? 'Creating...' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
