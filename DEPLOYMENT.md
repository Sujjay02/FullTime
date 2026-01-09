# 🚀 FullTime Deployment Guide

Complete step-by-step guide to publish your website with a custom domain and enable user interaction.

---

## ✅ Pre-Deployment Checklist

- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Google Authentication enabled
- [ ] Firebase config added to `.env`
- [ ] Domain name purchased (or using free subdomain)
- [ ] GitHub repository created
- [ ] Environment variables ready

---

## Step 1: Firebase Setup (30 minutes)

### 1.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Project name: `fulltime-football` (or your choice)
4. Disable Google Analytics (optional)
5. Click **Create project**

### 1.2 Enable Google Authentication

1. Click **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** provider
4. Project public-facing name: `FullTime`
5. Project support email: your-email@gmail.com
6. Click **Save**

### 1.3 Create Firestore Database

1. Click **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Select region: `us-central1` (or closest to your users)
4. Click **Enable**

### 1.4 Configure Security Rules

Click **Rules** tab, paste this, and click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Playlists
    match /playlists/{playlistId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 1.5 Get Firebase Configuration

1. Click ⚙️ gear icon → **Project settings**
2. Scroll to **Your apps** section
3. Click web icon `</>`
4. App nickname: `FullTime Web`
5. Click **Register app**
6. Copy the `firebaseConfig` object

### 1.6 Update Environment Variables

Open `.env` and add your Firebase config:

```bash
GEMINI_API_KEY=AIzaSyDXfHMKxqFaVxzUn9vWtIz07kXynS_QHyw

# Firebase Configuration (from step 1.5)
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=fulltime-football.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fulltime-football
REACT_APP_FIREBASE_STORAGE_BUCKET=fulltime-football.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 1.7 Test Firebase Connection

```bash
npm run dev
```

Check browser console. You should see:
```
✅ Firebase connected successfully.
```

NOT:
```
⚠️ No valid Firebase config found. Running in Offline Mock Mode.
```

---

## Step 2: Get a Domain (10 minutes)

### Option A: Buy a Custom Domain (Recommended)

**Popular Registrars:**
- [Namecheap](https://namecheap.com) - ~$10/year
- [Google Domains](https://domains.google.com) - ~$12/year
- [Cloudflare](https://cloudflare.com) - ~$10/year
- [Porkbun](https://porkbun.com) - ~$8/year

**Domain Suggestions:**
- `fulltime.football`
- `fulltime-app.com`
- `watchfulltime.com`
- `yourlastname-fulltime.com`

### Option B: Use Free Subdomain

Vercel/Netlify provide free subdomains:
- `fulltime-xxxxx.vercel.app`
- `fulltime.netlify.app`

You can always add a custom domain later!

---

## Step 3: Push Code to GitHub (5 minutes)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FullTime app ready for production"

# Create new repository on GitHub.com
# Name it: fulltime
# Make it public or private (your choice)

# Link and push
git remote add origin https://github.com/YOUR_USERNAME/fulltime.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel (15 minutes)

### 4.1 Sign Up and Import

1. Go to https://vercel.com
2. Click **Sign Up** → Continue with GitHub
3. Click **Add New...** → **Project**
4. Click **Import** next to your `fulltime` repo

### 4.2 Configure Project

**Framework Preset:** Vite (auto-detected)
**Root Directory:** `./`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 4.3 Add Environment Variables

Click **Environment Variables** and add ALL of these:

| Key | Value | Environment |
|-----|-------|-------------|
| `GEMINI_API_KEY` | `AIzaSyDXfHMK...` | Production |
| `REACT_APP_FIREBASE_API_KEY` | Your Firebase API Key | Production |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Production |
| `REACT_APP_FIREBASE_PROJECT_ID` | `your-project-id` | Production |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Production |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Production |
| `REACT_APP_FIREBASE_APP_ID` | `1:123:web:abc` | Production |

Click **Deploy**

### 4.4 Wait for Deployment

First deployment takes 1-2 minutes. You'll see:
```
✅ Deployment Complete
```

Your site is now live at: `https://fulltime-xxxxx.vercel.app`

### 4.5 Test Your Live Site

1. Open the Vercel URL
2. Try signing in with Google
3. Create a playlist
4. Write a review
5. Check that everything works!

---

## Step 5: Add Custom Domain (10 minutes)

### 5.1 Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Enter your domain: `fulltime.football`
4. Click **Add**

Vercel will show you which DNS records to add.

### 5.2 Configure DNS at Your Registrar

**For Apex Domain (fulltime.football):**

Go to your domain registrar's DNS settings and add:

```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or automatic)
```

**For WWW Subdomain:**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or automatic)
```

### 5.3 Wait for DNS Propagation

DNS changes take **5-60 minutes** to propagate worldwide.

Check status at: https://dnschecker.org

### 5.4 Enable HTTPS

Vercel automatically provisions SSL certificates. After DNS propagates:
1. Go to project **Settings** → **Domains**
2. Wait for ✅ checkmark next to your domain
3. Your site is now accessible at `https://fulltime.football`

