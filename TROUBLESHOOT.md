# 🔍 Black Screen Troubleshooting

Your site is deployed but showing a black screen. Here's how to fix it:

## Step 1: Check Browser Console (RIGHT NOW!)

1. Open https://fulltime-football.web.app in your browser
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab
4. Look for RED error messages

### Common Errors You Might See:

#### Error: "Firebase: Error (auth/api-key-not-valid-please-pass-a-valid-api-key)"
**Fix**: You haven't enabled Firebase Authentication yet
→ Go to: https://console.firebase.google.com/project/fulltime-football/authentication
→ Click "Get started"
→ Enable Google Sign-In

#### Error: "Firestore: PERMISSION_DENIED" or "Missing or insufficient permissions"
**Fix**: You haven't created Firestore database yet
→ Go to: https://console.firebase.google.com/project/fulltime-football/firestore
→ Click "Create database"
→ Select "Production mode"

#### Error: Network errors or CORS issues
**Fix**: Wait 5-10 minutes after deployment for CDN to update

---

## Step 2: Enable Firebase Features

### 2a. Enable Authentication (REQUIRED!)

1. Go to: https://console.firebase.google.com/project/fulltime-football/authentication
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Google"**
5. Toggle to **Enable**
6. Click **Save**

### 2b. Create Firestore Database (REQUIRED!)

1. Go to: https://console.firebase.google.com/project/fulltime-football/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose region: **us-central1** (or closest to you)
5. Click **"Enable"**
6. Wait 30 seconds for it to initialize

### 2c. Add Firestore Security Rules

1. In Firestore, click **"Rules"** tab
2. Replace everything with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    match /playlists/{playlistId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 3: Clear Cache and Test

After enabling Auth and Firestore:

1. Hard refresh your browser:
   - **Chrome/Edge**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - **Firefox**: Ctrl+F5
   - **Safari**: Cmd+Option+R

2. Visit: https://fulltime-football.web.app

3. You should see the app load!

---

## Step 4: Still Not Working?

### Check these:

1. **Wait 2-5 minutes** after enabling Auth/Firestore
   - Firebase takes time to propagate changes

2. **Check browser console** (F12 → Console tab)
   - Look for specific error messages
   - Share the error with me

3. **Try incognito/private mode**
   - This bypasses cache issues

4. **Verify Firebase project**
   - Go to: https://console.firebase.google.com/project/fulltime-football/overview
   - Make sure you see "Authentication" and "Firestore Database" in the left menu
   - Both should show as enabled (green checkmark)

---

## Quick Checklist

- [ ] Opened browser console (F12)
- [ ] Enabled Firebase Authentication
- [ ] Created Firestore Database
- [ ] Added Firestore security rules
- [ ] Waited 2-5 minutes
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked for error messages in console

---

## What Error Messages Mean

### "Cannot read properties of undefined"
→ Firebase not initialized properly. Enable Auth + Firestore.

### "auth/api-key-not-valid"
→ Authentication not enabled. Follow Step 2a above.

### "PERMISSION_DENIED"
→ Firestore not created or rules not set. Follow Step 2b and 2c.

### Page stays blank, no errors
→ JavaScript not loading. Clear cache and hard refresh.

---

## Still Having Issues?

Share this info:
1. Screenshot of browser console (F12)
2. Screenshot of Firebase Console showing Authentication status
3. Screenshot of Firebase Console showing Firestore status

I'll help you fix it!
