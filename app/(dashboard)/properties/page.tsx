"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Building2, Home, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { AddPropertyForm } from '@/components/properties/AddPropertyForm'

interface Property {
  id: string
  address: string
  city: string
  postalCode: string
  type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL'
  units: number
  occupiedUnits: number
  monthlyRevenue: number
  purchasePrice?: number
}

const typeIcons = {
  APARTMENT: Building2,
  HOUSE: Home,
  COMMERCIAL: Briefcase,
}

const typeLabels = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  COMMERCIAL: 'Commercial',
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      const data = await response.json()
      setProperties(data.properties)
    } catch (error) {
      console.error('Failed to load properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const filteredProperties = properties.filter((property) =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading properties...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your real estate portfolio
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by address or city..."
            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const TypeIcon = typeIcons[property.type]
            const occupancyRate = property.units > 0 
              ? Math.round((property.occupiedUnits / property.units) * 100)
              : 0

            return (
              <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
                  <div className="p-6">
                    {/* Type badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <TypeIcon className="h-3 w-3" />
                        {typeLabels[property.type]}
                      </div>
                    </div>

                    {/* Address */}
                    <h3 className="mb-1 text-lg font-bold">{property.address}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {property.postalCode} {property.city}
                    </p>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Units</span>
                        <span className="font-semibold">
                          {property.occupiedUnits}/{property.units}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span
                          className={`font-semibold ${
                            occupancyRate >= 90
                              ? 'text-green-600'
                              : occupancyRate >= 70
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {occupancyRate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">Monthly Revenue</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(property.monthlyRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by adding your first property"}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          )}
        </Card>
      )}

      {/* Add Property Form */}
      <AddPropertyForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={loadProperties}
      />
    </div>
  )
}
