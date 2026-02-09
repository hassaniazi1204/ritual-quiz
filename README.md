// redeploy


# Ritual Quiz Platform 🔮

A visually stunning, production-ready MCQ quiz website for the Ritual Foundation Web3 project, built with Next.js, React, and Tailwind CSS.

## 🎯 Features

### Quiz System
- **100+ Questions** - Comprehensive question pool based on official Ritual sources
- **Smart Question Selection** - Each quiz contains:
  - 5 Easy questions
  - 3 Medium questions  
  - 2 Hard questions
- **Randomization** - Questions and options shuffled every session
- **Anti-Pattern Design** - Correct answers vary in length and position

### Visual Design
- Modern Web3/AI aesthetic with Ritual branding
- Animated gradients and glowing effects
- Floating background elements
- Smooth transitions between screens
- Fully responsive (mobile, tablet, desktop)

### Ritual Card Generator
At quiz completion, users can generate a personalized Ritual Card featuring:
- Custom name input
- Profile picture upload
- Role assignment based on score:
  - 0-4: **Initiate**
  - 5-6: **Ritty Bitty**
  - 7: **Ritty**
  - 8-9: **Ritualist**
  - 10: **Mage**
- Downloadable PNG image

### Social Sharing
- One-click share to X (Twitter)
- Pre-filled quote tweet format:
  ```
  I just completed the Ritual Quiz and earned the {ROLE} rank 🔮 
  Score: {SCORE}/10
  
  Think you can beat me? Take the Ritual Quiz 👇 {QUIZ_URL}
  
  @ritualfnd
  ```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Generation**: html2canvas
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
cd ritual-quiz

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

### Environment Variables

No environment variables required for basic deployment.

To update the quiz URL for social sharing:
1. After first deployment, note your Vercel URL
2. Update `QUIZ_URL` constant in `app/page.tsx`
3. Redeploy

## 📁 Project Structure

```
ritual-quiz/
├── app/
│   ├── globals.css          # Global styles & Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main quiz application
├── public/
│   └── questions.json        # Question pool (110 questions)
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
└── package.json              # Dependencies
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize Ritual brand colors:

```typescript
colors: {
  ritual: {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    pink: '#EC4899',
    dark: '#0F0F23',
    darker: '#050510',
  },
}
```

### Questions
Add/edit questions in `public/questions.json`:

```json
{
  "id": 111,
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "difficulty": "easy"
}
```

### Roles
Modify role thresholds in `app/page.tsx`:

```typescript
const ROLES = [
  { min: 0, max: 4, title: 'Initiate', description: '...' },
  // Add more roles
];
```

## 📚 Question Sources

All questions are based on official Ritual Foundation content:
- https://www.ritualfoundation.com/blog/introducing-ritual-foundation
- https://www.ritualfoundation.com/
- Ritual documentation and announcements

## 🔧 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Key Features Implementation

### Randomization Logic
```typescript
// Questions randomized per session
const selectedQuestions = [
  ...shuffleArray(easy).slice(0, 5),
  ...shuffleArray(medium).slice(0, 3),
  ...shuffleArray(hard).slice(0, 2),
];

// Options randomized per question
const questionsWithShuffledOptions = selectedQuestions.map(q => ({
  ...q,
  options: shuffleArray([...q.options]),
}));
```

### Card Generation
Uses `html2canvas` to convert DOM element to downloadable PNG:
```typescript
const canvas = await html2canvas(cardRef.current, {
  backgroundColor: '#050510',
  scale: 2,
});
```

### Social Share
Opens Twitter intent with pre-filled text:
```typescript
const text = `I just completed the Ritual Quiz...`;
const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
window.open(url, '_blank');
```

## 🌟 Design Philosophy

- **Ritual Branding**: Purple, blue, and pink gradients
- **Web3 Aesthetic**: Glowing effects, flowing animations
- **Modern UX**: Smooth transitions, clear feedback
- **Accessibility**: High contrast, readable fonts
- **Performance**: Optimized images, lazy loading

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Anti-Cheat Measures

- Questions randomized each session
- Options shuffled independently
- No pattern in correct answer positions
- Client-side validation with instant feedback

## 🎓 Educational Value

Quiz covers:
- Ritual Foundation mission and vision
- Technical architecture and features
- Team and history
- Ecosystem and products
- Use cases and applications

## 🤝 Contributing

To add more questions:
1. Research official Ritual sources
2. Follow question format in `questions.json`
3. Ensure factual accuracy
4. Vary option lengths naturally
5. Test difficulty classification

## 📄 License

This project is created for the Ritual Foundation ecosystem.

## 🔗 Links

- Ritual Foundation: https://www.ritualfoundation.com
- Ritual X/Twitter: https://x.com/ritualfnd
- Ritual Docs: https://ritualfoundation.org/docs

## 🙏 Acknowledgments

Built with inspiration from Ritual's vision for the world's first sovereign execution layer for AI.

---

**Built for the Ritual community with 🔮**
