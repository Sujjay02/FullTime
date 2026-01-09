# FullTime ⚽

A modern football match discovery platform powered by AI. Get real-time match updates, AI-powered watchability scores, and personalized recommendations to never miss a legendary match again.

## ✨ Features

- **Live Match Updates**: Auto-refreshing live match data every 30 seconds
- **AI-Powered Watchability Scores**: Google Gemini AI analyzes matches and provides entertainment ratings
- **Real-time Lineups**: View confirmed lineups, formations, and player stats
- **Match Timelines**: Chronological event tracking for goals, cards, and substitutions
- **League Rankings**: Compare league entertainment value with the Watchability Index
- **User Reviews**: Rate and review matches, share your tactical analysis
- **Custom Playlists**: Create and manage watch lists for must-see matches
- **Google Authentication**: Sign in securely with your Google account
- **Offline Mode**: Works without Firebase in mock mode for development

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Google Gemini API key (get one [here](https://aistudio.google.com/apikey))
- (Optional) Firebase project for authentication and database

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FullTime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys to `.env`**
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key

   # Optional - Firebase config (app works in mock mode without it)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Getting Your API Keys

### Google Gemini API Key (Required)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a Web App to your project
4. Copy the configuration values
5. Add them to your `.env` file

**Note**: The app works in mock mode without Firebase. You'll see a local developer user and can test all features offline.

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Code splitting and lazy loading
- Tree shaking for smaller bundles
- Minified assets with esbuild
- Optimized vendor chunks (React, Firebase, Lucide icons)

## 🌐 Deploy to Production

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `GEMINI_API_KEY` and Firebase vars (if using)
   - Redeploy

**Or use the Vercel GitHub integration:**
- Push your code to GitHub
- Import the repo in [Vercel Dashboard](https://vercel.com)
- Configure environment variables
- Deploy automatically on every push

### Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard

**Or use Netlify's drag-and-drop:**
- Run `npm run build` locally
- Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
- Configure environment variables in site settings

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Configure `firebase.json`:
   - Public directory: `dist`
   - Single-page app: Yes
   - Automatic builds: No

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (configured via PostCSS)
- **Icons**: Lucide React
- **AI**: Google Gemini 3 Flash API
- **Authentication**: Firebase Auth (with mock mode fallback)
- **Database**: Firestore (with in-memory fallback)
- **Deployment**: Vercel / Netlify / Firebase Hosting

## 📁 Project Structure

```
FullTime/
├── components/          # React components
│   ├── Header.tsx       # Navigation and search
│   ├── MatchCard.tsx    # Match display card
│   ├── EntityProfile.tsx # Match details with lineups
│   ├── LeagueDashboard.tsx # League rankings
│   └── ...
├── services/
│   ├── footballService.ts # Gemini AI integration
│   ├── firebase.ts       # Firebase/mock auth
│   └── cacheService.ts   # LRU cache with TTL
├── utils/
│   └── scoreUtils.ts     # Watchability score utilities
├── types.ts              # TypeScript interfaces
├── constants.ts          # Fallback match data
├── App.tsx               # Main application
├── vite.config.ts        # Build configuration
└── .env.example          # Environment template
```

## 🎨 Features Deep Dive

### AI-Powered Match Analysis
Uses Google Gemini with web search to fetch:
- Live match scores and status
- Complete lineups with formations
- Player season statistics (goals, assists)
- Match events timeline
- Watchability scoring algorithm

### Smart Caching
- LRU (Least Recently Used) eviction strategy
- TTL (Time To Live) for different data types:
  - Live matches: 5 minutes
  - Reviews: 5 minutes
  - Playlists: 10 minutes
  - Exciting matches: 1 hour
- Prevents redundant API calls

### Performance Optimizations
- React.memo on all components
- useCallback for event handlers
- Lazy loading for large components
- Code splitting with manual chunks
- Asset caching with long-lived headers

## 🔒 Security Notes

- **Never commit your `.env` file** - it's in .gitignore
- API keys should be stored as environment variables on your hosting platform
- Firebase security rules should be configured for production
- The Gemini API key is exposed in the frontend bundle (client-side API)
  - Consider rate limiting on Google Cloud Console
  - Monitor usage to prevent abuse

## 🐛 Troubleshooting

### Lineups not loading?
Check browser console for API response. The Gemini AI may not always return complete lineup data for all matches. Debug logs show player counts.

### Firebase errors?
The app works in mock mode without Firebase. Check console for "⚠️ No valid Firebase config found" - this is expected if you haven't configured it.

### Build errors?
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version is 16+

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ⚽ and ⚡ by the FullTime team**
