# 🚀 Quick Deployment Guide (15 Minutes)

Follow these steps to get your site live FAST:

## 1. Firebase Setup (5 min)

1. Go to https://console.firebase.google.com
2. Create project: `fulltime-football`
3. Enable **Authentication** → **Google Sign-In**
4. Enable **Firestore Database** (Production mode)
5. Copy Firebase config (⚙️ → Project Settings → Your apps → Web)
6. Update your `.env` file with Firebase values

## 2. Push to GitHub (2 min)

```bash
git init
git add .
git commit -m "Ready for deployment"
# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/fulltime.git
git push -u origin main
```

## 3. Deploy to Vercel (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your `fulltime` repository
4. Add environment variables (copy from your `.env` file)
5. Click **Deploy**

## 4. Configure Domain (3 min)

**Option A: Use free Vercel subdomain** (instant)
- Your site is live at: `fulltime-xxxxx.vercel.app`

**Option B: Add custom domain** (if you bought one)
1. Vercel Dashboard → Domains → Add Domain
2. Add DNS records at your registrar:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
3. Wait 15-60 min for DNS propagation

## 5. Test Everything (2 min)

- [ ] Visit your live URL
- [ ] Sign in with Google
- [ ] Create a playlist
- [ ] Write a review

## ✅ You're Live!

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
