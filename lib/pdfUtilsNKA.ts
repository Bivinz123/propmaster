// Professional Nebenkostenabrechnung PDF Generator
// According to § 556 BGB and Betriebskostenverordnung (BetrKV)

import jsPDF from 'jspdf'

interface NKAData {
  period: {
    id: string
    year: number
    startDate: string
    endDate: string
  }
  tenant: {
    id: string
    name: string
    email: string
    squareMeters: number
    numberOfPersons: number
  }
  property: {
    id: string
    address: string
    city: string
    totalSquareMeters: number
    totalUnits: number
  }
  calculation: {
    tenant: {
      activeMonths: number
      factor: number
    }
    property: {
      totalSquareMeters: number
      totalUnits: number
      totalPersons: number
    }
    costs: {
      byCategory: Record<string, {
        total: number
        allocable: number
        tenantShare: number
        allocationType: string
        calculation: string
      }>
      totalPropertyCosts: number
      totalTenantCosts: number
    }
    advancePayments: {
      monthlyAmount: number
      months: number
      total: number
    }
    balance: {
      costs: number
      advances: number
      difference: number
      type: 'NACHZAHLUNG' | 'GUTHABEN'
    }
  }
}

export function generateNebenkostenabrechnungPDF(data: NKAData, filename: string) {
  const doc = new jsPDF()
  let yPos = 20

  // Helper function to add text
  const addText = (text: string, x: number, y: number, size: number = 10, style: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.text(text, x, y)
  }

  // Helper function for line breaks
  const addLine = (y: number) => {
    doc.setDrawColor(200, 200, 200)
    doc.line(15, y, 195, y)
  }

  // ====== HEADER ======
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  addText('BETRIEBSKOSTENABRECHNUNG', 15, 15, 18, 'bold')
  addText(`Abrechnungsjahr ${data.period.year}`, 15, 23, 12)
  doc.setTextColor(0, 0, 0)
  yPos = 40

  // ====== SECTION 1: Vermieter & Mieter ======
  addText('1. Beteiligte', 15, yPos, 12, 'bold')
  yPos += 8

  addText('Vermieter:', 15, yPos, 10, 'bold')
  yPos += 5
  addText('PropMaster GmbH', 15, yPos)
  yPos += 5
  addText(data.property.address, 15, yPos)
  yPos += 5
  addText(data.property.city, 15, yPos)
  yPos += 10

  addText('Mieter:', 15, yPos, 10, 'bold')
  yPos += 5
  addText(data.tenant.name, 15, yPos)
  yPos += 5
  addText(data.tenant.email, 15, yPos)
  yPos += 5
  addText(`Wohnfläche: ${data.tenant.squareMeters}m² • Personen: ${data.tenant.numberOfPersons}`, 15, yPos)
  yPos += 10

  addLine(yPos)
  yPos += 10

  // ====== SECTION 2: Abrechnungszeitraum ======
  addText('2. Abrechnungszeitraum', 15, yPos, 12, 'bold')
  yPos += 8

  const startDate = new Date(data.period.startDate).toLocaleDateString('de-DE')
  const endDate = new Date(data.period.endDate).toLocaleDateString('de-DE')
  addText(`Zeitraum: ${startDate} bis ${endDate}`, 15, yPos)
  yPos += 5
  addText(`Aktive Monate: ${data.calculation.tenant.activeMonths} Monate`, 15, yPos)
  yPos += 5
  addText(`Anpassungsfaktor: ${data.calculation.tenant.factor.toFixed(2)}`, 15, yPos)
  yPos += 10

  addLine(yPos)
  yPos += 10

  // ====== SECTION 3: Gesamtkosten Objekt ======
  addText('3. Gesamtkosten des Objekts', 15, yPos, 12, 'bold')
  yPos += 8

  addText('Kostenart', 15, yPos, 9, 'bold')
  addText('Gesamtbetrag', 120, yPos, 9, 'bold')
  addText('Umlagefähig', 160, yPos, 9, 'bold')
  yPos += 5

  Object.entries(data.calculation.costs.byCategory).forEach(([category, costData]) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    addText(category, 15, yPos, 9)
    addText(`€${costData.total.toFixed(2)}`, 120, yPos, 9)
    addText(`€${costData.allocable.toFixed(2)}`, 160, yPos, 9)
    yPos += 5
  })

  yPos += 3
  addLine(yPos)
  yPos += 5
  addText('GESAMT', 15, yPos, 10, 'bold')
  addText(`€${data.calculation.costs.totalPropertyCosts.toFixed(2)}`, 120, yPos, 10, 'bold')
  yPos += 10

  addLine(yPos)
  yPos += 10

  // ====== SECTION 4: Mieteranteil ======
  addText('4. Ihr Anteil', 15, yPos, 12, 'bold')
  yPos += 8

  addText('Kostenart', 15, yPos, 9, 'bold')
  addText('Verteilerschlüssel', 80, yPos, 9, 'bold')
  addText('Betrag', 160, yPos, 9, 'bold')
  yPos += 5

  Object.entries(data.calculation.costs.byCategory).forEach(([category, costData]) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    addText(category, 15, yPos, 9)
    addText(costData.allocationType, 80, yPos, 8)
    addText(`€${costData.tenantShare.toFixed(2)}`, 160, yPos, 9)
    yPos += 5
  })

  yPos += 3
  addLine(yPos)
  yPos += 5
  addText('IHR ANTEIL GESAMT', 15, yPos, 10, 'bold')
  addText(`€${data.calculation.costs.totalTenantCosts.toFixed(2)}`, 160, yPos, 10, 'bold')
  yPos += 10

  addLine(yPos)
  yPos += 10

  // ====== SECTION 5: Vorauszahlungen ======
  addText('5. Vorauszahlungen', 15, yPos, 12, 'bold')
  yPos += 8

  addText(`Monatlich geleistete Vorauszahlung:`, 15, yPos)
  addText(`€${data.calculation.advancePayments.monthlyAmount.toFixed(2)}`, 160, yPos)
  yPos += 5
  addText(`Anzahl Monate:`, 15, yPos)
  addText(`${data.calculation.advancePayments.months}`, 160, yPos)
  yPos += 5
  addLine(yPos)
  yPos += 5
  addText('Gesamt gezahlt:', 15, yPos, 10, 'bold')
  addText(`€${data.calculation.advancePayments.total.toFixed(2)}`, 160, yPos, 10, 'bold')
  yPos += 10

  addLine(yPos)
  yPos += 10

  // ====== SECTION 6: Saldo ======
  addText('6. Abrechnung', 15, yPos, 12, 'bold')
  yPos += 8

  addText('Ihre Kosten:', 15, yPos)
  addText(`€${data.calculation.balance.costs.toFixed(2)}`, 160, yPos)
  yPos += 5
  addText('Vorauszahlungen:', 15, yPos)
  addText(`-€${data.calculation.balance.advances.toFixed(2)}`, 160, yPos)
  yPos += 5
  addLine(yPos)
  yPos += 5

  // Color-coded balance
  if (data.calculation.balance.type === 'GUTHABEN') {
    doc.setTextColor(0, 150, 0) // Green
    addText('GUTHABEN:', 15, yPos, 12, 'bold')
    addText(`€${data.calculation.balance.difference.toFixed(2)}`, 160, yPos, 12, 'bold')
  } else {
    doc.setTextColor(200, 0, 0) // Red
    addText('NACHZAHLUNG:', 15, yPos, 12, 'bold')
    addText(`€${data.calculation.balance.difference.toFixed(2)}`, 160, yPos, 12, 'bold')
  }
  doc.setTextColor(0, 0, 0)
  yPos += 15

  // ====== FOOTER: Legal Notice ======
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  doc.setFillColor(240, 240, 240)
  doc.rect(15, yPos, 180, 30, 'F')
  yPos += 7

  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.text('Rechtsgrundlagen:', 17, yPos)
  yPos += 4
  doc.text('• § 556 BGB: Betriebskosten', 17, yPos)
  yPos += 4
  doc.text('• Betriebskostenverordnung (BetrKV)', 17, yPos)
  yPos += 4
  doc.text('• Heizkostenverordnung (HeizkostenV)', 17, yPos)
  yPos += 6
  doc.setFontSize(7)
  doc.text('Widerspruchsfrist: 12 Monate nach Zugang der Abrechnung (§ 556 Abs. 3 BGB)', 17, yPos)
  yPos += 3
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 17, yPos)

  // Download
  doc.save(`${filename}.pdf`)
}
