import React from 'react';
import { KeyDefinition, FINGER_CONFIGS } from '@/lib/fingerMap';
import { cn } from '@/lib/utils';

interface KeycapProps {
  keyDef: KeyDefinition;
  isActive: boolean;
  isShiftRequired: boolean;
  isPhysicallyPressed: boolean;
}

export const Keycap = React.memo<KeycapProps>(function Keycap({
  keyDef,
  isActive,
  isShiftRequired,
  isPhysicallyPressed,
}) {
  const finger = FINGER_CONFIGS[keyDef.finger];
  const isTarget = isActive || isShiftRequired;

  // FIX: Only display secondary shifted symbol if it is NOT the uppercase version of the primary letter — AI/2026-10-24
  // WHY: On real mechanical keyboards, letter keys only show one clean bold letter (e.g. 'A', 'Q', 'W'). Only dual-symbol keys like '1/!' show both.
  const hasDualSymbol = Boolean(
    keyDef.shifted && keyDef.shifted.toLowerCase() !== keyDef.primary.toLowerCase()
  );

  const isSpaceKey = keyDef.code === 'Space';

  return (
    <div
      style={{
        borderColor: isTarget ? finger.color : undefined,
        boxShadow: isTarget
          ? `0 0 18px ${finger.color}90, inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 0 0 rgba(0,0,0,0.3)`
          : undefined,
        backgroundColor: isTarget ? finger.color : undefined,
      }}
      className={cn(
        'relative flex flex-col items-center justify-center select-none font-mono rounded-lg border text-xs sm:text-sm font-semibold h-11 sm:h-12 keycap-transition cursor-default',
        keyDef.width || 'w-9 sm:w-11',
        // Inactive base styles with 3D mechanical keycap bevel & depth
        !isTarget &&
          'bg-gradient-to-b from-card via-card to-secondary/80 border-border/80 text-foreground/85 shadow-[0_4px_0_0_rgba(0,0,0,0.25),0_6px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.6),0_6px_12px_rgba(0,0,0,0.35)] hover:brightness-105 active:translate-y-[2px]',
        // Physical keypress depression animation (travels down into the switch)
        isPhysicallyPressed &&
          'translate-y-[4px] shadow-[0_0_0_0_rgba(0,0,0,0)] brightness-110 scale-[0.98]',
        // Target keycap state (bold, white text, glowing 3D switch)
        isTarget &&
          'text-white font-black z-10 shadow-[0_4px_0_0_rgba(0,0,0,0.35)] animate-pulse'
      )}
    >
      {/* Shifted symbol (top left) — only on dual-symbol punctuation/number keys */}
      {hasDualSymbol && (
        <span
          className={cn(
            'absolute top-1 left-1.5 text-[9px] sm:text-[10px] leading-none',
            isShiftRequired ? 'text-white font-black scale-110' : isTarget ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          {keyDef.shifted}
        </span>
      )}

      {/* Primary key label — clean single uppercase letter or symbol */}
      {isSpaceKey ? (
        <span className="w-16 h-1 rounded-full bg-muted-foreground/30" />
      ) : (
        <span
          className={cn(
            'uppercase tracking-wide font-bold',
            hasDualSymbol ? 'mt-2 text-[11px] sm:text-[12px]' : 'text-xs sm:text-sm',
            isTarget ? 'text-white font-extrabold' : ''
          )}
        >
          {keyDef.primary}
        </span>
      )}

      {/* Tactile homing bump for F and J */}
      {keyDef.isHoming && (
        <span
          className={cn(
            'absolute bottom-1 w-3 sm:w-3.5 h-[2px] rounded-full',
            isTarget ? 'bg-white' : 'bg-muted-foreground/60'
          )}
          title="Home Row Homing Bump"
        />
      )}

      {/* Finger color badge on bottom edge */}
      {!isTarget && (
        <span
          style={{ backgroundColor: finger.color }}
          className="absolute -bottom-[1px] w-2 sm:w-2.5 h-[2.5px] rounded-full opacity-70"
        />
      )}
    </div>
  );
});
