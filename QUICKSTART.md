# 🚀 Ritual Quiz Platform - Quick Start

## ⚡ Fastest Way to Deploy (5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free - sign up at vercel.com)

### Step-by-Step

1. **Upload to GitHub**
   ```bash
   cd ritual-quiz
   git init
   git add .
   git commit -m "Initial commit: Ritual Quiz Platform"
   git branch -M main
   
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/ritual-quiz.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your `ritual-quiz` repository
   - Click "Deploy" (no configuration needed!)
   - Wait 2-3 minutes ✨

3. **Update Share URL**
   - Copy your Vercel URL (e.g., `https://ritual-quiz-abc123.vercel.app`)
   - Open `app/page.tsx`
   - Line 14: Change `const QUIZ_URL = 'https://ritual-quiz.vercel.app';`
   - To: `const QUIZ_URL = 'https://YOUR-ACTUAL-URL.vercel.app';`
   - Commit and push - Vercel auto-redeploys!

## 🎯 What You Get

✅ **110+ Quiz Questions** - All based on official Ritual sources
✅ **Smart Randomization** - Different quiz every time
✅ **Beautiful UI** - Ritual-branded Web3 aesthetic
✅ **Ritual Card Generator** - Personalized downloadable cards
✅ **Social Sharing** - One-click share to X/Twitter
✅ **Fully Responsive** - Works on all devices
✅ **Production Ready** - Optimized and fast

## 📁 Project Structure

```
ritual-quiz/
├── app/
│   ├── page.tsx          ← Main quiz application
│   ├── layout.tsx        ← Root layout
│   └── globals.css       ← Styles
├── public/
│   └── questions.json    ← 110 questions
├── README.md             ← Full documentation
├── DEPLOYMENT.md         ← Detailed deploy guide
├── FEATURES.md           ← Complete feature specs
└── package.json          ← Dependencies
```

## 🛠️ Local Development

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  ritual: {
    purple: '#8B5CF6',  // Your color
    blue: '#3B82F6',     // Your color
    pink: '#EC4899',     // Your color
  },
}
```

### Add Questions
Edit `public/questions.json`:
```json
{
  "id": 111,
  "question": "Your question?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "difficulty": "easy"
}
```

### Modify Roles
Edit `app/page.tsx` (lines 16-22):
```typescript
const ROLES = [
  { min: 0, max: 4, title: 'Your Title', description: '...' },
  // Add more
];
```

## 📊 Question Breakdown

- **40 Easy**: Basic Ritual facts
- **50 Medium**: Technical details
- **20 Hard**: Specific data points

Each quiz randomly selects:
- 5 Easy (50%)
- 3 Medium (30%)
- 2 Hard (20%)

## 🏆 Role System

| Score | Role | Description |
|-------|------|-------------|
| 0-4 | Initiate | Just starting |
| 5-6 | Ritty Bitty | Getting there |
| 7 | Ritty | Solid knowledge |
| 8-9 | Ritualist | Expert level |
| 10 | Mage | Perfect score! |

## 🐛 Troubleshooting

**Questions not loading?**
- Check `public/questions.json` exists
- Verify JSON is valid

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Card download not working?**
- Check browser allows downloads
- Try different browser
- Ensure html2canvas is installed

## 📱 Features

### Quiz System
- ✅ 110+ factual questions
- ✅ Smart difficulty distribution
- ✅ Randomized questions & options
- ✅ No answer patterns
- ✅ Instant feedback

### Visual Design
- ✅ Ritual brand colors
- ✅ Animated gradients
- ✅ Glowing effects
- ✅ Smooth transitions
- ✅ Fully responsive

### Ritual Card
- ✅ Custom name
- ✅ Profile picture upload
- ✅ Role badge
- ✅ Download as PNG
- ✅ Share to X/Twitter

## 🔗 Important Links

- **Ritual Foundation**: https://www.ritualfoundation.com
- **Ritual X/Twitter**: https://x.com/ritualfnd
- **Ritual Docs**: https://ritualfoundation.org/docs

## 📚 Documentation

- `README.md` - Full project documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `FEATURES.md` - Complete feature specifications

## 💡 Tips

1. **Test locally first**: Run `npm run dev` before deploying
2. **Update quiz URL**: Don't forget step 3 above!
3. **Monitor deployments**: Check Vercel dashboard for build status
4. **Keep updated**: Star the repo and watch for updates

## 🎯 Next Steps

After deployment:
1. Share your quiz URL with the Ritual community
2. Post on X/Twitter with @ritualfnd
3. Gather feedback and iterate
4. Consider adding analytics
5. Monitor user engagement

## ⚡ One-Command Deploy (Advanced)

If you have Vercel CLI:
```bash
npm i -g vercel
cd ritual-quiz
vercel --prod
```

## 🌟 Pro Tips

- **Custom Domain**: Add in Vercel settings → Domains
- **Analytics**: Enable Vercel Analytics for free
- **Preview Deploys**: Every push gets a preview URL
- **Rollback**: Instant rollback in Vercel dashboard

---

## 🆘 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Review `FEATURES.md` for technical details
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs

---

**You're ready to launch! 🔮**

The Ritual Quiz Platform is production-ready and optimized for:
- ⚡ Lightning-fast performance
- 📱 All devices and screen sizes
- 🎨 Beautiful, on-brand design
- 🔒 Secure, client-side only
- ♾️ Unlimited scalability

Deploy now and share the Ritual knowledge! ✨
