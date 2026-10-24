import { create } from 'zustand';

export type PracticeMode = 'vocab' | 'everyday' | 'custom';

interface TypingStoreState {
  mode: PracticeMode;
  setMode: (mode: PracticeMode) => void;
  customText: string;
  setCustomText: (text: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  handsVisible: boolean;
  toggleHands: () => void;
  keyboardVisible: boolean;
  toggleKeyboard: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  bestWpm: number;
  recordBestWpm: (wpm: number) => void;
}

export const useTypingStore = create<TypingStoreState>((set) => {
  // Read initial from localStorage if available
    const storedTheme =
    typeof window !== 'undefined'
      ? (localStorage.getItem('keyhaki-theme') as 'dark' | 'light') ||
        (localStorage.getItem('typecat-theme') as 'dark' | 'light') ||
        'dark'
      : 'dark';

  const storedBestWpm =
    typeof window !== 'undefined'
      ? parseInt(
          localStorage.getItem('keyhaki-best-wpm') ||
            localStorage.getItem('typecat-best-wpm') ||
            '0',
          10
        )
      : 0;

  return {
    mode: 'vocab',
    setMode: (mode) => set({ mode }),
    customText: '',
    setCustomText: (customText) => set({ customText }),
    soundEnabled: true,
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    handsVisible: true,
    toggleHands: () => set((state) => ({ handsVisible: !state.handsVisible })),
    keyboardVisible: true,
    toggleKeyboard: () => set((state) => ({ keyboardVisible: !state.keyboardVisible })),
    theme: storedTheme,
    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('keyhaki-theme', nextTheme);
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { theme: nextTheme };
      }),
    bestWpm: storedBestWpm,
    recordBestWpm: (wpm) =>
      set((state) => {
        if (wpm > state.bestWpm) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('keyhaki-best-wpm', wpm.toString());
          }
          return { bestWpm: wpm };
        }
        return state;
      }),
  };
});
