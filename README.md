# PropMaster - Real Estate Management SaaS

Professional property management software built for German real estate managers.

## 🎯 Status: Foundation Complete (Phase 1)

**Built on:** February 27, 2026  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL

---

## ✅ What's Working

### Core Infrastructure
- ✅ Next.js 14 with App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS + shadcn/ui components
- ✅ PostgreSQL database (via Homebrew)
- ✅ Prisma ORM (v5.22.0)
- ✅ Database schema with 7 models (User, Property, Tenant, Payment, Expense, Document, MaintenanceRequest)

### Dashboard & Layout
- ✅ Responsive sidebar navigation
- ✅ Mobile-friendly (collapsible sidebar)
- ✅ Dashboard homepage with:
  - 4 stat cards (properties, units, revenue, tasks)
  - Recent activity feed
  - Quick actions panel

### Property Management (MVP)
- ✅ Property list page with search
- ✅ Property cards (type badge, occupancy, revenue)
- ✅ Add Property form (modal dialog)
- ✅ API routes: GET /api/properties, POST /api/properties
- ✅ Database integration (create & fetch properties)
- ✅ Property detail page (placeholder)

### UI Components
- ✅ Button, Card, Input, Label, Select, Dialog
- ✅ Utility functions (formatCurrency, formatDate, cn)
- ✅ Lucide icons

---

## 🚧 Coming Next (Phase 2-4)

### Tenant Management
- [ ] Tenant list page
- [ ] Add/edit tenant forms
- [ ] Lease tracking
- [ ] Payment history
- [ ] Tenant API routes

### Financial Tracking
- [ ] Payment tracking table
- [ ] Expense management
- [ ] Monthly/yearly reports
- [ ] Charts (Recharts integration)
- [ ] Profit/loss calculations

### German Tax Compliance
- [ ] Nebenkostenabrechnung generator
- [ ] PDF export (react-pdf)
- [ ] Cost allocation logic
- [ ] Tax-compliant formatting

### Document Management
- [ ] File upload (drag & drop)
- [ ] Document categorization
- [ ] S3 storage integration
- [ ] PDF preview

### Communication (Phase 3)
- [ ] Tenant app
- [ ] In-app chat
- [ ] Maintenance requests
- [ ] AI handwerker recommendations

### Smart Home (Phase 4)
- [ ] IoT device integration
- [ ] Sensor monitoring
- [ ] Alerts & automation

---

## 🚀 Running Locally

### Prerequisites
- Node.js 22+
- PostgreSQL 15 (installed via Homebrew)

### Setup

1. **Start PostgreSQL:**
   ```bash
   export PATH="/home/linuxbrew/.linuxbrew/opt/postgresql@15/bin:$PATH"
   pg_ctl -D /home/linuxbrew/.linuxbrew/var/postgresql@15 -l /home/linuxbrew/.linuxbrew/var/log/postgresql.log start
   ```

2. **Install dependencies:**
   ```bash
   cd /data/.openclaw/workspace/propmaster
   npm install
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start dev server:**
   ```bash
   PORT=3001 npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3001
   ```

---

## 📂 Project Structure

```
propmaster/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── dashboard/page.tsx    # Dashboard homepage
│   │   ├── properties/
│   │   │   ├── page.tsx          # Property list
│   │   │   └── [id]/page.tsx     # Property detail
│   │   ├── tenants/page.tsx
│   │   ├── finances/page.tsx
│   │   └── documents/page.tsx
│   ├── api/
│   │   └── properties/
│   │       └── route.ts          # Property API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to /dashboard
│   └── globals.css               # Tailwind styles
├── components/
│   ├── ui/                       # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   └── properties/
│       └── AddPropertyForm.tsx
├── lib/
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── PROJECT.md                    # Full spec & roadmap
├── SETUP.md                      # Setup instructions
├── PROMPTS.md                    # AI coding prompts
└── README.md                     # This file
```

---

## 🗄️ Database Schema

**7 Models:**
- User (property managers)
- Property (buildings/units)
- Tenant (lessees)
- Payment (rent & deposits)
- Expense (costs per property)
- Document (file storage)
- MaintenanceRequest (tenant issues)

**Full schema:** See `prisma/schema.prisma`

---

## 🛠️ Tech Details

- **Framework:** Next.js 14.1.6 (App Router, React Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.x + CSS variables for theming
- **Components:** shadcn/ui (headless, customizable)
- **Database:** PostgreSQL 15 (local via Homebrew)
- **ORM:** Prisma 5.22.0
- **Icons:** Lucide React
- **Deployment:** Ready for Vercel or Hetzner VPS

---

## 📝 Development Notes

- **Database URL:** `postgresql://node@localhost:5432/propmaster`
- **Dev server:** Port 3001 (3000 was in use)
- **Demo user:** `user-demo-id` (hardcoded for now, auth coming later)
- **Mock data:** Dashboard uses static data; properties use real DB

---

## 🎯 Next Session Goals

1. **Tenant Management:**
   - Tenant list with search/filter
   - Add/edit tenant forms
   - Link tenants to properties
   - Payment tracking UI

2. **Financial Module:**
   - Expense recording
   - Monthly revenue charts
   - Basic reporting

3. **Authentication:**
   - NextAuth.js integration
   - User sessions
   - Protected routes

---

## 📚 Resources

- **Docs:** See PROJECT.md for full spec
- **Prompts:** PROMPTS.md has ready-to-use AI prompts
- **Setup:** SETUP.md for detailed installation steps
- **German Tax Law:** § 556 BGB (Nebenkosten compliance)

---

## 🔧 Commands Reference

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Production build
npm run start                # Start production server

# Database
npx prisma studio            # Open Prisma Studio (DB GUI)
npx prisma migrate dev       # Run migrations
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Push schema changes (dev only)

# PostgreSQL
pg_ctl -D /home/linuxbrew/.linuxbrew/var/postgresql@15 start   # Start DB
pg_ctl -D /home/linuxbrew/.linuxbrew/var/postgresql@15 stop    # Stop DB
pg_ctl -D /home/linuxbrew/.linuxbrew/var/postgresql@15 status  # Check status
```

---

**Built with 🔱 by OpenClaw AI**  
*Vibe-coded from scratch in one session*
