import React, { useMemo } from 'react';
import { FINGER_CONFIGS, findKeyDetails } from '@/lib/fingerMap';

interface MascotTipProps {
  consecutiveErrors: number;
  lastMistypedChar: string | null;
  targetChar: string;
}

export const MascotTip = React.memo<MascotTipProps>(function MascotTip({
  consecutiveErrors,
  lastMistypedChar,
  targetChar,
}) {
  const tip = useMemo(() => {
    if (consecutiveErrors >= 2 && lastMistypedChar) {
      if (lastMistypedChar === ' ') {
        return 'Space is your thumb! Use either left or right thumb to hit the spacebar.';
      }
      const details = findKeyDetails(lastMistypedChar);
      const fingerName = FINGER_CONFIGS[details.targetFinger].name;
      if (details.needsShift) {
        return `For "${lastMistypedChar}", press ${details.requiredShiftCode === 'ShiftLeft' ? 'Left Shift' : 'Right Shift'} with your pinky, then press with your ${fingerName}.`;
      }
      return `Reach for "${lastMistypedChar}" using your ${fingerName}. Keep other fingers anchored on home row!`;
    }

    if (targetChar === ' ') {
      return 'Hit Space with your thumb to advance to the next word!';
    }

    return 'Keep your fingers resting comfortably on ASDF and JKL;';
  }, [consecutiveErrors, lastMistypedChar, targetChar]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/70 border border-border/80 shadow-sm backdrop-blur-sm">
      {/* Animated Tony Tony Chopper Mascot Avatar */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shadow-sm">
        <img
          src="/chopper-logo.png"
          alt="Chopper KeyHaki Sensei"
          className="w-10 h-10 object-contain drop-shadow transition-transform hover:scale-110 animate-bounce"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Reactive Speech Bubble */}
      <div className="flex-1 text-xs sm:text-sm text-foreground/90 font-medium">
        <span className="font-bold text-primary mr-1">KeyHaki Sensei:</span>
        <span className={consecutiveErrors >= 2 ? 'text-rose-500 font-semibold' : ''}>
          {tip}
        </span>
      </div>
    </div>
  );
});
