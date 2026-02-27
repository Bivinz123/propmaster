// Nebenkostenabrechnung - Professional Calculation Logic
// According to § 556 BGB and Betriebskostenverordnung (BetrKV)

interface Tenant {
  id: string
  squareMeters: number | null
  numberOfPersons: number
  eigentumsanteil: number | null
  leaseStart: Date
  leaseEnd: Date | null
}

interface CostItem {
  category: {
    allocationType: string
    nameDE: string
  }
  totalAmount: number
  allocableAmount: number | null
}

interface MeterReading {
  consumption: number | null
}

interface AdvancePayment {
  totalPaid: number
}

interface CalculationParams {
  tenant: Tenant
  allTenants: Tenant[]
  costItems: CostItem[]
  periodStart: Date
  periodEnd: Date
  totalSquareMeters: number
  totalUnits: number
  meterReadings?: Record<string, number> // category -> consumption
  advancePayments: AdvancePayment[]
}

export interface NKAResult {
  tenant: {
    id: string
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

/**
 * Calculate active months for tenant in period
 */
function getActiveMonths(
  tenantStart: Date,
  tenantEnd: Date | null,
  periodStart: Date,
  periodEnd: Date
): number {
  const start = tenantStart > periodStart ? tenantStart : periodStart
  const end = tenantEnd && tenantEnd < periodEnd ? tenantEnd : periodEnd

  const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  return Math.max(1, Math.ceil(months))
}

/**
 * Calculate tenant share based on allocation method
 */
function calculateShare(
  allocationType: string,
  totalAmount: number,
  tenant: Tenant,
  allTenants: Tenant[],
  totalSquareMeters: number,
  totalUnits: number,
  consumption?: number,
  totalConsumption?: number
): { share: number; calculation: string } {
  switch (allocationType) {
    case 'PER_UNIT': {
      const share = totalAmount / totalUnits
      return {
        share,
        calculation: `€${totalAmount.toFixed(2)} / ${totalUnits} Einheiten = €${share.toFixed(2)}`
      }
    }

    case 'PER_SQM': {
      if (!tenant.squareMeters) {
        return { share: 0, calculation: 'Keine Wohnfläche hinterlegt' }
      }
      const share = (tenant.squareMeters / totalSquareMeters) * totalAmount
      return {
        share,
        calculation: `(${tenant.squareMeters}m² / ${totalSquareMeters}m²) × €${totalAmount.toFixed(2)} = €${share.toFixed(2)}`
      }
    }

    case 'PER_PERSON': {
      const totalPersons = allTenants.reduce((sum, t) => sum + t.numberOfPersons, 0)
      const share = (tenant.numberOfPersons / totalPersons) * totalAmount
      return {
        share,
        calculation: `(${tenant.numberOfPersons} Pers. / ${totalPersons} Pers.) × €${totalAmount.toFixed(2)} = €${share.toFixed(2)}`
      }
    }

    case 'CONSUMPTION': {
      if (!consumption || !totalConsumption || totalConsumption === 0) {
        return { share: 0, calculation: 'Keine Verbrauchsdaten vorhanden' }
      }
      const share = (consumption / totalConsumption) * totalAmount
      return {
        share,
        calculation: `(${consumption} Einheiten / ${totalConsumption} Einheiten) × €${totalAmount.toFixed(2)} = €${share.toFixed(2)}`
      }
    }

    case 'HEATING_MIXED': {
      // § 7 HeizkostenV: Mind. 50%, max. 70% nach Verbrauch
      // Rest nach Wohnfläche
      const consumptionPercent = 0.7
      const areaPercent = 0.3

      const consumptionPart = totalAmount * consumptionPercent
      const areaPart = totalAmount * areaPercent

      let tenantShare = 0
      let calc = ''

      // Verbrauchsanteil
      if (consumption && totalConsumption && totalConsumption > 0) {
        const consumptionShare = (consumption / totalConsumption) * consumptionPart
        tenantShare += consumptionShare
        calc += `Verbrauch: (${consumption}/${totalConsumption}) × €${consumptionPart.toFixed(2)} = €${consumptionShare.toFixed(2)}`
      }

      // Flächenanteil
      if (tenant.squareMeters) {
        const areaShare = (tenant.squareMeters / totalSquareMeters) * areaPart
        tenantShare += areaShare
        calc += ` + Fläche: (${tenant.squareMeters}m²/${totalSquareMeters}m²) × €${areaPart.toFixed(2)} = €${areaShare.toFixed(2)}`
      }

      return {
        share: tenantShare,
        calculation: calc || 'Keine Daten'
      }
    }

    case 'MEA': {
      if (!tenant.eigentumsanteil) {
        return { share: 0, calculation: 'Kein Miteigentumsanteil hinterlegt' }
      }
      const share = tenant.eigentumsanteil * totalAmount
      return {
        share,
        calculation: `${(tenant.eigentumsanteil * 100).toFixed(4)}% × €${totalAmount.toFixed(2)} = €${share.toFixed(2)}`
      }
    }

    default:
      return { share: 0, calculation: 'Unbekannte Verteilungsmethode' }
  }
}

/**
 * Main calculation function
 */
export function calculateNebenkostenabrechnung(params: CalculationParams): NKAResult {
  const {
    tenant,
    allTenants,
    costItems,
    periodStart,
    periodEnd,
    totalSquareMeters,
    totalUnits,
    meterReadings = {},
    advancePayments
  } = params

  // Calculate active months
  const activeMonths = getActiveMonths(
    tenant.leaseStart,
    tenant.leaseEnd,
    periodStart,
    periodEnd
  )

  const monthlyFactor = activeMonths / 12

  // Calculate costs by category
  const costsByCategory: Record<string, any> = {}
  let totalPropertyCosts = 0
  let totalTenantCosts = 0

  costItems.forEach((item) => {
    const allocableAmount = item.allocableAmount ?? item.totalAmount
    totalPropertyCosts += item.totalAmount

    // Get consumption for this category if available
    const consumption = meterReadings[item.category.nameDE]
    const totalConsumption = consumption 
      ? Object.values(meterReadings).reduce((sum, val) => sum + val, 0)
      : undefined

    const { share, calculation } = calculateShare(
      item.category.allocationType,
      allocableAmount,
      tenant,
      allTenants,
      totalSquareMeters,
      totalUnits,
      consumption,
      totalConsumption
    )

    // Apply monthly factor
    const adjustedShare = share * monthlyFactor

    costsByCategory[item.category.nameDE] = {
      total: item.totalAmount,
      allocable: allocableAmount,
      tenantShare: adjustedShare,
      allocationType: item.category.allocationType,
      calculation: `${calculation} × ${monthlyFactor.toFixed(2)} = €${adjustedShare.toFixed(2)}`
    }

    totalTenantCosts += adjustedShare
  })

  // Calculate advance payments
  const totalAdvances = advancePayments.reduce((sum, adv) => sum + adv.totalPaid, 0)
  const monthlyAdvance = totalAdvances / Math.max(activeMonths, 1)

  // Calculate balance
  const difference = totalAdvances - totalTenantCosts

  return {
    tenant: {
      id: tenant.id,
      activeMonths,
      factor: monthlyFactor
    },
    property: {
      totalSquareMeters,
      totalUnits,
      totalPersons: allTenants.reduce((sum, t) => sum + t.numberOfPersons, 0)
    },
    costs: {
      byCategory: costsByCategory,
      totalPropertyCosts,
      totalTenantCosts
    },
    advancePayments: {
      monthlyAmount: monthlyAdvance,
      months: activeMonths,
      total: totalAdvances
    },
    balance: {
      costs: totalTenantCosts,
      advances: totalAdvances,
      difference: Math.abs(difference),
      type: difference >= 0 ? 'GUTHABEN' : 'NACHZAHLUNG'
    }
  }
}

/**
 * Validate calculation inputs
 */
export function validateNKAInputs(params: CalculationParams): string[] {
  const errors: string[] = []

  if (!params.tenant.squareMeters && 
      params.costItems.some(i => i.category.allocationType === 'PER_SQM')) {
    errors.push('Wohnfläche fehlt für Berechnung nach m²')
  }

  if (params.totalSquareMeters === 0) {
    errors.push('Gesamtwohnfläche des Objekts fehlt')
  }

  if (params.totalUnits === 0) {
    errors.push('Anzahl Einheiten fehlt')
  }

  if (params.allTenants.length === 0) {
    errors.push('Keine Mieter im System')
  }

  return errors
}
