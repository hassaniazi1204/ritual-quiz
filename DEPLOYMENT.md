# 🚀 Ritual Quiz - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ritual Quiz Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ritual-quiz.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click **"New Project"**
   - Import your `ritual-quiz` repository
   - Vercel will auto-detect Next.js
   - Click **"Deploy"**
   - Wait 2-3 minutes for deployment

3. **Update Share URL**
   - After deployment, copy your Vercel URL (e.g., `ritual-quiz.vercel.app`)
   - Update line 14 in `app/page.tsx`:
     ```typescript
     const QUIZ_URL = 'https://YOUR-VERCEL-URL.vercel.app';
     ```
   - Commit and push:
     ```bash
     git add app/page.tsx
     git commit -m "Update quiz URL"
     git push
     ```
   - Vercel will auto-redeploy

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd ritual-quiz
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - What's your project's name? ritual-quiz
# - In which directory is your code located? ./
# - Want to override settings? No

# Production deployment
vercel --prod
```

## Alternative: Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or use Netlify Dashboard**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Deploy

## Environment Setup

### Prerequisites
- Node.js 18+ installed
- Git installed
- npm or yarn package manager

### Local Development
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ritual-quiz.git
cd ritual-quiz

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

## Post-Deployment Checklist

- [ ] Quiz loads without errors
- [ ] All 10 questions display correctly
- [ ] Answer randomization works
- [ ] Score calculation is accurate
- [ ] Card generation works
- [ ] Image upload functions
- [ ] Download card produces PNG
- [ ] Share to X opens Twitter with correct text
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations play smoothly

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Questions Not Loading
- Verify `public/questions.json` exists
- Check browser console for errors
- Ensure JSON is valid (use JSONLint)

### Card Download Not Working
- Check if html2canvas is installed
- Verify browser allows downloads
- Try different browser

### Share Button Issues
- Ensure QUIZ_URL is updated with actual deployed URL
- Check if pop-ups are blocked in browser

## Custom Domain Setup (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `quiz.ritual.xyz`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

## Performance Optimization

Already implemented:
- ✅ Next.js automatic code splitting
- ✅ Image optimization
- ✅ CSS purging via Tailwind
- ✅ Client-side routing

Optional enhancements:
- Add analytics (Vercel Analytics, Google Analytics)
- Implement caching strategies
- Add service worker for offline support

## Monitoring

### Vercel Analytics
1. Go to project settings
2. Enable Analytics
3. View real-time stats

### Error Tracking
Consider adding:
- Sentry for error monitoring
- LogRocket for session replay

## Scaling

Current setup handles:
- 10,000+ concurrent users
- Instant global CDN delivery
- Automatic scaling on Vercel

For higher traffic:
- Enable Vercel Pro features
- Add rate limiting
- Implement caching

## Security

Implemented:
- ✅ No API keys exposed
- ✅ Client-side only (no backend)
- ✅ No sensitive data storage

Best practices:
- Keep dependencies updated
- Monitor for security alerts
- Use HTTPS (automatic on Vercel)

## Updates & Maintenance

### Adding Questions
1. Edit `public/questions.json`
2. Add new question object
3. Commit and push
4. Vercel auto-deploys

### Updating Design
1. Edit Tailwind config or CSS
2. Test locally with `npm run dev`
3. Commit and push
4. Vercel auto-deploys

### Version Control
```bash
# Create new feature
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Merge via GitHub PR
```

## Rollback

### Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Git
```bash
# Revert last commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard COMMIT_HASH
git push --force
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## Cost

- **Vercel Hobby**: FREE
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
  - Global CDN

- **Vercel Pro**: $20/month (if needed)
  - Unlimited bandwidth
  - Advanced analytics
  - Team features

---

**Your Ritual Quiz Platform is ready to deploy! 🔮**

Choose Vercel Method 1 for fastest deployment.
