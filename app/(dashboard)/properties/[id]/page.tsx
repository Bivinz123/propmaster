"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Building2, Users, Euro, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { AddTenantForm } from '@/components/tenants/AddTenantForm'

interface Property {
  id: string
  address: string
  city: string
  postalCode: string
  type: string
  units: number
  purchasePrice: number | null
  currentValue: number | null
  occupiedUnits: number
  monthlyRevenue: number
  totalExpenses: number
  createdAt: string
  tenants: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    rentAmount: number
    leaseStart: string
    leaseEnd: string | null
  }>
  expenses: Array<{
    id: string
    category: string
    amount: number
    date: string
    description: string | null
  }>
  _count: {
    tenants: number
    expenses: number
    documents: number
  }
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddTenantForm, setShowAddTenantForm] = useState(false)
  const router = useRouter()
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      loadProperty(p.id)
    })
  }, [params])

  const loadProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data.property)
      } else {
        router.push('/dashboard/properties')
      }
    } catch (error) {
      console.error('Failed to load property:', error)
      router.push('/dashboard/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!property) return
    
    const confirmed = confirm(
      `Are you sure you want to delete ${property.address}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/properties')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete property')
      }
    } catch (error) {
      console.error('Failed to delete property:', error)
      alert('Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading property...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Property not found</div>
      </div>
    )
  }

  const occupancyRate = property.units > 0 
    ? Math.round((property.occupiedUnits / property.units) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{property.address}</h1>
            <p className="text-muted-foreground">
              {property.postalCode} {property.city}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting || property._count.tenants > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.type}</div>
            <p className="text-xs text-muted-foreground">
              {property.units} {property.units === 1 ? 'unit' : 'units'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {property.occupiedUnits}/{property.units} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(property.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active leases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Price</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {property.purchasePrice ? formatCurrency(property.purchasePrice) : 'N/A'}
            </div>
            {property.currentValue && (
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(property.currentValue)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tenants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Tenants</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddTenantForm(true)}>
                Add Tenant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {property.tenants.length > 0 ? (
              <div className="space-y-4">
                {property.tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {tenant.firstName} {tenant.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{tenant.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Since {formatDate(tenant.leaseStart)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(tenant.rentAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No active tenants</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <Button size="sm" variant="outline">
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {property.expenses.length > 0 ? (
              <div className="space-y-4">
                {property.expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Euro className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No expenses recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Info */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
              <dd className="mt-1 text-sm">{property.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">City</dt>
              <dd className="mt-1 text-sm">{property.city}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Postal Code</dt>
              <dd className="mt-1 text-sm">{property.postalCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd className="mt-1 text-sm">{property.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Units</dt>
              <dd className="mt-1 text-sm">{property.units}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Added On</dt>
              <dd className="mt-1 text-sm">{formatDate(property.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Expenses</dt>
              <dd className="mt-1 text-sm text-red-600">{formatCurrency(property.totalExpenses)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Documents</dt>
              <dd className="mt-1 text-sm">{property._count.documents} files</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Property Form */}
      <EditPropertyForm
        property={property}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={() => loadProperty(id)}
      />

      {/* Add Tenant Form */}
      <AddTenantForm
        open={showAddTenantForm}
        onOpenChange={setShowAddTenantForm}
        preSelectedPropertyId={id}
        onSuccess={() => loadProperty(id)}
      />
    </div>
  )
}
