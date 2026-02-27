# 🚀 PropMaster - Easiest Deployment Method

**Skip the Docker copy headache - deploy directly from here!**

---

## Option 1: GitHub CLI (Fastest) ⚡

**Install GitHub CLI:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Login & Deploy:**
```bash
cd /data/.openclaw/workspace/propmaster
gh auth login
gh repo create propmaster --public --source=. --remote=origin --push
```

**Done!** Repo is on GitHub. Now deploy to Vercel (see below).

---

## Option 2: Direct Upload to GitHub.com 📤

**1. Download the tarball to your local machine:**

From your local terminal (not SSH):
```bash
scp root@fra.hostingervps.com:/data/.openclaw/workspace/propmaster.tar.gz ~/propmaster.tar.gz
tar -xzf ~/propmaster.tar.gz
cd ~/propmaster
```

**2. Push to GitHub:**
```bash
# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/propmaster.git
git push -u origin main
```

---

## Option 3: Use GitHub Desktop 🖱️

**1. Get files via SCP/SFTP:**
- Connect to `fra.hostingervps.com`
- Navigate to `/data/.openclaw/workspace/`
- Download `propmaster` folder

**2. Open in GitHub Desktop:**
- File → Add Local Repository
- Select propmaster folder
- Publish to GitHub

---

## After GitHub: Deploy to Vercel

**1. Create database at https://neon.tech**
   - New project: "propmaster"
   - Copy connection string

**2. Deploy at https://vercel.com**
   - Import GitHub repo
   - Add env var: `DATABASE_URL` = [your Neon string]
   - Deploy

**3. Your app goes live!**
   - URL: `https://propmaster-xxx.vercel.app`
   - Access `/dashboard` to start

---

## Need Credentials?

**For GitHub CLI:**
```bash
gh auth login
# Follow prompts, use browser or token
```

**For git push:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git push -u origin main
# Enter GitHub username + Personal Access Token
```

**Create GitHub token:**
- github.com → Settings → Developer settings
- Personal access tokens → Generate new token
- Scopes: `repo` (full control)
- Copy token and use as password

---

## Which is easiest for you?

- **Option 1** if you're comfortable with CLI
- **Option 2** if you want full control
- **Option 3** if you prefer GUI

All roads lead to Vercel! 🔱
