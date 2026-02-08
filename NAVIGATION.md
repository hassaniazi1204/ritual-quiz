# 🧭 Navigation Structure - Quiz + Game

## ✅ Your App Now Has 2 Pages

```
ritual-quiz/
├── app/
│   ├── page.tsx          ← QUIZ PAGE (/)
│   ├── game/
│   │   └── page.tsx      ← GAME PAGE (/game)
│   └── layout.tsx
```

## 🔗 URLs

### Local Development
- **Quiz:** http://localhost:3000/
- **Game:** http://localhost:3000/game

### Production (Vercel)
- **Quiz:** https://your-app.vercel.app/
- **Game:** https://your-app.vercel.app/game

---

## 🎯 User Flow

```
Homepage (/)
    ↓
┌───────────────┐
│  Ritual Quiz  │
├───────────────┤
│ [Start Quiz]  │
│ [🎮 Play Game]│ ← New button
└───────────────┘
    ↓ (clicks Play Game)
    ↓
Game Page (/game)
    ↓
┌────────────────┐
│ [← Back to Quiz]│ ← Back button
├────────────────┤
│  Merge Game    │
│  Canvas Area   │
│  Score: XXX    │
└────────────────┘
```

---

## 📁 Files Structure

### DON'T TOUCH (Already working)
```
✅ /app/page.tsx           - Quiz (KEEP)
✅ /app/layout.tsx         - Root layout (KEEP)
✅ /app/globals.css        - Styles (KEEP)
✅ /public/questions.json  - Quiz data (KEEP)
```

### NEW FILES (Just added)
```
✅ /app/game/page.tsx      - Merge game (NEW)
✅ /public/avatars/        - Game images (NEW - add your 10 images)
```

---

## 🚀 What Changed in Quiz

**Start Screen now has 2 buttons:**

Before:
```tsx
<button>Start Quiz</button>
```

After:
```tsx
<button>Start Quiz</button>
<a href="/game">🎮 Play Game</a>  ← NEW!
```

That's it! Just one line added.

---

## 🎮 What Changed in Game

**Added back navigation:**

```tsx
<a href="/">← Back to Quiz</a>
```

---

## ✅ Installation

No changes needed! Just:

```bash
npm install  # Installs matter-js for game
npm run dev
```

---

## 🎯 Testing Navigation

1. **Go to:** http://localhost:3000/
2. **See:** Quiz start screen with 2 buttons
3. **Click:** "🎮 Play Game"
4. **See:** Game page loads
5. **Click:** "← Back to Quiz"
6. **See:** Back to quiz

---

## 📊 Both Apps Side by Side

| Feature | Quiz (`/`) | Game (`/game`) |
|---------|------------|----------------|
| **Purpose** | Test knowledge | Merge balls game |
| **Questions** | 10 questions | N/A |
| **Score** | 0-10 points | Unlimited |
| **Tech** | React forms | Matter.js physics |
| **Card** | Ritual Card | Score Card |
| **Mobile** | ✅ Yes | ✅ Yes |

---

## 🔗 Add Links Anywhere

**In Quiz (add to result screen):**
```tsx
<a href="/game">Try the Merge Game →</a>
```

**In Game (add to game over):**
```tsx
<a href="/">Take the Quiz →</a>
```

---

## 🚀 Deploy Both Together

When you deploy to Vercel:
- Both pages deploy automatically
- No special configuration needed
- Next.js handles routing

```bash
git add .
git commit -m "Add merge game + navigation"
git push
vercel --prod
```

**Result:**
- `your-app.vercel.app/` → Quiz
- `your-app.vercel.app/game` → Game

---

## ✨ Summary

✅ **Quiz stays at:** `/app/page.tsx`
✅ **Game is at:** `/app/game/page.tsx`
✅ **Navigation added:** Between both pages
✅ **No file swapping needed!**
✅ **Both work independently**
✅ **Both share same layout/styles**

**You have a complete Ritual platform with Quiz + Game!** 🎮🔮
