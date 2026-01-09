# API Setup Guide for FullTime Football App

This app uses a **hybrid approach** combining real football data with AI analysis for maximum accuracy.

## Required API Keys

### 1. Google Gemini API (Required - Already Set Up)
**Purpose**: AI-powered analysis, watchability scoring, player recommendations

**Status**: ✅ Already configured
- Used for intelligent match analysis
- Calculates watchability scores
- Generates player insights

### 2. Football-Data.org API (Optional - Recommended)
**Purpose**: Real, verified football match data

**Free Tier**: 10 requests/minute, covers major European leagues
- ✅ Premier League
- ✅ La Liga
- ✅ Bundesliga
- ✅ Serie A
- ✅ Ligue 1
- ✅ Champions League

**Setup Steps**:

1. **Register for free**:
   - Go to: https://www.football-data.org/client/register
   - Fill in your details
   - Confirm email

2. **Get your API key**:
   - Login at: https://www.football-data.org/client/login
   - Copy your API token from the dashboard

3. **Add to environment**:
   ```bash
   # In your .env file or Vite environment config
   FOOTBALL_DATA_API_KEY=your_api_key_here
   ```

4. **For Vite (current setup)**:
   ```bash
   # Create .env file in project root
   echo "VITE_FOOTBALL_DATA_API_KEY=your_key_here" >> .env
   ```

5. **Update the code** (already done in footballDataApi.ts):
   ```typescript
   const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY || '';
   ```

## How It Works

### Current Mode: AI-Only
- ✅ Working now with just Gemini API
- Uses Google Search tool to find real match data
- AI analyzes and formats the data
- Good accuracy, but limited by AI search

### Hybrid Mode (Recommended)
1. **Football Data API** fetches real, verified match data:
   - Exact scores
   - Real team names
   - Accurate times and statuses

2. **Gemini AI** enriches the data:
   - Calculates watchability scores
   - Analyzes match importance
   - Generates insights and recommendations

### Benefits of Hybrid Approach:
- 🎯 **More Accurate**: Real data from official sources
- ⚡ **Faster**: Less AI processing needed
- 💰 **Cost Effective**: Free Football API + efficient AI usage
- 📊 **Reliable**: Verified scores and lineups

## Alternative Free APIs

If Football-Data.org doesn't work for you:

### API-Football (RapidAPI)
- **Free tier**: 100 requests/day
- **Coverage**: Worldwide leagues
- **Signup**: https://rapidapi.com/api-sports/api/api-football

### TheSportsDB
- **Free tier**: Unlimited (with delays)
- **Coverage**: Basic match data
- **Signup**: https://www.thesportsdb.com/api.php

## Environment Variables Reference

```bash
# .env file
VITE_API_KEY=your_gemini_api_key          # Required - AI
VITE_FOOTBALL_DATA_API_KEY=your_fd_key    # Optional - Real data
```

## Testing the Setup

1. **AI-Only (current)**:
   - Just works with Gemini API
   - Matches are found via Google Search

2. **With Football API**:
   ```bash
   # Check if API is working
   npm run dev
   # Look for console messages:
   # "✅ Fetched X matches from Football Data API"
   ```

## Switching Between Modes

The app automatically uses the best available method:

1. If `FOOTBALL_DATA_API_KEY` is set → Hybrid mode
2. If only `API_KEY` (Gemini) is set → AI-only mode
3. If neither → Uses fallback static data

## Rate Limits

### Football-Data.org Free Tier:
- 10 requests/minute
- 10 requests/day (for some endpoints)
- Sufficient for: ~30 daily users

### Optimization:
- Aggressive caching (30 min for live data)
- Batch requests where possible
- Smart refresh only when needed

## Troubleshooting

### "No API data, falling back to AI"
→ Check FOOTBALL_DATA_API_KEY is set correctly

### "API Error: 429"
→ Rate limit exceeded, caching will help

### "API Error: 403"
→ Invalid API key or domain restriction

### Matches seem incorrect
→ Clear cache: `localStorage.clear()` in browser console
