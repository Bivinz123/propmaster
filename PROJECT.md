# PropMaster - Real Estate Management SaaS

**Vision:** Shopify-quality dashboard for German property managers. Manage properties, tenants, finances, compliance, and maintenance with AI assistance.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL
- **Storage:** S3-compatible (documents)
- **AI:** OpenAI/Claude API (handwerker recommendations)
- **Real-time:** Pusher/Socket.io (tenant chat)
- **Hosting:** Vercel (dev) → Hetzner VPS (prod)

## Core Features

### 1. Dashboard (Shopify-like)
- Overview cards: total properties, occupied units, monthly revenue, pending tasks
- Quick actions: add property, add tenant, create expense
- Recent activity feed
- Financial graphs (monthly revenue, expense breakdown)

### 2. Property Management
- CRUD operations for properties
- Fields: address, type (apartment/house), units, purchase price, current value
- Photo gallery
- Document storage (purchase contracts, blueprints, certificates)
- Linked tenants & leases

### 3. Tenant Management
- CRUD operations for tenants
- Fields: name, contact, move-in date, lease details
- Lease tracking: rent amount, deposit, start/end dates
- Payment history
- Document storage (ID copies, contracts, correspondence)

### 4. Financial Tracking
- Rent payment tracking (monthly)
- Expense categories: Nebenkosten, repairs, insurance, property tax, mortgage
- Monthly/yearly financial reports
- Profit/loss calculations per property
- Export to CSV/Excel

### 5. Nebenkostenabrechnung (German Tax Compliance)
**Critical:** Must comply with German rental law (§ 556 BGB)

Required breakdown:
- Heating costs (Heizkosten)
- Water/sewage (Wasser/Abwasser)
- Trash collection (Müllabfuhr)
- Building insurance (Gebäudeversicherung)
- Property tax (Grundsteuer)
- Maintenance & cleaning (Hausmeister, Reinigung)
- Elevator maintenance (if applicable)
- Garden maintenance

**Auto-generate PDF:**
- Tenant-specific cost allocation
- Formulas: per unit, per sqm, or per person
- Period: typically Jan 1 - Dec 31
- Deadline: 12 months after period end

### 6. Document Management
- Upload & categorize documents
- Folders: contracts, invoices, certificates, correspondence
- Search & filter
- PDF preview
- Version history

### 7. Tenant Communication (Phase 3)
- In-app chat (manager ↔ tenant)
- Maintenance requests
- AI-powered handwerker suggestions
- Request status tracking
- Push notifications

### 8. AI Handwerker Recommendation
When tenant reports issue:
- Parse problem description
- Categorize (plumbing, electrical, HVAC, etc.)
- Suggest local handwerker from database
- Show ratings, availability, past jobs
- One-click booking

### 9. Smart Home Integration (Phase 4)
- Monitor: temperature, humidity, electricity usage
- Alerts for anomalies (water leak, high humidity → mold risk)
- Remote control (heating, lights)
- Energy consumption analytics

## Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(MANAGER)
  createdAt DateTime @default(now())
  properties Property[]
}

model Property {
  id            String   @id @default(cuid())
  address       String
  city          String
  postalCode    String
  type          PropertyType
  units         Int
  purchasePrice Decimal?
  currentValue  Decimal?
  ownerId       String
  owner         User     @relation(fields: [ownerId], references: [id])
  tenants       Tenant[]
  expenses      Expense[]
  documents     Document[]
  createdAt     DateTime @default(now())
}

model Tenant {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String
  phone       String?
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  leaseStart  DateTime
  leaseEnd    DateTime?
  rentAmount  Decimal
  deposit     Decimal
  payments    Payment[]
  documents   Document[]
  requests    MaintenanceRequest[]
  createdAt   DateTime @default(now())
}

model Payment {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  amount    Decimal
  date      DateTime
  type      PaymentType @default(RENT)
  status    PaymentStatus @default(PENDING)
  createdAt DateTime @default(now())
}

model Expense {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  category   ExpenseCategory
  amount     Decimal
  date       DateTime
  description String?
  receipt    String? // S3 URL
  createdAt  DateTime @default(now())
}

