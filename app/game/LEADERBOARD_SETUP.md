# Leaderboard Setup Instructions

## 1. Supabase Database Setup

### Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

### Create Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create leaderboard table
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster sorting
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read leaderboard
CREATE POLICY "Allow public read access"
ON leaderboard FOR SELECT
TO public
USING (true);

-- Policy to allow anyone to insert scores
CREATE POLICY "Allow public insert"
ON leaderboard FOR INSERT
TO public
WITH CHECK (true);
```

## 2. Environment Variables

### Local Development (.env.local)

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

4. Make sure to add them for **Production**, **Preview**, and **Development** environments
5. Redeploy your application after adding variables

## 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## 4. Vercel Deployment Notes

- Environment variables are automatically loaded in Vercel
- No additional configuration needed
- API routes at `/api/*` are automatically deployed as serverless functions
- The leaderboard will be available at `your-domain.vercel.app/leaderboard`

## 5. Testing

### Test API endpoint:
```bash
curl -X POST https://your-domain.vercel.app/api/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","score":1000}'
```

### Test leaderboard page:
Visit: `https://your-domain.vercel.app/leaderboard`

## 6. Security Considerations

- The current setup allows public read/write to leaderboard
- For production, consider:
  - Rate limiting on API route
  - Username profanity filter
  - Score validation (max score limits)
  - CAPTCHA for spam prevention
  - IP-based rate limiting

## 7. Optional Enhancements

- Add user avatars to leaderboard
- Show user's rank if they're not in top 20
- Add time-based leaderboards (daily, weekly, all-time)
- Add pagination for more than 20 scores
- Cache leaderboard data with Redis or Vercel KV
