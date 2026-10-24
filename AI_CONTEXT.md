# AI Context — KeyHaki (One Piece Inspired Touch-Typing & Vocabulary Mastery)

## 1. Module Overview
This module is an ultra-responsive, zero-login touch-typing application (**KeyHaki**) pairing **The Typing Cat's 10-finger pedagogy** (color-coded keyboard, animated hand guide, opposite-hand Shift rule) with **One Piece inspired Chopper mascot guidance**, **Oxford 3000/5000 wordlist timeline**, **Wikipedia Real-World Stories mode**, and **custom text practice**.

## 2. Architecture & Design Principles (SOLID)
- **Single Responsibility Principle (SRP)**:
  - `useTypingEngine`: Strictly handles character indexing, keystroke events, and raw timing.
  - `useKeyboardAudio`: Dedicated Web Audio API synthesizer for mechanical clicks and errors.
  - `useDictionary`: Fetches and caches word definitions, phonetics, audio, and example sentences.
  - `VirtualKeyboard`: Purely visual rendering of the keycaps and active finger state.
  - `HandGuide`: Pure SVG bone visualization of hand posture and active finger articulation.
- **Open/Closed Principle (OCP)**:
  - Keyboard layout is decoupled via layout definition strategies (`qwertyLayout`, `dvorakLayout`, `colemakLayout`).
- **Interface Segregation & Dependency Inversion**:
  - Components communicate via clean TypeScript interfaces and lightweight Zustand stores.
- **Zero Unnecessary Re-renders (Performance Optimization)**:
  - Keystroke events update target character and active key through targeted state selectors or ref-driven/memoized components.
  - Virtual keyboard does NOT re-render on every keystroke if the target finger hasn't changed.
  - Character stream renders each word/character with `React.memo` to avoid re-rendering entire paragraphs.

## 3. Key Files & Structure
```
typing-app/
├── AI_CONTEXT.md                      <-- This module context file
├── package.json                       <-- Vite + React + TypeScript + Tailwind + Lucide + Shadcn
├── public/
│   └── chopper-logo.png               <-- One Piece Tony Tony Chopper logo
├── src/
│   ├── components/
│   │   ├── ui/                        <-- Shadcn UI primitives (Button, Card, Dialog, Badge)
│   │   ├── typing/
│   │   │   ├── TypingCard.tsx         <-- Monospaced character stream, word wrapping & cursor
│   │   │   ├── LiveStats.tsx          <-- Real-time net WPM, accuracy, progress
│   │   │   ├── MascotTip.tsx          <-- Tony Tony Chopper KeyHaki Sensei error coaching
│   │   │   └── CustomTextInput.tsx    <-- Wikipedia Stories live search & custom text dialog
│   │   ├── keyboard/
│   │   │   ├── VirtualKeyboard.tsx    <-- ANSI 60% mechanical keycaps & active states
│   │   │   ├── Keycap.tsx             <-- 3D bevel keycap with finger glow
│   │   │   └── HandOverlay.tsx        <-- Translucent resting hands directly over keycaps
│   │   └── layout/
│   │       ├── LeftRail.tsx           <-- Oxford A-Z timeline, letter jump & Wikipedia stories
│   │       ├── RightSidebar.tsx       <-- Active word deep-dive, definitions & collocations
│   │       └── FloatingControls.tsx   <-- Sound, hands, fullscreen & theme controls
│   ├── hooks/
│   │   ├── useTypingEngine.ts         <-- Real-time typing state machine with completion guard
│   │   └── useKeyboardAudio.ts        <-- Procedural Web Audio API click & error synthesizer
│   ├── lib/
│   │   ├── fingerMap.ts               <-- 10-finger ANSI mapping & opposite Shift rules
│   │   ├── oxfordDataset.ts           <-- Complete A-Z Oxford dataset & Everyday lessons
│   │   ├── wikiStories.ts             <-- Wikipedia REST API OpenSearch + Summary service
│   │   └── utils.ts                   <-- Tailwind class merge helper
│   ├── store/
│   │   └── useTypingStore.ts          <-- Zustand state for practice mode & preferences
│   ├── App.tsx                        <-- Root layout coordinator
│   └── main.tsx
```

## 4. Data Flow
1. **Source Selection**: User selects "Oxford Vocab", "Everyday Messages", or "Custom Text".
2. **Text Preparation**: Target sentence is sliced into tokens with target finger and Shift state metadata.
3. **Keystroke Loop**:
   - `keydown` captured -> evaluated against `targetText[cursorIndex]`.
   - Matching keystroke: audio click triggers via Web Audio -> cursor advances -> updates memoized character span.
   - Mistake keystroke: error sound triggers -> error counter increments -> error streak triggers mascot tip.
4. **Visual Guidance**:
   - `targetChar` determines `activeKey` and `activeFinger`.
   - If uppercase/symbol, `activeModifier` (opposite Shift) lights up with corresponding pinky color.
5. **Session Complete**: Computes Net WPM, Accuracy, displays score modal with "Next Word / Next Lesson" trigger.

## 5. Known Edge Cases & Mitigations
- **Page Scroll on Spacebar**: Mitigated with `e.preventDefault()` inside active typing state.
- **Browser Audio Context Suspension**: Automatically resumes `AudioContext` on the first user interaction.
- **Fast Typists (100+ WPM)**: State updates batched; Web Audio oscillators spawned on micro-lifetimes (40ms) without clipping.
- **Dictionary API Outages**: Fallback to bundled Oxford 3000 offline definitions.
