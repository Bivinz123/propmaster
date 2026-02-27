import jsPDF from 'jspdf'

export function generateNebenkostenabrechnungPDF(report: any) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Nebenkostenabrechnung', 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`Abrechnungszeitraum: ${report.period.year}`, 105, 30, { align: 'center' })
  
  let y = 45
  
  // Tenant Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Mieter (Tenant):', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 7
  doc.text(report.tenant.name, 20, y)
  y += 5
  doc.text(report.tenant.email, 20, y)
  y += 10
  
  // Property Info
  doc.setFont('helvetica', 'bold')
  doc.text('Objekt (Property):', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 7
  doc.text(report.property.address, 20, y)
  y += 5
  doc.text(report.property.city, 20, y)
  y += 5
  doc.text(`Einheiten: ${report.property.totalUnits} (${report.property.occupiedUnits} belegt)`, 20, y)
  y += 15
  
  // Period
  doc.setFont('helvetica', 'bold')
  doc.text('Abrechnungszeitraum:', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 7
  doc.text(`Jahr: ${report.period.year}`, 20, y)
  y += 5
  doc.text(`Aktive Monate: ${report.period.monthsActive} / 12`, 20, y)
  y += 5
  doc.text(`Anpassungsfaktor: ${(report.period.monthlyFactor * 100).toFixed(1)}%`, 20, y)
  y += 15
  
  // Cost Breakdown
  doc.setFont('helvetica', 'bold')
  doc.text('Kostenaufstellung (Cost Breakdown):', 20, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const categoryLabels: Record<string, string> = {
    HEATING: 'Heizkosten',
    WATER: 'Wasser/Abwasser',
    TRASH: 'Müllabfuhr',
    INSURANCE: 'Gebäudeversicherung',
    TAX: 'Grundsteuer',
    MAINTENANCE: 'Hausmeister',
    REPAIR: 'Reparaturen',
    MORTGAGE: 'Hypothek',
    OTHER: 'Sonstige',
  }
  
  Object.entries(report.costs.byCategory).forEach(([category, costs]: [string, any]) => {
    const label = categoryLabels[category] || category
    doc.text(`${label}:`, 20, y)
    doc.text(`€${costs.tenantShare.toFixed(2)}`, 150, y, { align: 'right' })
    doc.setFontSize(8)
    doc.text(`(von €${costs.total.toFixed(2)})`, 195, y, { align: 'right' })
    doc.setFontSize(10)
    y += 6
    
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })
  
  y += 10
  
  // Totals
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Gesamtkosten Immobilie:', 20, y)
  doc.text(`€${report.costs.totalPropertyExpenses.toFixed(2)}`, 195, y, { align: 'right' })
  y += 7
  
  doc.text('Ihr Anteil (vor Anpassung):', 20, y)
  doc.text(`€${report.costs.totalTenantCosts.toFixed(2)}`, 195, y, { align: 'right' })
  y += 7
  
  doc.setFontSize(12)
  doc.text('Ihr Anteil (angepasst):', 20, y)
  doc.text(`€${report.costs.adjustedTenantCosts.toFixed(2)}`, 195, y, { align: 'right' })
  y += 15
  
  // Summary
  doc.setFontSize(11)
  doc.text('Zusammenfassung:', 20, y)
  y += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text('Gezahlte Miete:', 20, y)
  doc.text(`€${report.summary.rentPaid.toFixed(2)}`, 195, y, { align: 'right' })
  y += 6
  
  doc.text('Nebenkostenkosten:', 20, y)
  doc.text(`-€${report.summary.nebenkostenCosts.toFixed(2)}`, 195, y, { align: 'right' })
  y += 6
  
  doc.setFont('helvetica', 'bold')
  doc.text('Saldo:', 20, y)
  if (report.summary.balance >= 0) {
    doc.setTextColor(0, 128, 0) // Green
  } else {
    doc.setTextColor(255, 0, 0) // Red
  }
  doc.text(`€${report.summary.balance.toFixed(2)}`, 195, y, { align: 'right' })
  doc.setTextColor(0, 0, 0) // Black
  
  y += 15
  
  // Footer
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  if (report.summary.balance >= 0) {
    doc.text('✓ Mieter hat ausreichend Miete gezahlt, um Nebenkosten zu decken', 20, y)
  } else {
    doc.text('⚠ Zusätzliche Zahlung vom Mieter erforderlich', 20, y)
  }
  
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, y)
  doc.text('Gemäß § 556 BGB', 20, y + 5)
  
  return doc
}
