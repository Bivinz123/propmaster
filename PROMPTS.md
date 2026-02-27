# PropMaster AI Coding Prompts

Copy-paste these into Claude/Cursor/Codex for instant component generation.

---

## 1. Dashboard Homepage

```
Create the dashboard homepage for PropMaster (real estate management SaaS).

Layout:
- 4 stat cards in a grid (2x2 on desktop):
  1. Total Properties (icon: building)
  2. Occupied Units (icon: users)
  3. Monthly Revenue (icon: euro, show EUR formatted)
  4. Pending Tasks (icon: alert-circle)

- Below stats: 2-column layout
  - Left: Recent Activity feed (list of latest actions)
  - Right: Quick Actions (buttons to add property/tenant, create expense)

Use:
- Next.js App Router (app/(dashboard)/page.tsx)
- shadcn/ui Card, Button components
- Tailwind CSS
- TypeScript
- Lucide icons
- Mock data for now (hardcode stats)

Return complete code with proper imports.
```

---

## 2. Property List Component

```
Create a PropertyList component for PropMaster.

Display properties in a shadcn/ui Table:

Columns:
- Address (bold, clickable)
- Type (badge: "Apartment" / "House")
- Units (e.g., "3/5 occupied")
- Monthly Revenue (EUR formatted)
- Actions (dropdown: View, Edit, Delete)

Features:
- Search/filter by address or city
- Sort by revenue or units
- "Add Property" button (top-right)
- Responsive (mobile: cards instead of table)

Use:
- TypeScript + React
- shadcn/ui Table, Badge, Button, DropdownMenu
- Tailwind CSS
- Mock data array (3-5 properties)

File: components/properties/PropertyList.tsx
```

---

## 3. Add Property Form

```
Create an AddPropertyForm component (modal dialog).

Form fields:
- Address (text, required)
- City (text, required)
- Postal Code (text, required)
- Type (select: Apartment / House / Commercial)
- Units (number, default 1)
- Purchase Price (number, EUR, optional)
- Current Value (number, EUR, optional)

Features:
- Client-side validation (zod + react-hook-form)
- Submit button (disabled while submitting)
- Success/error toast notifications
- Close dialog on success

Use:
- shadcn/ui Dialog, Form, Input, Select, Button
- react-hook-form + zod
- TypeScript
- Mock API call (console.log for now)

File: components/properties/AddPropertyForm.tsx
```

---

## 4. Property API Route (GET)

```
Create Next.js API route: GET /api/properties

Functionality:
- Fetch all properties for the current user
- Include:
  - Property details
  - Count of tenants per property
  - Sum of monthly rent per property

Use:
- Prisma Client
- TypeScript
- Return JSON: { properties: [...] }
- Handle errors (500 status)

For now: mock the userId (hardcode "user-123")
Later: get from session (NextAuth)

File: app/api/properties/route.ts
```

---

## 5. Property API Route (POST)

```
Create Next.js API route: POST /api/properties

Functionality:
- Create a new property
- Validate request body (address, city, postalCode, type, units)
- Insert into DB via Prisma
- Return created property (201 status)

Use:
- Prisma Client
- Zod for validation
- TypeScript
- Error handling (400/500)

File: app/api/properties/route.ts (add POST handler)
```

---

## 6. Tenant List Component

```
Create a TenantList component for PropMaster.

Display tenants in a shadcn/ui Table:

Columns:
- Name (first + last)
- Property (address)
- Move-in Date (formatted)
- Rent (EUR)
- Status (badge: "Active" / "Expired" based on leaseEnd)
- Actions (dropdown: View, Edit, Delete)

Features:
- Filter by property
- Search by name
- "Add Tenant" button
- Responsive

Use:
- shadcn/ui Table, Badge, Select
- Mock data (5 tenants)
- TypeScript

File: components/tenants/TenantList.tsx
```

---

## 7. Payment Tracking Component

```
Create a PaymentTracker component.

Display monthly rent payments in a calendar-style grid:
- One column per month (last 6 months)
- One row per tenant
- Cell colors:
  - Green: Paid
  - Yellow: Pending
  - Red: Overdue

Features:
- Click cell to mark as paid
- Show total collected per month
- Filter by property

Use:
- Tailwind CSS (grid layout)
- shadcn/ui Badge, Button
- Mock data
- TypeScript

File: components/finances/PaymentTracker.tsx
```

