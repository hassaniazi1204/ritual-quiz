# 🎮 Ritual Merge Game - Complete Setup Guide

## 📋 Overview

A physics-based merge game built with Next.js and Matter.js, featuring:
- 10 ball levels with Ritual team avatars
- Merge mechanics (same level → level up)
- Level 10 + 10 = Level 1 (infinite loop)
- Score tracking and card generation
- Screen shake and vibration effects
- Mobile and desktop support

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ritual-quiz
npm install
```

This will install:
- `matter-js` - 2D physics engine
- `@types/matter-js` - TypeScript types

### 2. Add Avatar Images

Place these 10 avatar images in `/public/avatars/`:

```
/public/avatars/
├── stefan2.png      (Level 1)
├── raintaro2.png    (Level 2)
├── itoshi2.png      (Level 3)
├── hinata1.png      (Level 4)
├── majorproject2.png (Level 5)
├── jezz1.png        (Level 6)
├── dunken2.png      (Level 7)
├── josh2.png        (Level 8)
├── niraj2.png       (Level 9)
└── ritual2.png      (Level 10)
```

**Image Requirements:**
- Format: PNG, JPG, or WebP
- Size: 200x200px minimum (will be scaled)
- Square aspect ratio preferred
- Clear, high-contrast images work best

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000/game](http://localhost:3000/game)

---

## 🎮 Game Mechanics

### Ball Levels
- **Level 1** (smallest) → **Level 10** (largest)
- Each level has unique:
  - Radius (20px to 70px)
  - Color
  - Avatar image
  - Score value (10 to 100 points)

### Merge System
```
Level 1 + Level 1 = Level 2  (+10 points)
Level 2 + Level 2 = Level 3  (+20 points)
...
Level 9 + Level 9 = Level 10 (+90 points)
Level 10 + Level 10 = Level 1 (+100 points) ← LOOP!
```

### Scoring
| Merge Level | Points |
|-------------|--------|
| 1 → 2 | 10 |
| 2 → 3 | 20 |
| 3 → 4 | 30 |
| ... | ... |
| 9 → 10 | 90 |
| 10 → 1 | 100 |

### Game Over
- Red danger line at top of screen
- Game ends when balls stack above this line
- Final score displayed
- Option to generate score card

---

## 🎨 Customization

### Change Ball Sizes
Edit `BALL_CONFIG` in `/app/game/page.tsx`:

```typescript
const BALL_CONFIG = [
  { level: 1, radius: 20, ... },  // Make smaller/larger
  { level: 2, radius: 25, ... },
  // ...
];
```

### Change Colors
```typescript
const BALL_CONFIG = [
  { level: 1, color: '#8B5CF6', ... },  // Purple
  { level: 2, color: '#3B82F6', ... },  // Blue
  // ...
];
```

### Change Score Values
```typescript
const BALL_CONFIG = [
  { level: 1, score: 10, ... },   // 10 points
  { level: 2, score: 20, ... },   // 20 points
  // ...
];
```

### Adjust Physics
```typescript
// In useEffect where engine is created
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 1 },  // Increase y for faster falling
});

// Ball properties
const body = Matter.Bodies.circle(x, y, radius, {
  restitution: 0.3,  // Bounciness (0-1)
  friction: 0.5,     // Friction (0-1)
});
```

### Change Game Dimensions
```typescript
const gameWidth = 800;   // Canvas width
const gameHeight = 600;  // Canvas height
const topBoundary = 100; // Danger zone position
```

---

## 🔧 Technical Architecture

### File Structure
```
/app/game/page.tsx        - Main game component
/public/avatars/          - Ball avatar images
/app/globals.css          - Global styles
/tailwind.config.ts       - Tailwind configuration
```

### Core Systems

#### 1. **Physics Engine (Matter.js)**
```typescript
engineRef.current - Physics engine instance
worldRef.current  - Physics world
ballsRef.current  - Array of active balls
```

#### 2. **Rendering System**
- HTML5 Canvas for graphics
- Custom render loop for drawing images on balls
- 60 FPS target

#### 3. **Collision Detection**
```typescript
Matter.Events.on(engine, 'collisionStart', (event) => {
  // Detect same-level collisions
  // Remove old balls
  // Create merged ball
  // Update score
});
```

#### 4. **Game State Management**
```typescript
const [score, setScore] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [nextBallLevel, setNextBallLevel] = useState(1);
```

---

## 📱 Mobile Support

The game is fully mobile-compatible:
- Touch events work like clicks
- Canvas scales responsively
- UI optimized for small screens

**Testing on Mobile:**
1. Deploy to Vercel
2. Open on phone
3. Tap to drop balls

---

## 🚀 Deployment to Vercel

### Option 1: Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import repository
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Build Settings
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## 🎯 Features Breakdown

### ✅ Implemented Features

1. **Physics Engine**
   - Gravity-based falling
   - Realistic collisions
   - Ball rotation
   - Bounce and friction

2. **Merge System**
   - Same-level collision detection
   - Smooth ball removal
   - New ball spawning
   - Level 10 → Level 1 loop

3. **Scoring**
   - Points per merge
   - Running total display
   - Score card generation

4. **Visual Effects**
   - Vibration based on ball level
   - Screen shake on merge
   - Glow effects around balls
   - Preview ball (next drop)

5. **UI/UX**
   - Score board
   - Instructions panel
   - Ball level reference
   - Restart button
   - Game over modal
   - Score card form

6. **Responsive Design**
   - Works on desktop
   - Works on mobile
   - Scales properly
   - Touch-friendly

### 🎨 Visual Polish

- **Gradient backgrounds**
- **Glowing ball effects**
- **Smooth animations**
- **Ritual-themed colors**
- **Professional UI**

---

## 🐛 Troubleshooting

### Images Not Loading
```bash
# Check file paths
ls public/avatars/

