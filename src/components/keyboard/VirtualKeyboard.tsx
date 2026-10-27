import React, { useMemo, useState, useEffect } from 'react';
import { ANSI_KEYBOARD_ROWS, findKeyDetails, FingerId } from '@/lib/fingerMap';
import { Keycap } from './Keycap';
import { HandOverlay } from './HandOverlay';

interface VirtualKeyboardProps {
  targetChar: string;
  showHands?: boolean;
}

export const VirtualKeyboard = React.memo<VirtualKeyboardProps>(function VirtualKeyboard({
  targetChar,
  showHands = true,
}) {
  const [physicallyPressedCodes, setPhysicallyPressedCodes] = useState<Set<string>>(new Set());

  // Listen to physical keydown and keyup for visual keypress depression
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      setPhysicallyPressedCodes((prev) => {
        if (prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPhysicallyPressedCodes((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const { keyDef, needsShift, requiredShiftCode, targetFinger } = useMemo(
    () => findKeyDetails(targetChar),
    [targetChar]
  );

  const requiredShiftFinger: FingerId | undefined = useMemo(() => {
    if (!needsShift || !requiredShiftCode) return undefined;
    return requiredShiftCode === 'ShiftLeft' ? 'left_pinky' : 'right_pinky';
  }, [needsShift, requiredShiftCode]);

  return (
    <div className="relative w-full max-w-4xl mx-auto [perspective:1100px] select-none my-1">
      {/* 3D Tilted Mechanical Keyboard Chassis */}
      <div className="relative w-full flex flex-col items-center justify-center p-3 sm:p-5 pt-4 rounded-3xl bg-card/95 backdrop-blur-md border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.25),0_8px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out [transform:rotateX(14deg)] [transform-style:preserve-3d]">
        {/* 3D Keyboard Rows */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center gap-1.5 sm:gap-2">
          {ANSI_KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
              {row.map((k) => {
                const isTarget = keyDef?.code === k.code;
                const isShiftKey = needsShift && k.code === requiredShiftCode;
                const isPhysicallyPressed = physicallyPressedCodes.has(k.code);

                return (
                  <Keycap
                    key={k.code}
                    keyDef={k}
                    isActive={isTarget}
                    isShiftRequired={Boolean(isShiftKey)}
                    isPhysicallyPressed={isPhysicallyPressed}
                  />
                );
              })}
            </div>
          ))}

          {/* Realistic Translucent Hands Overlaid Directly On Top of the Keycaps */}
          {showHands && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
              <HandOverlay
                targetFinger={targetFinger}
                needsShift={needsShift}
                requiredShiftFinger={requiredShiftFinger}
              />
            </div>
          )}
        </div>

        {/* Minimal Shift Indicator only when Shift is needed */}
        {needsShift && (
          <div className="relative z-10 mt-2 flex items-center justify-center w-full">
            <span className="text-[11px] text-rose-500 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              {requiredShiftCode === 'ShiftLeft' ? 'Left Shift' : 'Right Shift'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
