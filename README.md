# 🏴‍☠️ KeyHaki — Touch Typing & Vocabulary Mastery (One Piece Edition)

<p align="center">
  <img src="./public/chopper-logo.png" alt="KeyHaki Logo" width="130" />
</p>

<p align="center">
  <strong>An ultra-responsive, zero-login 10-finger touch typing application pairing professional typing pedagogy with Oxford 3000/5000 English vocabulary mastery and Wikipedia real-world story typing.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 🌟 Key Features

### 1. 🖐️ 10-Finger ANSI 60% Virtual Keyboard & Animated Hands
- **Color-Coded Finger Mapping:** Each column and finger corresponds to a dedicated color code across home row, top row, number row, and bottom row.
- **Physical Keypress Depression:** True mechanical key feel with `3px` downward translation, 3D bottom bevel, and active finger glow.
- **Translucent Hand Overlay:** Hands rest naturally on home row (`ASDF` and `JKL;`), with fingertips lighting up reactively as target keys are reached.
- **Opposite-Hand Shift Rule:** Enforces typing standard — when typing a capital letter or symbol on the left hand, the right pinky holds `Right Shift`, and vice versa.

### 2. 📖 Oxford 3000 & 5000 A–Z Vocabulary Timeline
- **A–Z Letter Navigation:** Left rail features quick-filter buttons (`All`, `A`, `B`... `K`... `Z`) to jump directly to target letter vocabularies.
- **Pedagogical Metadata:** Displays CEFR difficulty levels (`A1`, `A2`, `B1`, `B2`, `C1`), parts of speech, concise Oxford definitions, and natural collocations.
- **Automatic Sequential Progress:** Typing a target sentence automatically marks the word complete (`✓`), updates progress stats, persists to `localStorage`, and advances smoothly to the next word.

### 3. 📜 Wikipedia Real-World Stories Mode
- **Typing Beyond Single Words:** Practice typing full, narrative multi-line stories instead of isolated words.
- **Live Search & Autocomplete:** Search for any real-world topic — anime (*One Piece*, *Naruto*), tech stacks (*Python*, *React*, *Linux*), historical events (*Apollo 11*), or biographies (*Steve Jobs*).
- **Zero-Hallucination & Offline Cache:** Leverages the official Wikipedia REST API with in-memory deduplication and `localStorage` caching so completed stories load instantly without refetching.

### 4. 🧠 Word Nuances & Thematic Clusters (Dinner vs. Supper)
- **Conceptual Discrimination:** Teaches nuanced differences between closely related words (e.g. *Dinner* [main/formal meal] vs. *Supper* [light evening meal], *Swift* vs. *Hasty*).
- **Two-Stage Drills:**
  - **Stage 1:** Isolated vocabulary drill for muscle memory.
  - **Stage 2:** Contextual sentence typing applying each nuanced term.

### 5. 🎯 Clean Monospaced Typing Surface
- **Word-Level Wrapping:** Prevents words from breaking awkwardly mid-word using `inline-block whitespace-nowrap`.
- **Integrated Prompt Notch:** Displays active word definitions and context in a non-intrusive top pill.
- **Clear Line Breaks:** Natural line break indicators (`↵`) guide fingers when advancing across paragraphs.

### 6. 🔊 Zero-Latency Web Audio API Sound Synthesizer
- **Mechanical Switch Sounds:** Procedural sound synthesis mimicking high-end mechanical switches (`click` / `thock`) on space and letter keystrokes.
- **Biomechanical Error Alert:** Subtle low-frequency tone triggers immediately upon mistypes.
- **Zero Asset Overhead:** Generates all audio procedurally in the browser without loading external MP3/WAV files.

### 7. 🐾 KeyHaki Sensei (Tony Tony Chopper Coaching)
- Inspired by the beloved doctor from *One Piece*, **KeyHaki Sensei** observes typing streaks.
- On consecutive mistypes, Chopper pops up with biomechanical coaching (e.g. *"Reach for 'C' using your Left Middle finger. Keep other fingers anchored on home row!"*).

---

## 🏗️ Architecture & SOLID Principles

```
typing-app/
├── public/
│   ├── chopper-logo.png            <-- Official KeyHaki One Piece brand logo
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── keyboard/
│   │   │   ├── VirtualKeyboard.tsx <-- ANSI 60% mechanical keyboard grid
│   │   │   ├── Keycap.tsx          <-- 3D bevel keycap with finger glow
│   │   │   └── HandOverlay.tsx     <-- Translucent resting hands & active fingers
│   │   ├── layout/
│   │   │   ├── LeftRail.tsx        <-- Oxford A-Z timeline & Wikipedia stories
│   │   │   ├── RightSidebar.tsx    <-- Active word deep-dive & collocations drawer
│   │   │   └── FloatingControls.tsx<-- Sound, Hands, Theme & Fullscreen toggles
│   │   └── typing/
│   │       ├── TypingCard.tsx      <-- Clean word-wrapped typing container
│   │       ├── LiveStats.tsx       <-- Real-time net WPM, accuracy, streak
│   │       ├── MascotTip.tsx       <-- KeyHaki Sensei Chopper feedback bubble
│   │       └── CustomTextInput.tsx <-- Wikipedia story search & custom text modal
│   ├── hooks/
│   │   ├── useTypingEngine.ts      <-- Low-overhead keystroke state machine
│   │   └── useKeyboardAudio.ts     <-- Web Audio API click & error synthesizer
│   ├── lib/
│   │   ├── fingerMap.ts            <-- 10-finger color scheme & Shift rules
│   │   ├── oxfordDataset.ts        <-- Complete A-Z Oxford dataset & Everyday lessons
│   │   └── wikiStories.ts          <-- Wikipedia OpenSearch & Summary client
│   ├── store/
│   │   └── useTypingStore.ts       <-- Zustand store for preferences & best WPM
│   ├── App.tsx                     <-- Central layout & keyboard event coordinator
│   └── main.tsx                    <-- React 18 DOM mount point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

- **Single Responsibility (SRP):** Audio synthesis, keystroke mechanics, and layout rendering are strictly isolated.
- **Zero Redundant Rerenders:** Typing metrics, keycaps, and word spans utilize `React.memo` and targeted state updates to maintain consistent 60+ FPS during rapid typing.
- **Cache-First Persistence:** Oxford completion checkmarks and Wikipedia stories are persisted to browser `localStorage` to avoid unnecessary API requests.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `>= 18.0.0`
- **npm:** `>= 9.0.0`

### Installation & Local Development

1. **Clone the repository and navigate to the typing app:**
   ```bash
   cd minut/typing-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## ⌨️ Controls & Shortcuts

| Action | Control |
|---|---|
| **Toggle Audio Clicks** | Sound button (Top-Right Floating Bar) |
| **Toggle Hand Overlay** | Hand icon button (Top-Right Floating Bar) |
| **Toggle Dark/Light Mode**| Sun/Moon icon button |
| **Fullscreen Immersion** | Fullscreen expand icon button |
| **Restart Current Exercise**| Restart icon or `Tab` + `Enter` |
| **A–Z Word Timeline** | Left rail letter pills (`All`, `A`–`Z`) |
| **Switch Practice Mode** | Tabs in Left Rail: `Oxford`, `Stories`, or `Everyday` |

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
