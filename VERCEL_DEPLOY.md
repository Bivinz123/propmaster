# 🚀 PropMaster - Vercel Deployment Guide

Get your app live in 5 minutes with a free PostgreSQL database!

---

## Step 1: Create PostgreSQL Database (2 minutes)

### Option A: Neon.tech (Recommended)

1. Go to **https://neon.tech**
2. Sign up with GitHub
3. Click **"New Project"**
4. Name: `propmaster`
5. Region: Choose closest to you
6. Click **"Create Project"**
7. Copy the **Connection String** (looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase

1. Go to **https://supabase.com**
2. Sign up with GitHub
3. Click **"New Project"**
4. Name: `propmaster`
5. Database password: [create strong password]
6. Region: Choose closest to you
7. Click **"Create Project"** (wait 2 minutes)
8. Go to **Settings → Database**
9. Copy **Connection string (Pooler)** under "Connection string"

**Save this connection string - you'll need it!**

---

## Step 2: Push to GitHub (1 minute)

**From your local machine (not Docker):**

```bash
# Copy project from Docker container
docker cp <container-id>:/data/.openclaw/workspace/propmaster ~/propmaster

# Or use your preferred method to get the files

# Initialize git
cd ~/propmaster
git init
git add .
git commit -m "Initial commit: PropMaster v1.0"

# Create GitHub repo (do this on github.com)
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/propmaster.git
git branch -M main
git push -u origin main
```

**Or use GitHub Desktop:**
1. Open GitHub Desktop
2. File → Add Local Repository → Select `propmaster` folder
3. Publish repository to GitHub

---

## Step 3: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com**
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Select your `propmaster` repository
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)

6. **Environment Variables** - Click "Add":
   - **Key:** `DATABASE_URL`
   - **Value:** [Paste your Neon/Supabase connection string]

7. Click **"Deploy"**

**Wait 2-3 minutes... ☕**

---

## Step 4: Run Database Migrations

**After first deployment completes:**

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Verify `DATABASE_URL` is set
4. Go to **"Deployments"** tab
5. Click **"..."** next to latest deployment → **"Redeploy"**
6. Check "Use existing Build Cache"
7. Click **"Redeploy"**

**Alternative (via Vercel CLI):**
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Step 5: Access Your App! 🎉

Your app will be live at:
```
https://propmaster-xxx-your-username.vercel.app
```

**Test it:**
1. Go to `/dashboard`
2. Click "Properties" → "Add Property"
3. Fill form and submit
4. See it appear in the list!

---

## Troubleshooting

### Build fails with "Cannot find module '@prisma/client'"
**Fix:** Add this to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
(Already added in the file I updated)

### Database connection fails
**Fix:** Make sure your connection string includes `?sslmode=require` at the end

### Prisma migrations not applied
**Run migrations manually:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

---

## Next Steps

**Custom Domain (Optional):**
1. Vercel dashboard → Your project → Settings → Domains
2. Add your domain (e.g., `propmaster.com`)
3. Update DNS settings (Vercel gives you instructions)

**Invite Users:**
- Share your Vercel URL with others
- They can access the app immediately

**Monitor:**
- Vercel dashboard shows deployment logs
- Check database usage in Neon/Supabase

---

## Cost

- **Vercel:** Free tier (100GB bandwidth, unlimited deploys)
- **Neon:** Free tier (0.5GB storage, 10GB transfer/month)
- **Supabase:** Free tier (500MB database, 2GB bandwidth)

**Total: $0/month for development & testing**

**Production scale:**
- Vercel Pro: $20/month (more bandwidth)
- Neon Pro: $19/month (more storage)

---

## Need Help?

**I can help with:**
- GitHub push issues
- Vercel configuration
- Database connection problems
- Environment variable setup
- Custom domain setup

Just ask! 🔱
