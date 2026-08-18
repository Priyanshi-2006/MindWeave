# 🧠 MindWeave

**MindWeave** is an adaptive cognitive gaming platform designed for children. It uses a personalized AI engine to continuously adjust game difficulty, challenge types, and reward systems based on each child's real-time performance — no two sessions are the same.

---

## ✨ Features

### 🎮 Four Adaptive Core Games
| Game | Skill Trained | Description |
|------|--------------|-------------|
| **Simon Says** 🎵 | Working Memory | Color-sequence memory game with adaptive speed, sequence length, and palette size |
| **Spot the Difference** 👀 | Visual Attention | Two nearly-identical emoji scenes; differences get subtler as observation improves |
| **Maze Escape** 🌀 | Spatial Reasoning | Procedurally-generated mazes with adaptive size, hazards, and time limits |
| **Mini Detective** 🔎 | Logical Reasoning | Solve classroom mysteries using clues; red herring count and reasoning depth adapts |

### 🤖 IntelliPlay Adaptive Engine
- **Real-time difficulty adjustment** after every round using a multi-factor cognitive model
- **Ability bands** (emerging → developing → capable → gifted) with smooth transitions
- **Skill profiling** across 5 dimensions: memory, attention, reasoning, speed, accuracy
- **Cross-game skill transfer** — a boost in one game influences difficulty in related games
- **Explainable AI** — every difficulty change shows a clear child-friendly reason

### 🎉 Brain Boost Bonus Challenges
Unlocked when a child maintains ≥85% daily average with no game under 70%:
- **Advanced Sudoku** — 4×4, 6×6, and 9×9 adaptive grids with hint system
- **Advanced Maze** — Larger mazes with BFS-guided 3-step hints and hazard obstacles
- **Advanced Memory** — Extended sequences with Reverse Mode (repeat sequence backwards)
- **Logic Grid** — Detective-style deduction matrix with suspect/attribute matching
- **Pattern Puzzles** — Multi-attribute sequence completion (shapes, rotations, sizes)

### 👨‍👩‍👧 Parent Dashboard & Controls
- **Cognitive profile graphs** — skill levels, historical performance, and streaks
- **Screen-time management** — set daily play limits (15–120 minutes)
- **Brain Boost toggle** — enable or disable advanced challenges
- **Usage breakdown** — time spent per game per day
- **Explainable AI audit log** — see exactly why difficulty changed in plain language

### 🏆 Gamification & Rewards
- **XP & Level system** — earn points for completing challenges
- **Achievement badges** — Consistency Star, Challenge Hero, Speed Demon, and more
- **Streak tracking** — consecutive perfect-session streaks per game
- **Daily Brain Boost unlock** — special offer screen when eligibility criteria are met

### 🧒 Child-Friendly UX
- Colourful, emoji-rich interface with smooth micro-animations
- Avatar character selection (Fox, Cat, Bread, Monkey)
- Fully responsive — works on tablets, phones, and desktops
- No account or login required — profile stored locally in browser

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** v22 or later ([download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Priyanshi-2006/MindWeave.git
cd MindWeave

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser at **[http://localhost:8080](http://localhost:8080)**

> The port may change to 8081 or 8082 if 8080 is busy — check the terminal output.

### Building for Production

```bash
npm run build
```

The production output is placed in `.output/` and `.output/server/`.

---

## 🗂️ Project Structure

```
src/
├── assets/               # Character images (fox, cat, bread, monkey)
├── components/
│   ├── intelliplay/
│   │   ├── bonus/        # 5 bonus game components
│   │   └── shell.tsx     # App shell, game headers, round summary UI
│   └── ui/               # Reusable UI primitives (shadcn/ui)
├── lib/
│   └── intelliplay/
│       ├── types.ts      # All TypeScript types & difficulty interfaces
│       ├── engine.ts     # Adaptive difficulty algorithm
│       ├── bonus.ts      # Bonus eligibility, XP, badges
│       ├── store.tsx     # React context & localStorage persistence
│       └── avatars.ts    # Character avatar definitions
├── routes/
│   ├── index.tsx         # Home Hub (character select, game links, Brain Boost banner)
│   ├── dashboard.tsx     # Cognitive progress dashboard
│   ├── bonus.tsx         # Brain Boost offer & challenge play
│   ├── parent.tsx        # Parent controls & AI insights
│   ├── play.simon.tsx    # Simon Says game
│   ├── play.spot.tsx     # Spot the Difference game
│   ├── play.maze.tsx     # Maze Escape game
│   └── play.detective.tsx# Mini Detective game
└── styles.css            # Global design system & CSS variables
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) |
| Routing & SSR | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Build | [Vite 8](https://vite.dev/) |
| Language | TypeScript (strict mode) |
| Storage | Browser `localStorage` (no backend required) |

---

## 👩‍💻 Built By

**TEAM:MIND-WEAVE** — for Smart India Hackathon (SIH) 2026

> MindWeave adapts to every child's unique cognitive fingerprint, making learning feel like play.