# Verify filenames match exactly:
stefan2.png (not Stefan2.png or stefan2.PNG)
```

### Physics Not Working
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Canvas Too Small on Mobile
```typescript
// Add to canvas element
style={{ maxWidth: '100%', height: 'auto' }}
```

---

## 🎮 Gameplay Tips

### For Players
1. **Plan ahead** - Think about where balls will fall
2. **Merge strategically** - Create space for bigger balls
3. **Watch the line** - Don't let balls stack too high
4. **Level 10s are valuable** - They give 100 points!

### For Developers
1. **Adjust gravity** for easier/harder gameplay
2. **Change ball sizes** for different difficulty
3. **Modify spawn rate** of higher-level balls
4. **Tweak vibration** intensity for visual feedback

---

## 📊 Performance Optimization

### Current Settings
- **60 FPS** target
- **Physics updates** every frame
- **Custom render loop** for images
- **Collision detection** optimized

### If Laggy
```typescript
// Reduce physics accuracy for performance
const engine = Matter.Engine.create({
  positionIterations: 6,  // Default: 6, lower = faster
  velocityIterations: 4,  // Default: 4, lower = faster
});
```

---

## 🎨 Avatar Image Guidelines

### Recommended Specs
- **Format**: PNG (transparency supported)
- **Size**: 200x200px or larger
- **Quality**: High resolution
- **Style**: Clear, recognizable faces/logos
- **Background**: Transparent or solid color

### Image Preparation
```bash
# Resize images to 200x200
# Use ImageMagick or similar
convert input.png -resize 200x200 output.png

# Create circular crop (optional)
convert input.png -resize 200x200 \
  -background none \
  \( +clone -fill black -draw 'circle 100,100 100,0' \) \
  -alpha set -compose DstIn -composite \
  output.png
```

---

## 🔮 Future Enhancements

### Potential Features
1. **Sound effects** on merge
2. **Background music**
3. **Power-ups** (slow time, remove ball, etc.)
4. **Leaderboard** (global high scores)
5. **Daily challenges**
6. **Achievements system**
7. **Multiplayer mode**
8. **Custom ball skins**
9. **Particle effects** on merge
10. **Combo system** (consecutive merges)

### Easy Additions

**Add Sound:**
```typescript
// Create audio element
const mergeSound = new Audio('/sounds/merge.mp3');

// Play on merge
mergeSound.play();
```

**Add Particles:**
```typescript
// Use canvas particles library
// Or create custom particle system
```

---

## 📝 Code Walkthrough

### Main Components

#### 1. Ball Configuration
```typescript
const BALL_CONFIG = [
  { level, radius, image, color, score },
  // Defines all 10 ball types
];
```

#### 2. Physics Setup
```typescript
useEffect(() => {
  // Create engine
  // Create renderer
  // Add boundaries
  // Start physics loop
}, []);
```

#### 3. Custom Render Loop
```typescript
const customRender = () => {
  // Clear canvas
  // Draw background
  // Draw danger line
  // Draw all balls with images
  // Draw preview ball
  requestAnimationFrame(customRender);
};
```

#### 4. Collision Handler
```typescript
Matter.Events.on(engine, 'collisionStart', (event) => {
  // Find colliding balls
  // Check if same level
  // Merge into new ball
  // Update score
  // Trigger effects
});
```

#### 5. Game Over Check
```typescript
setInterval(() => {
  // Check if any ball above danger line
  // If yes, end game
  // Show score card form
}, 500);
```

---

## 🎯 Testing Checklist

### Functionality
- [ ] Balls drop on click
- [ ] Physics works (gravity, collision)
- [ ] Same-level balls merge
- [ ] Score increases correctly
- [ ] Level 10 + 10 = Level 1
- [ ] Game over triggers
- [ ] Restart works
- [ ] Images load properly

### Visuals
- [ ] Balls have correct avatars
- [ ] Vibration effect works
- [ ] Screen shake on merge
- [ ] Glow effects visible
- [ ] UI is clear and readable

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 📚 Resources

- **Matter.js Docs**: https://brm.io/matter-js/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## 🙋 FAQ

**Q: Can I use different images?**
A: Yes! Just replace the files in `/public/avatars/`

**Q: How do I change difficulty?**
A: Adjust gravity, ball sizes, or spawn probabilities

**Q: Can I add more levels?**
A: Yes, add more entries to `BALL_CONFIG`

**Q: Will this work on mobile?**
A: Yes, fully touch-compatible

**Q: Can I customize colors?**
A: Yes, edit the `color` property in `BALL_CONFIG`

---

**Game is ready to play!** 🎮

Access at: `http://localhost:3000/game`
