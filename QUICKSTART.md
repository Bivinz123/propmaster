# PropMaster - Vibe Coding Quick Start 🔱

## What You Have

✅ **PROJECT.md** - Full spec, database schema, roadmap
✅ **SETUP.md** - Step-by-step initialization guide  
✅ **PROMPTS.md** - Ready-to-use AI prompts for every component
✅ **This guide** - How to start vibe coding

---

## 3 Ways to Vibe Code

### Option 1: Let Me Build It (Fastest)

Just tell me what feature to build:

```
"Build the dashboard homepage with stat cards"
"Create the property list page"
"Add the tenant management UI"
```

I'll:
- Generate the code
- Write it to files
- Test it locally
- Show you the result
- Iterate based on feedback

**Perfect for:** Getting stuff done fast, exploring ideas

---

### Option 2: Claude Desktop / Cursor (Most Control)

1. **Open project in your IDE** (Cursor recommended)
2. **Copy prompts from PROMPTS.md**
3. **Feed them to your AI coding assistant**
4. **Review → Commit → Repeat**

**Perfect for:** You want to see and control every change

---

### Option 3: Spawn Sub-Agent (Fire & Forget)

Tell me to spawn a dedicated coding agent:

```
"Spawn an agent to build the entire property management module"
```

It will:
- Work in isolation
- Build multiple components
- Run tests
- Report back when done

**Perfect for:** Large features, parallel work

---

## Getting Started (Right Now)

### Step 1: Initialize Project (5 min)

```bash
cd /data/.openclaw/workspace/propmaster

# Initialize Next.js
npx create-next-app@latest . --typescript --tailwind --app --eslint --use-npm

# Install dependencies
npm install @prisma/client prisma recharts
npm install -D prisma

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card table input label select dialog dropdown-menu badge avatar

# Prisma setup
npx prisma init
```

**Edit `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/propmaster"
```

**Copy Prisma schema from PROJECT.md → `prisma/schema.prisma`**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Step 2: Start Dev Server

```bash
npm run dev
# Open http://localhost:3000
```

---

### Step 3: Build Your First Feature

Pick one:

**A) Dashboard (Recommended Start)**
```
"Build the dashboard homepage - 4 stat cards + recent activity"
```

**B) Property Management**
```
"Create the property list page with search and add button"
```

**C) Layout First**
```
"Build the dashboard layout with sidebar navigation"
```

Tell me which one, and I'll generate it instantly.

---

## Development Loop

1. **Pick a feature** (from PROJECT.md roadmap or PROMPTS.md)
2. **Generate code** (via me, Claude, or Cursor)
3. **Test in browser** (`npm run dev`)
4. **Iterate** (tweak, refine, polish)
5. **Commit** (`git commit`)
6. **Next feature** → Repeat

---

## Recommended Build Order

### Week 1: Foundation
1. ✅ Project setup (you'll do this now)
2. Dashboard layout with sidebar
3. Dashboard homepage (stat cards)
4. Basic auth (NextAuth - later)

### Week 2: Properties
1. Property list page
2. Add property form
3. Property detail page
4. Edit/delete functionality
5. Property API routes

### Week 3: Tenants
1. Tenant list page
2. Add tenant form
3. Tenant detail page
4. Link tenants to properties

### Week 4: Finances
1. Payment tracking table
2. Expense management
3. Financial dashboard (charts)
4. Nebenkostenabrechnung generator

---

## Tips for Vibe Coding

1. **Start with UI** - Build components with mock data first
2. **Wire up APIs later** - Get the feel right before connecting real DB
3. **Iterate fast** - Don't over-think, just build and refine
4. **Use the prompts** - They're optimized for speed and quality
5. **Commit often** - Small commits = easy rollback
6. **Have fun** - This is supposed to feel effortless

---

## What Now?

Two options:

### A) I'll Build the First Feature
Tell me:
```
"Build the dashboard layout"
```

Or:
```
"Build the property list page"
```

I'll generate it, write it to files, and we'll test it together.

---

### B) You Initialize & I'll Guide
Run the setup commands from SETUP.md, then tell me when you're ready. I'll walk you through building feature by feature.

---

## Questions?

- "Show me the database schema"
- "What should I build first?"
- "Generate the dashboard component"
- "How do I add authentication?"
- "Build the tenant management page"

Just ask. Let's build this. 🔱
