export type FingerId =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'left_thumb'
  | 'right_thumb'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky';

export interface FingerConfig {
  id: FingerId;
  name: string;
  hand: 'left' | 'right';
  color: string;       // HEX for SVG/direct styles
  tailwindColor: string; // Tailwind class
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
}

export const FINGER_CONFIGS: Record<FingerId, FingerConfig> = {
  left_pinky: {
    id: 'left_pinky',
    name: 'Left Pinky',
    hand: 'left',
    color: '#f43f5e',
    tailwindColor: 'text-rose-500',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderLight: 'border-rose-400',
    borderDark: 'dark:border-rose-500/50',
  },
  left_ring: {
    id: 'left_ring',
    name: 'Left Ring',
    hand: 'left',
    color: '#f97316',
    tailwindColor: 'text-orange-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    borderLight: 'border-orange-400',
    borderDark: 'dark:border-orange-500/50',
  },
  left_middle: {
    id: 'left_middle',
    name: 'Left Middle',
    hand: 'left',
    color: '#f59e0b',
    tailwindColor: 'text-amber-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-400',
    borderDark: 'dark:border-amber-500/50',
  },
  left_index: {
    id: 'left_index',
    name: 'Left Index',
    hand: 'left',
    color: '#10b981',
    tailwindColor: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-400',
    borderDark: 'dark:border-emerald-500/50',
  },
  left_thumb: {
    id: 'left_thumb',
    name: 'Left Thumb',
    hand: 'left',
    color: '#06b6d4',
    tailwindColor: 'text-cyan-500',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderLight: 'border-cyan-400',
    borderDark: 'dark:border-cyan-500/50',
  },
  right_thumb: {
    id: 'right_thumb',
    name: 'Right Thumb',
    hand: 'right',
    color: '#06b6d4',
    tailwindColor: 'text-cyan-500',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderLight: 'border-cyan-400',
    borderDark: 'dark:border-cyan-500/50',
  },
  right_index: {
    id: 'right_index',
    name: 'Right Index',
    hand: 'right',
    color: '#3b82f6',
    tailwindColor: 'text-blue-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-400',
    borderDark: 'dark:border-blue-500/50',
  },
  right_middle: {
    id: 'right_middle',
    name: 'Right Middle',
    hand: 'right',
    color: '#8b5cf6',
    tailwindColor: 'text-violet-500',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderLight: 'border-violet-400',
    borderDark: 'dark:border-violet-500/50',
  },
  right_ring: {
    id: 'right_ring',
    name: 'Right Ring',
    hand: 'right',
    color: '#a855f7',
    tailwindColor: 'text-purple-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-purple-400',
    borderDark: 'dark:border-purple-500/50',
  },
  right_pinky: {
    id: 'right_pinky',
    name: 'Right Pinky',
    hand: 'right',
    color: '#ec4899',
    tailwindColor: 'text-pink-500',
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-950/40',
    borderLight: 'border-pink-400',
    borderDark: 'dark:border-pink-500/50',
  },
};

export interface KeyDefinition {
  code: string;         // e.g. "KeyQ", "Digit1", "Space"
  primary: string;      // Lowercase / primary label
  shifted?: string;     // Uppercase / shifted symbol
  finger: FingerId;
  width?: string;       // default "w-10 sm:w-12" or custom for Shift/Tab/Space
  isHoming?: boolean;   // 'F' or 'J' tactile bump
}