model Document {
  id          String   @id @default(cuid())
  name        String
  type        DocumentType
  url         String // S3 URL
  propertyId  String?
  property    Property? @relation(fields: [propertyId], references: [id])
  tenantId    String?
  tenant      Tenant?   @relation(fields: [tenantId], references: [id])
  uploadedAt  DateTime @default(now())
}

model MaintenanceRequest {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  category    String // plumbing, electrical, etc.
  description String
  status      RequestStatus @default(PENDING)
  priority    Priority @default(NORMAL)
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
}

enum Role {
  MANAGER
  TENANT
  ADMIN
}

enum PropertyType {
  APARTMENT
  HOUSE
  COMMERCIAL
}

enum PaymentType {
  RENT
  DEPOSIT
  NEBENKOSTEN
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
}

enum ExpenseCategory {
  HEATING
  WATER
  TRASH
  INSURANCE
  TAX
  MAINTENANCE
  REPAIR
  MORTGAGE
  OTHER
}

enum DocumentType {
  CONTRACT
  INVOICE
  CERTIFICATE
  CORRESPONDENCE
  ID
  OTHER
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CANCELLED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

## MVP Roadmap

**Week 1: Foundation**
- [x] Project setup
- [ ] Next.js + Tailwind + shadcn/ui
- [ ] Prisma schema + PostgreSQL
- [ ] Auth (NextAuth.js)
- [ ] Basic dashboard layout

**Week 2: Core CRUD**
- [ ] Property management (list, add, edit, delete)
- [ ] Tenant management
- [ ] Document upload (local → S3 later)

**Week 3: Financial**
- [ ] Payment tracking
- [ ] Expense management
- [ ] Simple reports (monthly revenue)

**Week 4: German Compliance**
- [ ] Nebenkostenabrechnung logic
- [ ] PDF generation
- [ ] Export functionality

**Phase 2 (Later):**
- Tenant app + chat
- AI handwerker system
- Smart home integration

## Development Workflow

1. **Vibe Code with AI:**
   - Use Claude/Codex for component generation
   - Prompt: "Build a PropertyList component with shadcn/ui Table. Show address, units, rent total, and actions."
   - Review, tweak, commit

2. **Iterative:**
   - Start with UI mockups (components only)
   - Wire up to mock data
   - Connect to real API/DB
   - Polish & optimize

3. **Test Locally:**
   - `npm run dev` at all times
   - Hot reload for fast iteration

## File Structure

```
propmaster/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx          # Property list
│   │   │   │   ├── [id]/page.tsx     # Property detail
│   │   │   │   └── new/page.tsx      # Add property
│   │   │   ├── tenants/
│   │   │   ├── finances/
│   │   │   └── documents/
│   │   ├── api/
│   │   │   ├── properties/
│   │   │   ├── tenants/
│   │   │   └── payments/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn components
│   │   ├── dashboard/
│   │   ├── properties/
│   │   └── tenants/
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── prisma/
│       └── schema.prisma
├── public/
├── package.json
└── PROJECT.md
```

## Coding Prompts for AI

### Component Example
```
Create a PropertyCard component using shadcn/ui Card.
Display:
- Property address (bold)
- Type badge (apartment/house)
- Occupied units (e.g., "3/5 units")
- Monthly revenue (formatted as EUR)
- Action buttons: View, Edit

Use Tailwind CSS. Make it responsive. Return TypeScript + JSX.
```

### API Endpoint Example
```
Create Next.js API route: GET /api/properties
- Fetch all properties for current user
- Include tenant count per property
- Include monthly revenue sum
- Use Prisma Client
- Return JSON
- Handle errors
```

## German Compliance Resources

- [§ 556 BGB - Nebenkosten](https://www.gesetze-im-internet.de/bgb/__556.html)
- [Betriebskostenverordnung (BetrKV)](https://www.gesetze-im-internet.de/betrkv/)
- Example Nebenkostenabrechnung PDFs (research required)

---

**Next Steps:**
1. Initialize Next.js project
2. Set up Prisma + PostgreSQL
3. Build dashboard shell
4. Start with Property CRUD

Let's build this. 🔱
