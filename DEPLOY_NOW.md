# 🚀 Ready to Deploy - Next Steps

Your Firebase is configured! Here's what to do next:

## ✅ What's Done
- [x] Firebase project created (`fulltime-football`)
- [x] Firebase config added to `.env`
- [x] SEO meta tags added
- [x] Deployment configs ready (Vercel, Netlify)
- [x] Security rules prepared

---

## 📋 Before You Deploy - Firebase Setup

### 1. Enable Authentication (5 min)

1. Go to: https://console.firebase.google.com/project/fulltime-football/authentication
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Google"** → Enable → Save

### 2. Create Firestore Database (5 min)

1. Go to: https://console.firebase.google.com/project/fulltime-football/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: `us-central1` (or closest to you)
5. Click **"Enable"**

### 3. Set Security Rules (2 min)

1. In Firestore, click **"Rules"** tab
2. Paste this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /playlists/{playlistId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **"Publish"**

---

## 🚀 Deploy to Vercel (10 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - FullTime football app"

# Create new repo on GitHub.com (name it: fulltime)
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/fulltime.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to: https://vercel.com/signup
2. Sign up with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Find and **Import** your `fulltime` repository
5. Configure project:
   - Framework: **Vite** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

```
GEMINI_API_KEY = AIzaSyDXfHMKxqFaVxzUn9vWtIz07kXynS_QHyw
REACT_APP_FIREBASE_API_KEY = AIzaSyCz5-khp8p45VXry13706tdpgq2N92cchg
REACT_APP_FIREBASE_AUTH_DOMAIN = fulltime-football.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = fulltime-football
REACT_APP_FIREBASE_STORAGE_BUCKET = fulltime-football.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 496305068606
REACT_APP_FIREBASE_APP_ID = 1:496305068606:web:340bb3a4fcd9ce67254f6f
```

### Step 4: Deploy!

Click **"Deploy"**

Wait 2-3 minutes...

🎉 **Your site is LIVE!**

URL: `https://fulltime-xxxxx.vercel.app`

---

## ✅ Post-Deployment: Add Vercel Domain to Firebase

1. Copy your Vercel URL (e.g., `fulltime-abc123.vercel.app`)
2. Go to: https://console.firebase.google.com/project/fulltime-football/authentication/settings
3. Scroll to **"Authorized domains"**
4. Click **"Add domain"**
5. Paste your Vercel URL (without https://)
6. Click **"Add"**

---

## 🌐 Optional: Add Custom Domain (Later)

### If you buy a domain (e.g., fulltime.football):

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Update DNS at your registrar:
   - A Record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
4. Add domain to Firebase authorized domains
5. Wait 15-60 min for DNS propagation

---

## 🧪 Test Your Live Site

Visit your Vercel URL and test:

- [ ] Homepage loads with hero section
- [ ] Live matches appear
- [ ] Click "Sign Up with Google" (should work!)
- [ ] Sign in successfully
- [ ] Create a playlist
- [ ] Add a match to playlist
- [ ] Write a review
- [ ] Search works

---

## 🎉 You're Live!

Your website is now published and users can:
- Sign in with Google
- Create playlists
- Write reviews
- Browse live matches

**Share it with friends and get feedback!**

---

## 🆘 Troubleshooting

### "Firebase not connected" in console
- Check all env vars are added to Vercel
- Redeploy after adding vars

### Google Sign-In fails
- Add Vercel domain to Firebase authorized domains (see above)
- Check browser console for specific error

### Build fails
- Check Vercel build logs
- Ensure Node.js version is 18+ in Vercel settings

---

## 📞 Support

- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Start**: See [QUICK_START.md](QUICK_START.md)
- **Documentation**: See [README.md](README.md)

Good luck! 🚀⚽
