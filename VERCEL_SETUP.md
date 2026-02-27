# ⚠️ WICHTIG: Vercel Environment Variables Setup

## Problem
Vercel-Deployment schlägt fehl, weil `DATABASE_URL` fehlt!

## Lösung: DATABASE_URL auf Vercel hinzufügen

### **Schritt 1: Vercel Dashboard öffnen**
https://vercel.com/daviddordic-3083s-projects/propmaster

### **Schritt 2: Settings → Environment Variables**
1. Klicke oben auf "Settings"
2. Klicke links auf "Environment Variables"

### **Schritt 3: Variable hinzufügen**

**Key:**
```
DATABASE_URL
```

**Value:**
```
postgresql://neondb_owner:npg_zfXALCVF5R9d@ep-bitter-block-alyzq7mx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Environment:** 
- ✅ Production
- ✅ Preview
- ✅ Development

### **Schritt 4: Speichern & Redeploy**
1. Klicke "Save"
2. Gehe zu "Deployments"
3. Wähle das letzte (failed) Deployment
4. Klicke "Redeploy"

---

## Alternative: Automatischer Neon Integration

Vercel kann auch direkt mit Neon.tech integriert werden:

1. Gehe zu: https://vercel.com/daviddordic-3083s-projects/propmaster/settings/integrations
2. Suche nach "Neon"
3. Klicke "Add Integration"
4. Verbinde mit deinem Neon.tech Account
5. Wähle die Datenbank aus
6. DATABASE_URL wird automatisch hinzugefügt

---

## Nach dem Setup

**Deployment wird funktionieren:**
- ✅ `prisma generate` läuft
- ✅ `prisma db push` pusht Schema auf Neon
- ✅ `next build` baut die App
- ✅ App ist live!

**Dann kannst du testen:**
- Properties mit Gesamtwohnfläche erstellen
- Mieter mit Wohnfläche & Personenzahl anlegen
- Nebenkostenabrechnungen erstellen
- PDFs generieren

---

**Status nach Setup:** ✅ PRODUCTION-READY
