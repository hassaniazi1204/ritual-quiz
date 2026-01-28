# 🎨 Ritual Quiz Platform - Visual Design Guide

## Design Philosophy

The Ritual Quiz Platform embodies the intersection of Web3 and AI through:
- **Ethereal Gradients**: Purple, blue, and pink flows
- **Glowing Effects**: Mystical, magical atmosphere  
- **Fluid Motion**: Gentle floating animations
- **Glass Morphism**: Modern, layered depth
- **Ritual Branding**: Authentic brand representation

---

## 🌈 Color System

### Primary Colors
```css
Ritual Purple: #8B5CF6 (rgb(139, 92, 246))
  Usage: Primary actions, borders, text accents
  
Ritual Blue: #3B82F6 (rgb(59, 130, 246))
  Usage: Gradients, secondary elements
  
Ritual Pink: #EC4899 (rgb(236, 72, 153))
  Usage: Gradient endpoints, highlights
```

### Background Colors
```css
Dark: #0F0F23 (rgb(15, 15, 35))
  Usage: Main backgrounds, cards
  
Darker: #050510 (rgb(5, 5, 16))
  Usage: Page background, deep shadows
```

### Semantic Colors
```css
Success Green: #22C55E (Green-500)
  Usage: Correct answers, positive feedback
  
Error Red: #EF4444 (Red-500)
  Usage: Wrong answers, validation errors
  
Gray Scale: #1F2937 → #E5E7EB
  Usage: Neutral elements, text, borders
```

---

## 🎭 Screen Layouts

### Start Screen
```
┌─────────────────────────────────────────────┐
│                                             │
│         🌟 Animated Background 🌟          │
│      (Floating purple/blue orbs)           │
│                                             │
│          ╔═══════════════════╗             │
│          ║  RITUAL QUIZ      ║             │
│          ║  (Gradient Text)  ║             │
│          ╚═══════════════════╝             │
│                                             │
│   Test Your Knowledge of the World's       │
│   First Sovereign Execution Layer for AI   │
│                                             │
│     ┌───────────────────────────┐          │
│     │   📊 Quiz Format           │          │
│     │   • 10 Questions Total     │          │
│     │   • 5 Easy Questions       │          │
│     │   • 3 Medium Questions     │          │
│     │   • 2 Hard Questions       │          │
│     └───────────────────────────┘          │
│                                             │
│          [  Start Quiz  ]                  │
│          (Glowing Button)                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Quiz Screen
```
┌─────────────────────────────────────────────┐
│  Question 1 of 10              EASY         │
│  ▓▓▓▓▓░░░░░░░░░░░░░ 10%                    │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │  What is the primary mission of      │ │
│  │  the Ritual Foundation?               │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ To create the fastest blockchain│ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ To steward and accelerate...    │ │ │
│  │  │ (Selected - Purple border)       │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ To build centralized AI...      │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ To replace Ethereum             │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                       │ │
│  │     [ Submit Answer ]                 │ │
│  │     (Gradient Button)                 │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Result Screen - Card Form
```
┌─────────────────────────────────────────────┐
│                                             │
│     ┌───────────────────────────────────┐  │
│     │ Generate Your Ritual Card         │  │
│     │                                   │  │
│     │  Your Name                        │  │
│     │  ┌─────────────────────────────┐ │  │
│     │  │ Enter your name...          │ │  │
│     │  └─────────────────────────────┘ │  │
│     │                                   │  │
│     │  Profile Picture (Optional)       │  │
│     │  ┌─────────────────────────────┐ │  │
│     │  │ [Choose File] No file...    │ │  │
│     │  └─────────────────────────────┘ │  │
│     │                                   │  │
│     │     [ Generate Card ]             │  │
│     │     (Gradient Button)             │  │
│     └───────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Result Screen - Card Display
```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐   │
│  │  ═══════════════════════════════    │   │
│  │       RITUAL CARD                   │   │
│  │  ═══════════════════════════════    │   │
│  │                                     │   │
│  │   ╭────╮                            │   │
│  │   │ 📷 │    Alice Wonderland        │   │
│  │   ╰────╯    Ritualist ✨            │   │
│  │                                     │   │
│  │         Score: 9/10                 │   │
│  │                                     │   │
│  │   Deep knowledge of the Ritual      │   │
│  │   ecosystem                         │   │
│  │                                     │   │
│  │  ritualfoundation.com • @ritualfnd  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Download │ │ Share to │ │  Retake  │   │
│  │   Card   │ │    X     │ │   Quiz   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Score Breakdown                     │   │
│  │ ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐    │   │
│  │ │✓││✓││✗││✓││✓││✓││✓││✗││✓││✓│    │   │
│  │ └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## ✨ Animation Specifications

