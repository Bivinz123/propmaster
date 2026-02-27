"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddPaymentForm } from '@/components/finances/AddPaymentForm'
import { AddExpenseForm } from '@/components/finances/AddExpenseForm'

interface Payment {
  id: string
  amount: number
  date: string
  type: string
  status: string
  tenant: {
    firstName: string
    lastName: string
    property: {
      address: string
    }
  }
}

interface Expense {
  id: string
  amount: number
  date: string
  category: string
  description: string | null
  property: {
    address: string
    city: string
  }
}

export default function FinancesPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [filterMonth, setFilterMonth] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [paymentsRes, expensesRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/expenses')
      ])
      
      const paymentsData = await paymentsRes.json()
      const expensesData = await expensesRes.json()
      
      setPayments(paymentsData.payments)
      setExpenses(expensesData.expenses)
    } catch (error) {
      console.error('Failed to load financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalExpenses = expenses
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const netProfit = totalRevenue - totalExpenses

  const pendingPayments = payments.filter(p => p.status === 'PENDING').length
  const overduePayments = payments.filter(p => p.status === 'OVERDUE').length

  // Combine and sort transactions
  const allTransactions = [
    ...payments.map(p => ({
      ...p,
      transactionType: 'payment' as const,
      displayAmount: Number(p.amount),
    })),
    ...expenses.map(e => ({
      ...e,
      transactionType: 'expense' as const,
      displayAmount: -Number(e.amount),
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const categoryLabels: Record<string, string> = {
    HEATING: 'Heating',
    WATER: 'Water',
    TRASH: 'Trash',
    INSURANCE: 'Insurance',
    TAX: 'Tax',
    MAINTENANCE: 'Maintenance',
    REPAIR: 'Repair',
    MORTGAGE: 'Mortgage',
    OTHER: 'Other',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading financial data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => setShowExpenseForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {payments.filter(p => p.status === 'PAID').length} paid transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenses.length} expense records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="warning">{pendingPayments + overduePayments}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              {overduePayments} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions.length > 0 ? (
            <div className="space-y-4">
              {allTransactions.slice(0, 20).map((transaction) => (
                <div
                  key={`${transaction.transactionType}-${transaction.id}`}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    {transaction.transactionType === 'payment' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            transaction.status === 'PAID' ? 'success' :
                            transaction.status === 'PENDING' ? 'warning' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                          <p className="font-medium">
                            {transaction.type} - {transaction.tenant.firstName} {transaction.tenant.lastName}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.tenant.property.address}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">
                          {categoryLabels[transaction.category] || transaction.category}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {transaction.property.address}, {transaction.property.city}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.displayAmount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.displayAmount > 0 ? '+' : ''}
                      {formatCurrency(transaction.displayAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start by recording a payment or expense
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <AddPaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        onSuccess={loadData}
      />
      <AddExpenseForm
        open={showExpenseForm}
        onOpenChange={setShowExpenseForm}
        onSuccess={loadData}
      />
    </div>
  )
}
