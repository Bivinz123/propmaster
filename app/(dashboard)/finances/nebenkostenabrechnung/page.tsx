import { NebenAbrechnungGenerator } from '@/components/finances/NebenAbrechnungGenerator'

export default function NebenkostenabrechnungPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nebenkostenabrechnung</h1>
        <p className="text-muted-foreground">
          Generate annual operating cost statements for tenants (German tax compliance)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📋 What is Nebenkostenabrechnung?</h3>
        <p className="text-sm mb-2">
          Under German law (§ 556 BGB), landlords must provide tenants with an annual operating cost statement. 
          This document breaks down all property-related expenses and calculates each tenant's share.
        </p>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Must be provided within 12 months after the accounting period</li>
          <li>Costs are allocated per unit, per square meter, or per person</li>
          <li>Includes heating, water, trash, insurance, property tax, and maintenance</li>
          <li>Tenant can request corrections within 12 months</li>
        </ul>
      </div>

      <NebenAbrechnungGenerator />
    </div>
  )
}
