"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Mail, Phone, Home, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddTenantForm } from '@/components/tenants/AddTenantForm'
import Link from 'next/link'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  rentAmount: number
  deposit: number
  leaseStart: string
  leaseEnd: string | null
  leaseStatus: 'ACTIVE' | 'EXPIRED'
  property: {
    id: string
    address: string
    city: string
  }
  _count: {
    payments: number
    documents: number
    requests: number
  }
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL')

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      const data = await response.json()
      setTenants(data.tenants)
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.property.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      filterStatus === 'ALL' || tenant.leaseStatus === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tenants...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your tenants and leases
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or property..."
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ALL')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ACTIVE')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'EXPIRED' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('EXPIRED')}
          >
            Expired
          </Button>
        </div>
      </div>

      {/* Tenants List */}
      {filteredTenants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => (
            <Link key={tenant.id} href={`/dashboard/tenants/${tenant.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant={tenant.leaseStatus === 'ACTIVE' ? 'success' : 'warning'}>
                      {tenant.leaseStatus}
                    </Badge>
                  </div>

                  {/* Tenant Name */}
                  <h3 className="mb-1 text-lg font-bold">
                    {tenant.firstName} {tenant.lastName}
                  </h3>

                  {/* Contact Info */}
                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Property */}
                  <div className="mb-3 flex items-start gap-2 text-sm">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{tenant.property.address}</p>
                      <p className="text-muted-foreground">{tenant.property.city}</p>
                    </div>
                  </div>

                  {/* Lease Info */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(tenant.rentAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lease Start</span>
                      <span className="font-medium">{formatDate(tenant.leaseStart)}</span>
                    </div>
                    {tenant.leaseEnd && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lease End</span>
                        <span className="font-medium">{formatDate(tenant.leaseEnd)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>{tenant._count.payments} payments</span>
                    <span>{tenant._count.documents} documents</span>
                    <span>{tenant._count.requests} requests</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No tenants found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || filterStatus !== 'ALL'
              ? "Try adjusting your search or filters"
              : "Get started by adding your first tenant"}
          </p>
          {!searchQuery && filterStatus === 'ALL' && (
            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          )}
        </Card>
      )}

      {/* Add Tenant Form */}
      <AddTenantForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={loadTenants}
      />
    </div>
  )
}
