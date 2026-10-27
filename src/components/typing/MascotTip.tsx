import React, { useMemo } from 'react';
import { FINGER_CONFIGS, findKeyDetails } from '@/lib/fingerMap';

interface MascotTipProps {
  consecutiveErrors: number;
  lastMistypedChar?: string | null;
  targetChar: string;
}

export const MascotTip = React.memo<MascotTipProps>(function MascotTip({
  consecutiveErrors,
  targetChar,
}) {
  const tip = useMemo(() => {
    if (consecutiveErrors >= 2 && targetChar) {
      if (targetChar === ' ') {
        return 'Press Space with your thumb.';
      }
      const details = findKeyDetails(targetChar);
      const fingerName = FINGER_CONFIGS[details.targetFinger].name;
      if (details.needsShift) {
        return `Hold Shift and press "${targetChar}" with ${fingerName}.`;
      }
      return `Reach for "${targetChar}" with ${fingerName}.`;
    }

    return null;
  }, [consecutiveErrors, targetChar]);

  if (!tip) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card/80 border border-border shadow-sm backdrop-blur-sm">
      <div className="relative flex-shrink-0 w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
        <img
          src="/chopper-logo.png"
          alt="Sensei"
          className="w-7 h-7 object-contain"
        />
      </div>

      <div className="text-xs text-foreground/90 font-medium">
        <span className="text-rose-500 font-semibold">{tip}</span>
      </div>
    </div>
  );
});
