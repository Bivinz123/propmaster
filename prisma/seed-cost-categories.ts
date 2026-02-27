// Seed default German cost categories according to § 2 BetrKV

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  {
    name: 'Property Tax',
    nameDE: 'Grundsteuer',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 1',
    sortOrder: 1,
    isAllocable: true
  },
  {
    name: 'Water Supply',
    nameDE: 'Wasserversorgung',
    allocationType: 'CONSUMPTION',
    betrkvSection: '§ 2 Nr. 2',
    sortOrder: 2,
    isAllocable: true
  },
  {
    name: 'Sewage',
    nameDE: 'Entwässerung',
    allocationType: 'CONSUMPTION',
    betrkvSection: '§ 2 Nr. 3',
    sortOrder: 3,
    isAllocable: true
  },
  {
    name: 'Heating',
    nameDE: 'Heizkosten',
    allocationType: 'HEATING_MIXED',
    betrkvSection: '§ 2 Nr. 4 (HeizkostenV § 7-9)',
    sortOrder: 4,
    isAllocable: true
  },
  {
    name: 'Hot Water',
    nameDE: 'Warmwasser',
    allocationType: 'CONSUMPTION',
    betrkvSection: '§ 2 Nr. 5',
    sortOrder: 5,
    isAllocable: true
  },
  {
    name: 'Elevator',
    nameDE: 'Aufzug',
    allocationType: 'PER_UNIT',
    betrkvSection: '§ 2 Nr. 6',
    sortOrder: 6,
    isAllocable: true
  },
  {
    name: 'Street Cleaning',
    nameDE: 'Straßenreinigung',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 7',
    sortOrder: 7,
    isAllocable: true
  },
  {
    name: 'Waste Disposal',
    nameDE: 'Müllbeseitigung',
    allocationType: 'PER_UNIT',
    betrkvSection: '§ 2 Nr. 8',
    sortOrder: 8,
    isAllocable: true
  },
  {
    name: 'Building Cleaning',
    nameDE: 'Gebäudereinigung',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 9',
    sortOrder: 9,
    isAllocable: true
  },
  {
    name: 'Garden Maintenance',
    nameDE: 'Gartenpflege',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 10',
    sortOrder: 10,
    isAllocable: true
  },
  {
    name: 'Lighting',
    nameDE: 'Beleuchtung',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 11',
    sortOrder: 11,
    isAllocable: true
  },
  {
    name: 'Chimney Sweep',
    nameDE: 'Schornsteinreinigung',
    allocationType: 'PER_UNIT',
    betrkvSection: '§ 2 Nr. 12',
    sortOrder: 12,
    isAllocable: true
  },
  {
    name: 'Building Insurance',
    nameDE: 'Gebäudeversicherung',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 13',
    sortOrder: 13,
    isAllocable: true
  },
  {
    name: 'Caretaker',
    nameDE: 'Hausmeister',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 14',
    sortOrder: 14,
    isAllocable: true
  },
  {
    name: 'Antenna/Cable TV',
    nameDE: 'Antenne/Kabel',
    allocationType: 'PER_UNIT',
    betrkvSection: '§ 2 Nr. 15',
    sortOrder: 15,
    isAllocable: true
  },
  {
    name: 'Laundry Facilities',
    nameDE: 'Wascheinrichtungen',
    allocationType: 'PER_UNIT',
    betrkvSection: '§ 2 Nr. 16',
    sortOrder: 16,
    isAllocable: true
  },
  {
    name: 'Other Allocable Costs',
    nameDE: 'Sonstige umlagefähige Kosten',
    allocationType: 'PER_SQM',
    betrkvSection: '§ 2 Nr. 17',
    sortOrder: 17,
    isAllocable: true
  },
  {
    name: 'Repairs (Non-Allocable)',
    nameDE: 'Instandsetzung/Reparaturen',
    allocationType: 'PER_SQM',
    betrkvSection: 'Nicht umlagefähig',
    sortOrder: 18,
    isAllocable: false
  },
  {
    name: 'Administration Costs (Non-Allocable)',
    nameDE: 'Verwaltungskosten',
    allocationType: 'PER_SQM',
    betrkvSection: 'Nicht umlagefähig',
    sortOrder: 19,
    isAllocable: false
  }
]

async function seedCostCategories() {
  console.log('🌱 Seeding cost categories...')

  for (const category of defaultCategories) {
    await prisma.costCategory.upsert({
      where: { name: category.name },
      update: {
        nameDE: category.nameDE,
        allocationType: category.allocationType,
        betrkvSection: category.betrkvSection,
        sortOrder: category.sortOrder,
        isAllocable: category.isAllocable
      },
      create: category
    })
  }

  console.log(`✅ Seeded ${defaultCategories.length} cost categories`)
}

seedCostCategories()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