export const ANSI_KEYBOARD_ROWS: KeyDefinition[][] = [
  // Number Row
  [
    { code: 'Backquote', primary: '`', shifted: '~', finger: 'left_pinky' },
    { code: 'Digit1', primary: '1', shifted: '!', finger: 'left_pinky' },
    { code: 'Digit2', primary: '2', shifted: '@', finger: 'left_ring' },
    { code: 'Digit3', primary: '3', shifted: '#', finger: 'left_middle' },
    { code: 'Digit4', primary: '4', shifted: '$', finger: 'left_index' },
    { code: 'Digit5', primary: '5', shifted: '%', finger: 'left_index' },
    { code: 'Digit6', primary: '6', shifted: '^', finger: 'right_index' },
    { code: 'Digit7', primary: '7', shifted: '&', finger: 'right_index' },
    { code: 'Digit8', primary: '8', shifted: '*', finger: 'right_middle' },
    { code: 'Digit9', primary: '9', shifted: '(', finger: 'right_ring' },
    { code: 'Digit0', primary: '0', shifted: ')', finger: 'right_pinky' },
    { code: 'Minus', primary: '-', shifted: '_', finger: 'right_pinky' },
    { code: 'Equal', primary: '=', shifted: '+', finger: 'right_pinky' },
    { code: 'Backspace', primary: 'Backspace', finger: 'right_pinky', width: 'w-16 sm:w-20' },
  ],
  // Top / Upper Row
  [
    { code: 'Tab', primary: 'Tab', finger: 'left_pinky', width: 'w-14 sm:w-16' },
    { code: 'KeyQ', primary: 'q', shifted: 'Q', finger: 'left_pinky' },
    { code: 'KeyW', primary: 'w', shifted: 'W', finger: 'left_ring' },
    { code: 'KeyE', primary: 'e', shifted: 'E', finger: 'left_middle' },
    { code: 'KeyR', primary: 'r', shifted: 'R', finger: 'left_index' },
    { code: 'KeyT', primary: 't', shifted: 'T', finger: 'left_index' },
    { code: 'KeyY', primary: 'y', shifted: 'Y', finger: 'right_index' },
    { code: 'KeyU', primary: 'u', shifted: 'U', finger: 'right_index' },
    { code: 'KeyI', primary: 'i', shifted: 'I', finger: 'right_middle' },
    { code: 'KeyO', primary: 'o', shifted: 'O', finger: 'right_ring' },
    { code: 'KeyP', primary: 'p', shifted: 'P', finger: 'right_pinky' },
    { code: 'BracketLeft', primary: '[', shifted: '{', finger: 'right_pinky' },
    { code: 'BracketRight', primary: ']', shifted: '}', finger: 'right_pinky' },
    { code: 'Backslash', primary: '\\', shifted: '|', finger: 'right_pinky', width: 'w-12 sm:w-14' },
  ],
  // Home Row
  [
    { code: 'CapsLock', primary: 'Caps', finger: 'left_pinky', width: 'w-16 sm:w-18' },
    { code: 'KeyA', primary: 'a', shifted: 'A', finger: 'left_pinky' },
    { code: 'KeyS', primary: 's', shifted: 'S', finger: 'left_ring' },
    { code: 'KeyD', primary: 'd', shifted: 'D', finger: 'left_middle' },
    { code: 'KeyF', primary: 'f', shifted: 'F', finger: 'left_index', isHoming: true },
    { code: 'KeyG', primary: 'g', shifted: 'G', finger: 'left_index' },
    { code: 'KeyH', primary: 'h', shifted: 'H', finger: 'right_index' },
    { code: 'KeyJ', primary: 'j', shifted: 'J', finger: 'right_index', isHoming: true },
    { code: 'KeyK', primary: 'k', shifted: 'K', finger: 'right_middle' },
    { code: 'KeyL', primary: 'l', shifted: 'L', finger: 'right_ring' },
    { code: 'Semicolon', primary: ';', shifted: ':', finger: 'right_pinky' },
    { code: 'Quote', primary: "'", shifted: '"', finger: 'right_pinky' },
    { code: 'Enter', primary: 'Enter', finger: 'right_pinky', width: 'w-16 sm:w-20' },
  ],
  // Bottom Row
  [
    { code: 'ShiftLeft', primary: 'Shift', finger: 'left_pinky', width: 'w-20 sm:w-24' },
    { code: 'KeyZ', primary: 'z', shifted: 'Z', finger: 'left_pinky' },
    { code: 'KeyX', primary: 'x', shifted: 'X', finger: 'left_ring' },
    { code: 'KeyC', primary: 'c', shifted: 'C', finger: 'left_middle' },
    { code: 'KeyV', primary: 'v', shifted: 'V', finger: 'left_index' },
    { code: 'KeyB', primary: 'b', shifted: 'B', finger: 'left_index' },
    { code: 'KeyN', primary: 'n', shifted: 'N', finger: 'right_index' },
    { code: 'KeyM', primary: 'm', shifted: 'M', finger: 'right_index' },
    { code: 'Comma', primary: ',', shifted: '<', finger: 'right_middle' },
    { code: 'Period', primary: '.', shifted: '>', finger: 'right_ring' },
    { code: 'Slash', primary: '/', shifted: '?', finger: 'right_pinky' },
    { code: 'ShiftRight', primary: 'Shift', finger: 'right_pinky', width: 'w-20 sm:w-24' },
  ],
  // Space Row
  [
    { code: 'ControlLeft', primary: 'Ctrl', finger: 'left_pinky', width: 'w-12 sm:w-14' },
    { code: 'AltLeft', primary: 'Alt', finger: 'left_thumb', width: 'w-12 sm:w-14' },
    { code: 'Space', primary: 'Space', finger: 'right_thumb', width: 'flex-1 max-w-sm' },
    { code: 'AltRight', primary: 'Alt', finger: 'right_thumb', width: 'w-12 sm:w-14' },
    { code: 'ControlRight', primary: 'Ctrl', finger: 'right_pinky', width: 'w-12 sm:w-14' },
  ],
];

// Helper to find key details by character
export function findKeyDetails(char: string): {
  keyDef: KeyDefinition | null;
  needsShift: boolean;
  requiredShiftCode: 'ShiftLeft' | 'ShiftRight' | null;
  targetFinger: FingerId;
} {
  if (char === ' ') {
    return {
      keyDef: { code: 'Space', primary: 'Space', finger: 'right_thumb' },
      needsShift: false,
      requiredShiftCode: null,
      targetFinger: 'right_thumb',
    };
  }

  for (const row of ANSI_KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.primary === char) {
        return {
          keyDef: key,
          needsShift: false,
          requiredShiftCode: null,
          targetFinger: key.finger,
        };
      }
      if (key.shifted === char) {
        // OPPOSITE HAND SHIFT RULE:
        // If target key is on Left Hand, use ShiftRight (Right Pinky).
        // If target key is on Right Hand, use ShiftLeft (Left Pinky).
        const targetHand = FINGER_CONFIGS[key.finger].hand;
        const requiredShiftCode = targetHand === 'left' ? 'ShiftRight' : 'ShiftLeft';

        return {
          keyDef: key,
          needsShift: true,
          requiredShiftCode,
          targetFinger: key.finger,
        };
      }
    }
  }

  // Fallback for uncommon or special characters
  return {
    keyDef: null,
    needsShift: false,
    requiredShiftCode: null,
    targetFinger: 'right_index',
  };
}
