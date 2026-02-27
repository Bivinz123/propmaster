"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface Payment {
  amount: number
  date: string
  status: string
}

interface Expense {
  amount: number
  date: string
  category: string
}

interface FinancialChartsProps {
  payments: Payment[]
  expenses: Expense[]
}

const COLORS = {
  revenue: '#10b981',
  expense: '#ef4444',
  profit: '#3b82f6',
  HEATING: '#f59e0b',
  WATER: '#06b6d4',
  TRASH: '#84cc16',
  INSURANCE: '#8b5cf6',
  TAX: '#ec4899',
  MAINTENANCE: '#f97316',
  REPAIR: '#ef4444',
  MORTGAGE: '#6366f1',
  OTHER: '#64748b',
}

export function FinancialCharts({ payments, expenses }: FinancialChartsProps) {
  // Calculate monthly revenue and expenses for the last 12 months
  const getMonthlyData = () => {
    const monthlyData: Record<string, { month: string, revenue: number, expenses: number, profit: number }> = {}
    
    // Get last 12 months
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      
      monthlyData[monthKey] = {
        month: monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0,
      }
    }

    // Add payments (only PAID)
    payments
      .filter(p => p.status === 'PAID')
      .forEach(payment => {
        const date = new Date(payment.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += Number(payment.amount)
        }
      })

    // Add expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].expenses += Number(expense.amount)
      }
    })

    // Calculate profit
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].profit = monthlyData[key].revenue - monthlyData[key].expenses
    })

    return Object.values(monthlyData)
  }

  // Calculate expense breakdown by category
  const getExpenseByCategory = () => {
    const categoryTotals: Record<string, number> = {}
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
      categoryTotals[expense.category] += Number(expense.amount)
    })

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: total,
    }))
  }

  const monthlyData = getMonthlyData()
  const expenseByCategory = getExpenseByCategory()

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Revenue & Expenses Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue & Expense Trends (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `€${value.toFixed(2)}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={COLORS.revenue} 
                strokeWidth={2}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke={COLORS.expense} 
                strokeWidth={2}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={COLORS.profit} 
                strokeWidth={2}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    `${categoryLabels[name] || name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No expense data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Profit/Loss Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `€${value.toFixed(2)}`}
              />
              <Bar 
                dataKey="profit" 
                fill={COLORS.profit}
                name="Profit/Loss"
              >
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? COLORS.revenue : COLORS.expense} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