---

## Step 6: Configure Firebase for Production Domain

### 6.1 Add Authorized Domains

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add your custom domain: `fulltime.football`
5. Also add: `www.fulltime.football`
6. Click **Add**

### 6.2 Update Google OAuth Settings

1. **Authentication** → **Sign-in method** → **Google**
2. Click **Edit** (pencil icon)
3. Under **Authorized domains**, verify your domains are listed
4. Click **Save**

---

## Step 7: Secure Your API Keys

### 7.1 Restrict Gemini API Key

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your Gemini API key
3. Click **Edit API key**
4. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add:
     - `https://fulltime.football/*`
     - `https://www.fulltime.football/*`
     - `https://*.vercel.app/*` (for preview deployments)
5. Click **Save**

### 7.2 Monitor API Usage

Set up billing alerts in Google Cloud Console:
1. Go to **Billing** → **Budgets & alerts**
2. Create alert for monthly spend > $10

---

## Step 8: Post-Launch Checklist

### Functionality Tests

- [ ] Homepage loads with hero section
- [ ] Live matches display
- [ ] Auto-refresh works (check console every 30s)
- [ ] Click match to see lineup details
- [ ] Google Sign-In works
- [ ] Create playlist works
- [ ] Add match to playlist works
- [ ] Write review works
- [ ] Search functionality works
- [ ] League dashboard loads

### Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Safari (Mac/iOS)
- [ ] Firefox
- [ ] Mobile browsers

### Performance Tests

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s

Run Lighthouse:
```bash
# Chrome DevTools > Lighthouse tab
# Or use CLI:
npm install -g lighthouse
lighthouse https://fulltime.football
```

---

## Step 9: Analytics & Monitoring (Optional)

### Option A: Vercel Analytics (Free)

1. Project → **Analytics** tab
2. Enable **Vercel Analytics**
3. Track page views, performance, and Web Vitals

### Option B: Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Option C: Firebase Analytics

1. Firebase Console → **Analytics** → **Enable**
2. Add Firebase Analytics SDK (already included)

---

## Step 10: Share Your Website!

### Update Social Media Meta Tags

Edit `index.html` and replace:
- `https://yourdomain.com/` → `https://fulltime.football/`
- Create social media preview image (1200x630px)

### Announcement Ideas

- Share on Twitter/X with #football #AI hashtag
- Post on Reddit: r/webdev, r/soccer
- Share on LinkedIn
- Tell friends and family!

### Create a Landing Page Screenshot

Use https://www.screely.com to create beautiful browser mockups

---

## 🎉 Congratulations!

Your website is now **LIVE** and ready for users!

## 📊 Monitoring URLs

- **Live Site:** https://fulltime.football
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com
- **Google Cloud Console:** https://console.cloud.google.com

---

## 🆘 Troubleshooting

### "Firebase not configured" error
- Check all Firebase env vars are added to Vercel
- Redeploy after adding env vars

### Google Sign-In fails
- Verify domain is added to Firebase Authorized domains
- Check browser console for specific error

### Domain not working
- Wait 30-60 minutes for DNS propagation
- Check DNS at https://dnschecker.org
- Verify A record points to 76.76.21.21

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

---

## 🚀 Next Steps

- [ ] Set up custom email (your-name@fulltime.football)
- [ ] Add sitemap.xml for SEO
- [ ] Submit to Google Search Console
- [ ] Create social media accounts
- [ ] Set up monitoring/error tracking (Sentry)
- [ ] Plan feature roadmap

---

**Need help? Check the [README.md](README.md) or open an issue on GitHub.**
