# 🏆 SiggyDrop Leaderboard Implementation Guide

## Overview

A complete leaderboard system has been added to the SiggyDrop game with the following features:
- **Backend API** for storing and retrieving scores
- **Database integration** with Supabase
- **Leaderboard page** with top 20 players
- **Game integration** with submit button after card generation
- **Responsive design** matching Ritual theme

---

## 📁 Files Created

### 1. **Database Client**
- **Path:** `/lib/supabase.ts`
- **Purpose:** Supabase client configuration and TypeScript types

### 2. **API Route**
- **Path:** `/app/api/leaderboard/route.ts`
- **Endpoints:**
  - `POST /api/leaderboard` - Submit score
  - `GET /api/leaderboard` - Fetch top 20 scores

### 3. **Leaderboard Page**
- **Path:** `/app/leaderboard/page.tsx`
- **URL:** `https://your-domain.vercel.app/leaderboard`
- **Features:**
  - Top 20 players ranked by score
  - Medal emojis for top 3 (🥇🥈🥉)
  - Auto-refresh functionality
  - Responsive mobile/desktop layout
  - Ritual Dots.png background
  - Custom Barlow fonts

### 4. **Game Page Updates**
- **Path:** `/app/game/page.tsx`
- **Changes:**
  - Added `submittingToLeaderboard` state
  - Added `leaderboardSubmitted` state
  - Added `submitToLeaderboard()` function
  - Added "🏆 Submit to Leaderboard" button
  - Button appears after card generation alongside "Edit Card" and "Restart Game"

### 5. **Documentation**
- **Path:** `/LEADERBOARD_SETUP.md`
- Complete setup instructions for Supabase and Vercel

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Setup Supabase

1. Create account at https://supabase.com
2. Create new project
3. Run this SQL in SQL Editor:

```sql
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON leaderboard FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert"
ON leaderboard FOR INSERT TO public WITH CHECK (true);
```

4. Get your **Project URL** and **Anon Key** from Settings → API

### Step 3: Setup Environment Variables

#### Local Development

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Vercel Production

1. Go to Vercel project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### Step 4: Test Locally

```bash
npm run dev
```

Visit:
- Game: http://localhost:3000/game
- Leaderboard: http://localhost:3000/leaderboard

### Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add leaderboard system"
git push
```

Vercel will auto-deploy.

---

## 🎮 User Flow

1. **Play Game** → User plays SiggyDrop
2. **Game Over** → Score is recorded
3. **Generate Card** → User enters name and uploads photo
4. **Submit to Leaderboard** → New button appears
5. **Click Submit** → Score saved to database
6. **Auto-Redirect** → Taken to leaderboard page
7. **View Rankings** → See top 20 players

---

## 🎨 Design Features

### Leaderboard Page Styling

- **Background:** Dots.png pattern with dark overlay
- **Fonts:**
  - Headings: Barlow-ExtraBold (#40FFAF)
  - Sub-headings: Barlow-Medium (#E7E7E7)
  - Body: Barlow-Regular (#FFFFFF)
- **Top 3 Highlight:** Green tint (#40FFAF)
- **Medal System:** 🥇🥈🥉 for ranks 1-3
- **Responsive:** Mobile-friendly grid layout

### Button Styling

Three buttons after card generation:
1. **Edit Card** - Purple gradient
2. **Submit to Leaderboard** - Yellow/Orange gradient (NEW)
3. **Restart Game** - Green gradient

---

## 🔒 Validation

### API Validation Rules

✅ **Username:**
- Cannot be empty
- Must be a string
- Trimmed automatically
- Max 50 characters

✅ **Score:**
- Must be a number
- Cannot be negative
- Stored as integer

### Frontend Validation

- Alert if username is empty on submit
- Button disabled while submitting
- Button shows "✅ Submitted!" after success
- Auto-redirect to leaderboard after 1 second

---

## 📊 Database Schema

```sql
Table: leaderboard
┌────────────┬──────────┬───────────┐
│ Column     │ Type     │ Notes     │
├────────────┼──────────┼───────────┤
│ id         │ BIGSERIAL│ Primary   │
│ username   │ TEXT     │ Required  │
│ score      │ INTEGER  │ Required  │
│ created_at │ TIMESTAMP│ Auto      │
└────────────┴──────────┴───────────┘

Index: idx_leaderboard_score (score DESC)
Policies: Public read/insert
```

---

## 🧪 Testing

### Test API Endpoint

```bash
# Submit score
curl -X POST http://localhost:3000/api/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","score":1000}'

# Get leaderboard
curl http://localhost:3000/api/leaderboard
```

### Expected Response (POST)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "TestPlayer",
    "score": 1000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Expected Response (GET)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "Player1",
      "score": 5000,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` exists with correct variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Issue: "Failed to save score"

**Causes:**
1. Supabase project not created
2. Table doesn't exist
3. RLS policies not set
4. Invalid API keys

**Solution:** Re-run SQL schema and verify API keys

### Issue: Leaderboard page shows 0 scores

**Causes:**
1. No scores submitted yet
2. Database table empty
3. API route returning error

**Solution:** Submit a test score via game or API

### Issue: "Submit to Leaderboard" button doesn't appear

**Causes:**
1. Card not generated yet
2. Username not entered
3. showCardForm is true

**Solution:** 
1. Play game until game over
2. Click "Generate Card"
3. Enter name and upload photo
4. Button should appear

---

## 📈 Performance Optimization

### Current Implementation
- Fetches top 20 only (not entire database)
- Indexed by score for fast sorting
- Tie-breaker: earlier submission wins

### Future Enhancements
- **Caching:** Use Vercel KV or Redis
- **Pagination:** Load more than 20 scores
- **Real-time:** WebSocket updates
- **Time-based:** Daily/weekly/monthly boards

---

## 🔐 Security Considerations

### Current Setup (Development)
- Public read/write access
- No rate limiting
- No authentication

### Production Recommendations
1. **Rate Limiting:** Use Vercel rate limiting middleware
2. **Username Filter:** Block profanity
3. **Score Validation:** Max score caps
4. **CAPTCHA:** Prevent bot submissions
5. **IP Limiting:** Prevent spam from same IP

---

## 🎯 Feature Checklist

✅ Database schema created
✅ API routes implemented
✅ Leaderboard page styled
✅ Game integration complete
✅ Username validation
✅ Responsive design
✅ Auto-refresh functionality
✅ Environment variable setup
✅ Vercel deployment ready

---

## 📞 Support

For issues or questions:
1. Check LEADERBOARD_SETUP.md
2. Verify environment variables
3. Test API endpoints
4. Check browser console for errors
5. Review Supabase logs

---

## 🎉 Success Criteria

Your leaderboard is working when:
1. ✅ Game over shows "Submit to Leaderboard" button
2. ✅ Clicking button saves score to database
3. ✅ Redirects to /leaderboard page
4. ✅ Leaderboard shows top 20 scores
5. ✅ Scores are sorted highest first
6. ✅ Top 3 have medals (🥇🥈🥉)
7. ✅ Mobile responsive
8. ✅ Works on Vercel production

Congratulations! Your SiggyDrop game now has a fully functional leaderboard system! 🏆
