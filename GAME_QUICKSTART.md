# 🎮 Ritual Merge Game - Quick Start

## ✅ Already Built!

Your physics merge game is complete and ready to use at `/app/game/page.tsx`

## 🚀 Installation (3 Steps)

### 1. Install Dependencies
```bash
cd ritual-quiz
npm install
```

This installs Matter.js (physics engine) automatically.

### 2. Add Your Avatar Images

Place these 10 images in `/public/avatars/`:

```
/public/avatars/
├── stefan2.png      ← Level 1 (smallest)
├── raintaro2.png    ← Level 2
├── itoshi2.png      ← Level 3
├── hinata1.png      ← Level 4
├── majorproject2.png ← Level 5
├── jezz1.png        ← Level 6
├── dunken2.png      ← Level 7
├── josh2.png        ← Level 8
├── niraj2.png       ← Level 9
└── ritual2.png      ← Level 10 (largest)
```

**Image specs:** 200x200px minimum, PNG/JPG, square aspect ratio

### 3. Run the Game
```bash
npm run dev
```

Visit: **http://localhost:3000/game**

---

## 🎮 Game Features (All Implemented!)

### ✅ Core Mechanics
- ✅ Click/tap to drop balls
- ✅ 10 ball levels with avatar textures
- ✅ Gravity-based physics (Matter.js)
- ✅ Same-level collision → merge
- ✅ Level 10 + Level 10 = Level 1 (loop!)
- ✅ Game over when balls cross red line

### ✅ Scoring System
- ✅ Level 1 merge = 10 points
- ✅ Level 2 merge = 20 points
- ✅ ...up to Level 10 = 100 points
- ✅ Running total displayed
- ✅ Final score on game over

### ✅ Visual Effects
- ✅ Ball vibration (intensity scales with level)
- ✅ Screen shake on merge (stronger for bigger balls)
- ✅ Glow effects around balls
- ✅ Preview ball before dropping
- ✅ Ritual-themed gradient background

### ✅ UI Components
- ✅ Score board (live updates)
- ✅ How to Play instructions
- ✅ Ball levels reference chart
- ✅ Restart game button
- ✅ Game over modal with score card form
- ✅ Play again button

### ✅ Mobile Support
- ✅ Touch events work
- ✅ Responsive canvas
- ✅ Mobile-optimized UI

---

## 🎯 How to Play

1. **Click** anywhere on the canvas to drop a ball
2. **Merge** two balls of the same level
3. **Score** points for each successful merge
4. **Avoid** letting balls stack above the red danger line
5. **Loop** - Level 10 + Level 10 creates Level 1!

---

## 🎨 Customization

### Change Ball Sizes
Edit in `/app/game/page.tsx`:
```typescript
const BALL_CONFIG = [
  { level: 1, radius: 20, ... },  // ← Make bigger/smaller
  { level: 2, radius: 25, ... },
  // ...
];
```

### Change Colors
```typescript
{ level: 1, color: '#8B5CF6', ... },  // ← Change hex color
```

### Change Score Values
```typescript
{ level: 1, score: 10, ... },  // ← Adjust points
```

### Adjust Physics
```typescript
// Gravity strength
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 1 },  // ← Increase y for faster fall
});

// Ball bounciness
const body = Matter.Bodies.circle(x, y, radius, {
  restitution: 0.3,  // ← 0 (no bounce) to 1 (super bouncy)
  friction: 0.5,     // ← 0 (slippery) to 1 (sticky)
});
```

---

## 🚀 Deploy to Vercel

### Method 1: GitHub + Vercel Dashboard
```bash
# 1. Push to GitHub
git add .
git commit -m "Add Ritual Merge Game"
git push

# 2. Go to vercel.com
# 3. Import your repository
# 4. Click Deploy
```

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`

---

## 📁 Project Structure

```
ritual-quiz/
├── app/
│   ├── game/
│   │   └── page.tsx          ← Main game file ⭐
│   ├── page.tsx              ← Quiz (existing)
│   └── layout.tsx
├── public/
│   └── avatars/              ← Add your 10 images here
│       ├── stefan2.png
│       ├── raintaro2.png
│       ├── itoshi2.png
│       ├── hinata1.png
│       ├── majorproject2.png
│       ├── jezz1.png
│       ├── dunken2.png
│       ├── josh2.png
│       ├── niraj2.png
│       └── ritual2.png
├── package.json              ← matter-js added
└── GAME_SETUP.md            ← Full documentation
```

---

## 🎮 Game Architecture

### Physics Engine (Matter.js)
```typescript
engineRef     → Physics calculations
worldRef      → Physics world container
ballsRef      → Active balls array
```

### Rendering (HTML5 Canvas)
```typescript
canvasRef     → Canvas element
Custom loop   → Draws images on balls at 60 FPS
```

### Collision Detection
```typescript
Matter.Events.on('collisionStart') → Detects merges
→ Remove old balls
→ Create new merged ball
→ Update score
→ Trigger effects
```

### Game State
```typescript
score         → Current points
gameOver      → End game flag
nextBallLevel → Preview ball level
dropPosition  → Where ball will drop
```

---

## 🐛 Troubleshooting

### Images Not Showing?
```bash
# Check files exist
ls public/avatars/

# Verify exact names (case-sensitive!)
stefan2.png  ← not Stefan2.PNG
```

### Physics Not Working?
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails?
```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 📊 Code Statistics

- **Lines of Code:** ~450
- **Dependencies:** matter-js (only new one)
- **Files Created:** 1 (game page)
- **Images Needed:** 10 (avatars)

---

## ✨ Advanced Features (Easy to Add)

### Add Sound Effects
```typescript
// In merge handler
const mergeSound = new Audio('/sounds/merge.mp3');
mergeSound.play();
```

### Add Particle Effects
```typescript
// After merge, create particles
for (let i = 0; i < 10; i++) {
  createParticle(mergeX, mergeY);
}
```

### Add Combo System
```typescript
let comboCount = 0;
let comboTimer;

// On merge
comboCount++;
clearTimeout(comboTimer);
comboTimer = setTimeout(() => comboCount = 0, 2000);
```

---

## 🎯 What's Already Done

✅ **Full game implementation**
✅ **Matter.js physics engine**
✅ **10-level ball system**
✅ **Merge mechanics with loop**
✅ **Score tracking**
✅ **Vibration effects**
✅ **Screen shake**
✅ **Game over detection**
✅ **Score card generation**
✅ **Mobile support**
✅ **Ritual theming**
✅ **Complete documentation**

---

## 🚀 Next Steps

1. **Add your 10 avatar images** to `/public/avatars/`
2. **Run `npm install`**
3. **Run `npm run dev`**
4. **Play at http://localhost:3000/game**
5. **Deploy to Vercel when ready**

---

## 📞 Need Help?

- Full docs: `/GAME_SETUP.md`
- Game code: `/app/game/page.tsx`
- Package config: `/package.json`

**The game is production-ready!** 🎮

Just add your avatar images and you're good to go! 🔮
