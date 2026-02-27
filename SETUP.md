# PropMaster Setup Guide

## Step 1: Initialize Next.js Project

```bash
cd /data/.openclaw/workspace/propmaster

# Initialize Next.js (interactive - choose these options):
npx create-next-app@latest . --typescript --tailwind --app --eslint --use-npm

# Options to select:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: No
# - App Router: Yes
# - Import alias: @/* (default)
# - React Compiler: No
```

## Step 2: Install Dependencies

```bash
npm install @prisma/client prisma
npm install -D prisma

# shadcn/ui (beautiful components)
npx shadcn@latest init

# Select:
# - Style: New York
# - Base color: Slate
# - CSS variables: Yes

# Install key components
npx shadcn@latest add button card table input label select
npx shadcn@latest add dialog dropdown-menu badge avatar

# Charts for statistics
npm install recharts

# Auth (later)
npm install next-auth @auth/prisma-adapter

# File upload (later)
npm install @aws-sdk/client-s3
```

## Step 3: Set Up Prisma

```bash
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env (with DATABASE_URL)
```

**Edit `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/propmaster"
```

**Copy the schema from PROJECT.md into `prisma/schema.prisma`**

Then:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Step 4: Project Structure

Create these folders:
```bash
mkdir -p app/\(dashboard\)/{properties,tenants,finances,documents}
mkdir -p app/api/{properties,tenants,payments}
mkdir -p components/{dashboard,properties,tenants}
mkdir -p lib
```

## Step 5: Start Vibe Coding

**Run dev server:**
```bash
npm run dev
# Open http://localhost:3000
```

---

## Vibe Coding Workflow

### Method 1: Claude Desktop / Cursor

1. Open project in Cursor or use Claude with file context
2. Feed it focused prompts from `PROMPTS.md`
3. Let it generate components/APIs
4. Review → Commit

### Method 2: OpenClaw Sub-Agent

Ask me to spawn a coding sub-agent:
```
"Spawn a coding agent to build the PropertyList component"
```

I'll create an isolated session with:
- Full project context
- Clear spec
- File write access
- Code execution for testing

### Method 3: Interactive (You + Me)

Tell me what to build:
```
"Build the dashboard homepage with stat cards"
```

I'll:
1. Generate the code
2. Write it to files
3. Run it locally
4. Debug if needed
5. Iterate based on your feedback

---

## Component Development Pattern

For each feature:

1. **Create the component**
   ```
   components/properties/PropertyCard.tsx
   ```

2. **Wire up API route**
   ```
   app/api/properties/route.ts
   ```

3. **Create the page**
   ```
   app/(dashboard)/properties/page.tsx
   ```

4. **Test locally**
   ```
   npm run dev
   ```

5. **Iterate & polish**

---

## Coding Prompts

I've created `PROMPTS.md` with ready-to-use AI prompts for every component.

Copy-paste them into:
- Claude Desktop
- Cursor
- Or ask me to execute them

---

Ready to code? Run the setup commands above, then tell me what feature to build first! 🔱