---

## 8. Financial Dashboard Component

```
Create a FinancialDashboard component.

Display:
1. Monthly Revenue Chart (line chart, last 12 months)
2. Expense Breakdown (pie chart: heating, water, repairs, etc.)
3. Profit/Loss per Property (bar chart)

Use:
- Recharts (LineChart, PieChart, BarChart)
- shadcn/ui Card
- Mock financial data
- TypeScript
- Responsive

File: components/finances/FinancialDashboard.tsx
```

---

## 9. Document Upload Component

```
Create a DocumentUpload component.

Features:
- Drag-and-drop file upload
- File type validation (PDF, images only)
- Preview uploaded files
- Categorize (select: Contract / Invoice / Certificate / Other)
- Link to property or tenant (select dropdowns)
- Progress indicator

Use:
- react-dropzone
- shadcn/ui Dialog, Select, Button, Progress
- Mock upload (console.log file)
- TypeScript

File: components/documents/DocumentUpload.tsx
```

---

## 10. Nebenkostenabrechnung Generator (German Tax Document)

```
Create a NebenAbrechnungGenerator component.

Functionality:
- Select tenant
- Select period (year)
- Auto-calculate costs from expenses:
  - Heating (Heizkosten)
  - Water (Wasser/Abwasser)
  - Trash (Müllabfuhr)
  - Insurance (Gebäudeversicherung)
  - Property Tax (Grundsteuer)
  - Maintenance (Hausmeister)

Allocation methods:
- Per unit
- Per square meter
- Per person

Generate PDF (use react-pdf or jsPDF):
- Title: "Nebenkostenabrechnung [Year]"
- Tenant info
- Cost breakdown table
- Totals
- Signature field

Use:
- shadcn/ui Form, Select, Button, Table
- react-pdf or jsPDF
- Mock expense data
- TypeScript

File: components/finances/NebenAbrechnungGenerator.tsx
```

---

## 11. Dashboard Layout (with Sidebar)

```
Create the main dashboard layout for PropMaster.

Layout:
- Left sidebar (fixed, dark theme):
  - Logo + app name
  - Navigation links: Dashboard, Properties, Tenants, Finances, Documents
  - User dropdown (bottom)
- Top bar:
  - Breadcrumbs
  - Search bar
  - Notifications icon
  - User avatar
- Main content area (scrollable)

Use:
- Next.js App Router (app/(dashboard)/layout.tsx)
- shadcn/ui Avatar, DropdownMenu
- Tailwind CSS
- Lucide icons
- TypeScript
- Responsive (mobile: collapsible sidebar)

Return complete layout code.
```

---

## 12. Maintenance Request Form (Tenant App)

```
Create a MaintenanceRequestForm component (for tenant app).

Form fields:
- Category (select: Plumbing, Electrical, HVAC, Appliances, Other)
- Description (textarea, required)
- Priority (radio: Low, Normal, High, Urgent)
- Photo upload (optional, up to 3 images)

Features:
- Submit to API
- Show confirmation message
- Clear form after submit

Use:
- shadcn/ui Form, Select, Textarea, RadioGroup, Button
- react-hook-form + zod
- TypeScript
- Mock API call

File: components/tenant/MaintenanceRequestForm.tsx
```

---

## 13. AI Handwerker Suggestion Engine (Mock)

```
Create a HandwerkerSuggestion component.

Input:
- Maintenance request (category + description)

Output:
- List of 3-5 suggested handwerker with:
  - Name
  - Specialty
  - Rating (stars)
  - Distance (km)
  - Availability (e.g., "Available today")
  - Contact button

AI Logic (mock for now):
- Parse category → suggest relevant specialists
- Use simple keyword matching
- Hardcode 10-15 handwerker profiles

Use:
- shadcn/ui Card, Badge, Button
- Mock AI logic (switch/case on category)
- TypeScript

File: components/maintenance/HandwerkerSuggestion.tsx
```

---

## Usage

1. Copy a prompt
2. Paste into Claude/Cursor/your AI tool
3. Review generated code
4. Save to specified file
5. Test in browser (`npm run dev`)
6. Iterate if needed

**Pro tip:** Combine multiple prompts for related features:
```
"Use prompts #2 (PropertyList) and #3 (AddPropertyForm) to build the complete properties page"
```

---

Need a custom component? Describe it and I'll generate a prompt for you. 🔱