### Floating Orbs
```css
Animation: float
Duration: 6s
Easing: ease-in-out
Loop: infinite

Keyframes:
  0%   → translateY(0px)
  50%  → translateY(-20px)
  100% → translateY(0px)

Delays:
  Orb 1: 0s
  Orb 2: 2s  
  Orb 3: 4s
```

### Glowing Effect
```css
Animation: glow
Duration: 2s
Easing: ease-in-out
Direction: alternate
Loop: infinite

Keyframes:
  0%   → boxShadow: 0 0 20px rgba(139, 92, 246, 0.5)
  100% → boxShadow: 0 0 40px rgba(139, 92, 246, 0.8)
```

### Progress Bar
```css
Transition: width 500ms ease-out
From: 0%
To: (currentQuestion / totalQuestions) * 100%
```

### Button Hover
```css
Transition: transform 300ms ease
Scale: 1.0 → 1.05
```

### Answer Feedback
```css
Transition: all 300ms ease
Correct: 
  - Background: green-500/20
  - Border: green-500 (2px)
  - Text: green-400

Wrong:
  - Background: red-500/20  
  - Border: red-500 (2px)
  - Text: red-400
```

---

## 🎨 Typography

### Font Family
```css
Primary: system-ui
Fallbacks: -apple-system, BlinkMacSystemFont, 
           'Segoe UI', Roboto, sans-serif
```

### Font Sizes (Responsive)

**Headings**
```
Mobile    Tablet    Desktop
h1: 3rem   4rem      5rem    (48px → 64px → 80px)
h2: 1.5rem 2rem      2.5rem  (24px → 32px → 40px)
h3: 1.25rem 1.5rem   1.875rem (20px → 24px → 30px)
```

**Body Text**
```
Mobile    Tablet    Desktop
p:  1rem   1.125rem  1.25rem  (16px → 18px → 20px)
sm: 0.875rem 0.875rem 1rem    (14px → 14px → 16px)
```

**Buttons**
```
Mobile    Tablet    Desktop
btn: 1.125rem 1.25rem  1.5rem  (18px → 20px → 24px)
```

### Font Weights
```
Regular: 400 (Body text)
Medium:  500 (Subheadings)
Bold:    700 (Headings, Buttons)
```

---

## 🖼️ Component Styles

### Card Style
```css
Background: linear-gradient(135deg, 
  rgba(139, 92, 246, 0.1) 0%,
  rgba(59, 130, 246, 0.1) 100%)
Border: 1px solid rgba(139, 92, 246, 0.3)
Border Radius: 1rem (16px)
Padding: 2rem (32px)
Backdrop Filter: blur(8px)
Box Shadow: 0 0 30px rgba(139, 92, 246, 0.3)
```

### Button Style
```css
Primary (Gradient):
  Background: linear-gradient(135deg, 
    #8B5CF6 0%, #3B82F6 50%, #EC4899 100%)
  Padding: 0.75rem 2rem
  Border Radius: 9999px (full)
  Font Weight: 700
  
Secondary (Purple):
  Background: #8B5CF6
  Padding: 0.75rem 2rem
  Border Radius: 0.75rem
  Font Weight: 700
```

### Option Button
```css
Default:
  Background: rgba(31, 41, 55, 0.5)
  Border: 2px solid #374151
  Padding: 1rem
  Border Radius: 0.75rem
  
Hover:
  Border Color: rgba(139, 92, 246, 0.5)
  
Selected:
  Background: rgba(139, 92, 246, 0.3)
  Border Color: #8B5CF6
  
Correct:
  Background: rgba(34, 197, 94, 0.2)
  Border Color: #22C55E
  
Wrong:
  Background: rgba(239, 68, 68, 0.2)
  Border Color: #EF4444
```

