# PropMaster - Deployment & Local Setup Guide

Since you can't access the dev server from your browser (Docker port issue), here are your options:

---

## Option 1: Run Locally (Outside Docker) ✅ RECOMMENDED

**1. Copy the project to your local machine:**
```bash
# From your host machine
scp -r <container>:/data/.openclaw/workspace/propmaster ~/propmaster
# Or use Docker cp
docker cp <container-id>:/data/.openclaw/workspace/propmaster ~/propmaster
```

**2. Install PostgreSQL locally:**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15

# Windows
# Download from postgresql.org
```

**3. Create database:**
```bash
createdb propmaster
```

**4. Update .env:**
```bash
cd ~/propmaster
nano .env
```

Change to:
```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/propmaster"
```

**5. Install & run:**
```bash
npm install
npx prisma migrate dev
npm run dev
```

**6. Open in browser:**
```
http://localhost:3000
```

---

## Option 2: Deploy to Vercel (5 minutes) 🚀

**1. Push to GitHub:**
```bash
cd ~/propmaster
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/propmaster.git
git push -u origin main
```

**2. Create PostgreSQL database:**
- Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com)
- Create free PostgreSQL database
- Copy connection string

**3. Deploy to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repo
- Add environment variable:
  - `DATABASE_URL` = your PostgreSQL connection string
- Click "Deploy"

**4. Run migrations:**
```bash
# In Vercel project settings > Deployments
npx prisma migrate deploy
```

**5. Open your live app:**
```
https://propmaster.vercel.app
```

---

## Option 3: Docker with Port Mapping

**Restart OpenClaw container with port forwarding:**

```bash
docker stop <container-name>

docker run -it --rm \
  -p 3001:3001 \
  -v $(pwd):/data \
  openclaw/openclaw:latest
```

Then access: `http://localhost:3001`

---

## Option 4: Export Static Build

**Generate production build:**
```bash
cd /data/.openclaw/workspace/propmaster
npm run build
npm run start  # Production server
```

---

## Recommended: Vercel Deployment

**Why:**
- Live URL you can access anywhere
- Free PostgreSQL database (Neon/Supabase)
- Automatic SSL (HTTPS)
- Production-ready in 5 minutes
- No Docker/port issues

**Steps:**
1. Push code to GitHub
2. Connect Vercel to your repo
3. Add Neon/Supabase PostgreSQL URL
4. Deploy

**I can guide you through this if you want!**

---

## What You'll See When It Works

**Dashboard:**
- 4 stat cards (properties, occupancy, revenue, tasks)
- Recent activity feed
- Quick action buttons

**Properties Page:**
- Property cards with search
- Add property form
- Click card → full property details

**Tenants Page:**
- Tenant cards with search & filter
- Active/Expired lease badges
- Add tenant form

**Property Details:**
- Full stats
- Active tenants list
- Recent expenses
- Edit/Delete buttons

**Add Features:**
- Modal forms
- Validation
- Real-time database updates

---

## Need Help?

Tell me which option you want to try:
- **Option 1:** Local setup (I'll generate a setup script)
- **Option 2:** Vercel deployment (I'll walk you through it)
- **Option 3:** Docker port mapping (you'll need to restart container)

Or I can continue building features and you access it later.

Let me know! 🔱
