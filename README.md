# 🧠 MindWeave — AI-Powered Adaptive Cognitive & Memory Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://mind-weave-eight.vercel.app?_vercel_share=WI8jvPRB2EtQqlrtgVtNSABZ4jVYVcUl)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase%20Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

🔗 **Live Application URL:**  
**[https://mind-weave-eight.vercel.app?_vercel_share=WI8jvPRB2EtQqlrtgVtNSABZ4jVYVcUl](https://mind-weave-eight.vercel.app?_vercel_share=WI8jvPRB2EtQqlrtgVtNSABZ4jVYVcUl)**

---

## 🌟 Overview

**MindWeave** is an intelligent, personalized cognitive stimulation and memory assistance platform. Powered by the proprietary **IntelliPlay Adaptive Engine**, MindWeave continuously observes performance metrics (accuracy, reaction time, error patterns, hesitation, and cognitive fatigue) to dynamically tailor challenge levels and scaffolding in real-time.

Designed with specialized care pathways for **cognitive enrichment** and **elderly dementia / cognitive support**, MindWeave makes cognitive therapy and mental agility feel engaging, calm, and empowering.

---

## 🚀 Key Features

### 🧩 1. Core Cognitive Activities
| Activity | Target Cognitive Domain | Description |
|---|---|---|
| **Path Navigation (Maze)** 🧭 | Spatial Navigation & Planning | Procedurally generated routes with adaptive complexity, obstacle management, and BFS-guided hints. |
| **Spot the Difference** 👀 | Visual Attention & Scanning | Compare dual scenes with subtle, dynamically generated visual variations calibrated to attention span. |
| **Memory Sequence (Simon)** 🎵 | Working Memory & Audio-Visual Recall | Multi-sensory pattern reproduction with dynamic sequence length, tempo, and palette adjustments. |
| **Story & Logic Detective** 🔎 | Logical Deduction & Language Comprehension | Mystery scenarios requiring contextual clue synthesis, deductive logic, and filtering of red herrings. |

---

### 👵 2. Senior & Dementia Cognitive Support Suite
MindWeave incorporates specialized assistive modules designed specifically for elderly users and early-stage dementia care:

- **☀️ Daily Orientation Check-In:** Calm, low-stress daily verification of current date, day of week, season, time of day, and weather patterns.
- **🖼️ Family Memory Recognition:** Interactive photo flashcard challenges to reinforce recognition of loved ones, family relationships, and personal life milestones.
- **📋 Daily Routine Sequencing:** Step-by-step sequencing exercises (e.g., morning tea, dental hygiene, medication routines) supporting daily independence.
- **💊 Medication & Health Reminders:** Daily task trackers for prescription schedules, hydration milestones, and wellness routines with easy check-off interfaces.
- **📸 Family Memory Vault:** Secure digital memory album where caregivers can upload photos, names, relations, locations, and cherished personal anecdotes.
- **🎙️ Senior Voice Assistant & Guidance:** Client-side speech synthesis (TTS) and speech recognition (STT) via Web Speech API with adjustable, slower cadence (0.75x–0.85x) tailored for senior auditory processing.
- **📉 Real-Time Cognitive Fatigue & Hesitation Tracking:** Monitors response slow-down ratios and error clusters to detect cognitive overload, prompting gentle break recommendations.
- **♿ Senior Accessibility Settings:** Extra-large typography, high-contrast visual modes, relaxed timing without rush counters, and simplified tactile touch targets.

---

### 🤖 3. IntelliPlay Adaptive AI Engine
- **Multi-Factor Real-Time Scoring:** Adjusts difficulty parameters after each round using accuracy, reaction latency, hint frequency, and mistake categorization.
- **11-Dimensional Cognitive Skill Matrix:** Tracks *Spatial Navigation*, *Visual Attention*, *Working Memory*, *Logical Reasoning*, *Problem Solving*, *Response Control*, *Focus & Concentration*, *Daily Orientation*, *Family Recognition*, *Language Recall*, and *Routine Sequencing*.
- **5 Dynamic Ability Bands:** Seamless transitions across `Excelling`, `Strong`, `Optimal`, `Struggling`, and `Overwhelmed`.
- **Explainable AI (XAI) Audit Log:** Every difficulty adjustment includes human-readable, transparent rationales explaining the exact reasons for scaffolding or difficulty increases.
- **Cross-Domain Skill Transfer:** Breakthroughs in one domain (e.g., spatial navigation) dynamically inform initial difficulty parameters in correlated domains.

---

### 🏆 4. Brain Boost Advanced Challenges
Unlocked when users demonstrate sustained mastery:
- **🧩 Advanced Sudoku:** 4×4, 6×6, and 9×9 adaptive numerical grids with contextual hint algorithms.
- **🗺️ Advanced Route:** Multi-path mazes with dynamic obstacle hazards and step-by-step pathfinding assists.
- **🧠 Advanced Memory with Reverse Recall:** Long-form memory patterns featuring reverse-order recall modes.
- **🔗 Logic Grid Puzzle:** Matrix deduction challenges matching suspects, attributes, and scenarios.
- **🔢 Pattern Sequence:** Multi-variable pattern completion analyzing rotational, geometric, and numerical progressions.

---

### 🛡️ 5. Caregiver & Family Portal
- **Cognitive Radar & Trajectory Visualizations:** Interactive Recharts radar charts and session-by-session trendlines.
- **Guidance & Support Levels:** One-click configuration between `Independent`, `Guided`, and `High-Support` modes.
- **Screen Time & Fatigue Limits:** Configurable daily activity quotas (15–120 minutes) with auto-pausing.
- **Caregiver Audit Feed:** Comprehensive log of session history, accuracy distributions, and AI adjustment rationales.

---

### 🔐 6. Authentication & Cloud Sync
- **Firebase Auth:** Secure Google OAuth and Email/Password sign-in.
- **Cloud Firestore & TanStack Server Functions:** Server-validated profile storage with automatic offline fallback to local storage.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Fullstack Meta-Framework** | [TanStack Start](https://tanstack.com/start) (Nitro / Vite SSR) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (File-based, Type-safe) |
| **State & Data Fetching** | [TanStack Query](https://tanstack.com/query) + React Context Store |
| **Styling & UI System** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + Lucide Icons |
| **Data Visualizations** | [Recharts](https://recharts.org/) |
| **Authentication & Database** | [Firebase Auth](https://firebase.google.com/docs/auth) & [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| **Speech & Accessibility** | Browser-Native Web Speech API (TTS + STT) |
| **Build & Bundler** | [Vite 8](https://vite.dev/) |
| **Language** | TypeScript (Strict Mode) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🗂️ Project Structure

```
MindWeave/
├── public/                     # Static icons, favicons, and manifest
├── src/
│   ├── assets/                 # Character avatars, illustrations, and logos
│   ├── components/
│   │   ├── intelliplay/
│   │   │   ├── bonus/          # 5 Brain Boost mini-game components
│   │   │   │   ├── AdvMazeGame.tsx
│   │   │   │   ├── AdvMemoryGame.tsx
│   │   │   │   ├── LogicGridGame.tsx
│   │   │   │   ├── PatternGame.tsx
│   │   │   │   └── SudokuGame.tsx
│   │   │   ├── SeniorVoiceBar.tsx # Senior voice guidance & speech UI
│   │   │   └── shell.tsx       # App navigation, game shells, round summary modals
│   │   ├── ui/                 # Accessible Radix UI design primitives
│   │   └── SplashScreen.tsx    # Branded initial application loader
│   ├── lib/
│   │   ├── intelliplay/
│   │   │   ├── avatars.ts      # Profile avatar definitions
│   │   │   ├── bonus.ts        # Bonus game unlocking rules, XP, badges
│   │   │   ├── engine.ts       # IntelliPlay real-time cognitive adaptation engine
│   │   │   ├── fatigue.ts      # Fatigue, hesitation & reaction time tracker
│   │   │   ├── memoryVault.ts  # Memory flashcards storage & manager
│   │   │   ├── reminderVault.ts# Medication & daily routine reminder manager
│   │   │   ├── serverFunctions.ts # TanStack Start server functions (Firestore sync)
│   │   │   ├── store.tsx       # Profile context provider & local/cloud sync
│   │   │   ├── types.ts        # Comprehensive TypeScript types & difficulty maps
│   │   │   └── voiceAssistant.ts # Web Speech API TTS & STT integration
│   │   ├── db.ts               # Server-side Firebase Firestore connection
│   │   ├── error-reporting.ts  # Runtime error telemetry
│   │   ├── firebase.ts         # Client Firebase initialization
│   │   └── utils.ts            # UI helper functions (clsx, tailwind-merge)
│   ├── routes/
│   │   ├── __root.tsx          # Root layout, head metadata, query provider
│   │   ├── index.tsx           # Main Hub & Activity Selector
│   │   ├── login.tsx           # Authentication (Google & Email/Password)
│   │   ├── dashboard.tsx       # Cognitive progress charts & skill radars
│   │   ├── caregiver.tsx       # Caregiver control panel, settings & insights
│   │   ├── memories.tsx        # Family Memory Vault viewer & editor
│   │   ├── reminders.tsx       # Medication & Routine checklist
│   │   ├── bonus.tsx           # Brain Boost challenges launcher
│   │   ├── play.maze.tsx       # Path Navigation Game
│   │   ├── play.spot.tsx       # Spot the Difference Game
│   │   ├── play.simon.tsx      # Memory Sequence Game
│   │   ├── play.detective.tsx  # Story & Logic Detective Game
│   │   ├── play.orientation.tsx# Daily Orientation Check-In
│   │   ├── play.memory.tsx     # Family Memory Flashcard Recall Game
│   │   └── play.sequencing.tsx # Daily Routine Sequencing Game
│   ├── router.tsx              # TanStack Router instance configuration
│   └── styles.css              # Design tokens, color palettes & accessibility styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js** v20 or later ([Download Node.js](https://nodejs.org/))
- **npm** or **bun** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Priyanshi-2006/MindWeave.git
   cd MindWeave
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables (Optional for Cloud Sync):**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-client-email@project.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   *(Note: The application includes client-side localStorage fallback, so it runs seamlessly even without Firebase Admin server keys configured).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:8080](http://localhost:8080) (or the port specified in terminal output).

---

## 🏗️ Production Build

To build the application for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 👥 Authors & Acknowledgments

**TEAM MIND-WEAVE** — Smart India Hackathon (SIH) 2026

*“MindWeave bridges generations through adaptive cognitive play, preserving memories and empowering minds at every stage of life.”*