### Input Fields
```css
Background: #1F2937
Border: 2px solid #374151
Border Radius: 0.75rem
Padding: 0.75rem 1rem

Focus:
  Border Color: #8B5CF6
  Outline: none
```

---

## 📐 Spacing System

### Container Padding
```
Mobile:  1rem (16px)
Tablet:  2rem (32px)
Desktop: 3rem (48px)
```

### Component Spacing
```
gap-2: 0.5rem  (8px)   - Tight grouping
gap-4: 1rem    (16px)  - Related elements
gap-6: 1.5rem  (24px)  - Section spacing
gap-8: 2rem    (32px)  - Major sections
```

### Vertical Rhythm
```
space-y-2: 0.5rem  - List items
space-y-4: 1rem    - Form fields
space-y-6: 1.5rem  - Card content
space-y-8: 2rem    - Major sections
```

---

## 🎯 Gradient Definitions

### Primary Gradient (Ritual Brand)
```css
background: linear-gradient(135deg, 
  #8B5CF6 0%,     /* Purple */
  #3B82F6 50%,    /* Blue */
  #EC4899 100%    /* Pink */
)
```

### Text Gradient
```css
background: linear-gradient(to right, 
  #8B5CF6,        /* Purple */
  #3B82F6,        /* Blue */
  #EC4899         /* Pink */
)
background-clip: text
color: transparent
```

### Background Glow
```css
background: radial-gradient(
  circle at 50% 50%, 
  rgba(139, 92, 246, 0.2), 
  transparent 70%
)
```

### Card Background
```css
background: linear-gradient(
  to bottom right,
  #0F0F23,        /* Dark */
  #050510         /* Darker */
)
```

---

## 📱 Responsive Grid

### Result Screen Buttons
```
Mobile:   1 column (stack)
Tablet:   3 columns
Desktop:  3 columns
```

### Score Breakdown
```
Mobile:   5 columns
Tablet:   10 columns
Desktop:  10 columns
```

### Ritual Card
```
Mobile:   Stacked (column)
Tablet:   Side-by-side (row)
Desktop:  Side-by-side (row)
```

---

## 🌟 Interactive States

### Buttons
```
Default:  Scale 1.0, Normal shadow
Hover:    Scale 1.05, Enhanced glow
Active:   Scale 0.95
Disabled: Opacity 0.5, No pointer
```

### Options
```
Default:   Gray background, Gray border
Hover:     Purple border (if not feedback)
Selected:  Purple background, Purple border
Correct:   Green background, Green border
Wrong:     Red background, Red border
```

### Input Focus
```
Default:  Gray border
Focus:    Purple border, Purple ring
Invalid:  Red border
```

---

## 🎨 Brand Assets

### Logo Usage
- Primary: Gradient text "RITUAL QUIZ"
- Font: Bold, Large (5rem desktop)
- Animation: Subtle glow pulse

### Decorative Elements
- Floating orbs (3 minimum)
- Blur: 48-64px
- Opacity: 10-20%
- Colors: Purple, Blue, Pink

### Social Icons
```
Twitter: Blue (#1DA1F2) background
Download: Purple (#8B5CF6) background
Retake: Gradient background
```

---

## 🔍 Accessibility

### Contrast Ratios
```
White on Dark: 21:1 (AAA)
Purple on Dark: 7.2:1 (AA)
Gray on Dark: 4.5:1 (AA)
```

### Touch Targets
```
Minimum: 44x44px
Buttons: 48px height
Options: 56px height
```

### Focus Indicators
```
Ring: 2px purple
Offset: 2px
Visible on all interactive elements
```

---

## 🎬 Animation Performance

### Hardware Acceleration
```css
transform: translateZ(0)
will-change: transform, opacity
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 📊 Design Metrics

### Load Performance
- First Paint: < 1s
- Interactive: < 2s
- Full Load: < 3s

### Animation
- 60fps target
- Smooth transitions
- No jank

### Visual Consistency
- ✅ Consistent spacing
- ✅ Aligned elements
- ✅ Unified color palette
- ✅ Cohesive animations

---

**Visual Design Complete** ✨

This design system ensures:
- 🎨 On-brand Ritual aesthetic
- ⚡ Smooth, performant animations
- 📱 Responsive across all devices
- ♿ Accessible to all users
- 🔮 Magical, engaging experience
