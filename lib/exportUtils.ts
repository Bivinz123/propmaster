// Export utilities for financial data

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function prepareFinancialDataForExport(payments: any[], expenses: any[]) {
  // Combine payments and expenses into single export format
  const paymentRecords = payments.map(p => ({
    Date: new Date(p.date).toLocaleDateString('de-DE'),
    Type: 'Payment',
    Category: p.type,
    Tenant: `${p.tenant.firstName} ${p.tenant.lastName}`,
    Property: p.tenant.property.address,
    Amount: Number(p.amount),
    Status: p.status,
  }))

  const expenseRecords = expenses.map(e => ({
    Date: new Date(e.date).toLocaleDateString('de-DE'),
    Type: 'Expense',
    Category: e.category,
    Tenant: '-',
    Property: e.property.address,
    Amount: -Number(e.amount),
    Status: 'Completed',
    Description: e.description || '-',
  }))

  return [...paymentRecords, ...expenseRecords].sort((a, b) => 
    new Date(b.Date).getTime() - new Date(a.Date).getTime()
  )
}
