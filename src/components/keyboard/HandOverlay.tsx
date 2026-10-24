import React from 'react';
import { FingerId, FINGER_CONFIGS } from '@/lib/fingerMap';

interface HandOverlayProps {
  targetFinger: FingerId;
  needsShift: boolean;
  requiredShiftFinger?: FingerId;
}

export const HandOverlay = React.memo<HandOverlayProps>(function HandOverlay({
  targetFinger,
  needsShift,
  requiredShiftFinger,
}) {
  const isFingerActive = (fingerId: FingerId) => {
    return fingerId === targetFinger || (needsShift && fingerId === requiredShiftFinger);
  };

  const isRightShiftActive = needsShift && requiredShiftFinger === 'right_pinky';
  const isLeftShiftActive = needsShift && requiredShiftFinger === 'left_pinky';

  // Coordinated fingertips calibrated directly above keyboard home rows
  const leftFingers: Array<{ id: FingerId; cx: number; cy: number; r: number }> = [
    { id: 'left_pinky', cx: isLeftShiftActive ? 52 : 78, cy: isLeftShiftActive ? 122 : 110, r: 12 },    // Over 'A' / Shift
    { id: 'left_ring', cx: 112, cy: 92, r: 13 },     // Over 'S'
    { id: 'left_middle', cx: 148, cy: 80, r: 14 },   // Over 'D'
    { id: 'left_index', cx: 184, cy: 95, r: 13 },    // Over 'F'
    { id: 'left_thumb', cx: 232, cy: 155, r: 14 },   // Over 'Space'
  ];

  const rightFingers: Array<{ id: FingerId; cx: number; cy: number; r: number }> = [
    { id: 'right_thumb', cx: 368, cy: 155, r: 14 },  // Over 'Space'
    { id: 'right_index', cx: 416, cy: 95, r: 13 },   // Over 'J' / 'H'
    { id: 'right_middle', cx: 452, cy: 80, r: 14 },  // Over 'K'
    { id: 'right_ring', cx: 488, cy: 92, r: 13 },    // Over 'L'
    { id: 'right_pinky', cx: isRightShiftActive ? 548 : 522, cy: isRightShiftActive ? 122 : 110, r: 12 },  // Over ';' / Shift
  ];

  return (
    <svg
      viewBox="0 0 600 240"
      className="w-full max-w-4xl h-44 sm:h-52 drop-shadow-2xl select-none"
      aria-label="Overlaid hands guide"
    >
      <defs>
        {/* Soft realistic skin gradient */}
        <linearGradient id="skinGradLeft" x1="0%" y1="100%" x2="40%" y2="0%">
          <stop offset="0%" stopColor="#8d5b4c" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#b9826a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#dcb097" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="skinGradRight" x1="100%" y1="100%" x2="60%" y2="0%">
          <stop offset="0%" stopColor="#8d5b4c" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#b9826a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#dcb097" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* LEFT HAND PALM & FINGERS */}
      <g className="transition-all duration-150">
        {/* Palm & Arm Wrist */}
        <path
          d="M 50 240 C 60 180, 80 150, 110 145 C 150 140, 200 160, 220 200 C 230 220, 240 240, 240 240 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Left Hand Fingers extending to keys */}
        {/* Pinky */}
        <path
          d="M 68 160 C 66 130, 70 120, 78 110 C 86 110, 88 125, 88 155 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Ring */}
        <path
          d="M 100 148 C 100 115, 106 100, 112 92 C 120 92, 122 110, 122 145 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Middle */}
        <path
          d="M 134 142 C 136 105, 142 90, 148 80 C 158 80, 160 100, 158 142 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Index */}
        <path
          d="M 172 146 C 174 115, 180 105, 184 95 C 194 95, 196 110, 194 150 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Thumb */}
        <path
          d="M 205 180 C 215 168, 222 160, 232 155 C 242 158, 240 170, 228 190 Z"
          fill="url(#skinGradLeft)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />

        {/* Left Fingertip Indicators with Glow */}
        {leftFingers.map((f) => {
          const active = isFingerActive(f.id);
          const cfg = FINGER_CONFIGS[f.id];
          return (
            <g key={f.id}>
              {/* Active Glow Halo */}
              {active && (
                <circle
                  cx={f.cx}
                  cy={f.cy}
                  r={f.r + 8}
                  fill={cfg.color}
                  opacity="0.55"
                  className="animate-ping"
                />
              )}
              {/* Fingertip Cap */}
              <circle
                cx={f.cx}
                cy={f.cy}
                r={f.r}
                fill={active ? cfg.color : 'rgba(255, 255, 255, 0.3)'}
                stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                strokeWidth={active ? '2.5' : '1'}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </g>

      {/* RIGHT HAND PALM & FINGERS */}
      <g className="transition-all duration-150">
        {/* Palm & Arm Wrist */}
        <path
          d="M 550 240 C 540 180, 520 150, 490 145 C 450 140, 400 160, 380 200 C 370 220, 360 240, 360 240 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Right Hand Fingers extending to keys */}
        {/* Thumb */}
        <path
          d="M 395 180 C 385 168, 378 160, 368 155 C 358 158, 360 170, 372 190 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Index */}
        <path
          d="M 428 146 C 426 115, 420 105, 416 95 C 406 95, 404 110, 406 150 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Middle */}
        <path
          d="M 466 142 C 464 105, 458 90, 452 80 C 442 80, 440 100, 442 142 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Ring */}
        <path
          d="M 500 148 C 500 115, 494 100, 488 92 C 480 92, 478 110, 478 145 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Pinky */}
        <path
          d="M 532 160 C 534 130, 530 120, 522 110 C 514 110, 512 125, 512 155 Z"
          fill="url(#skinGradRight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />

        {/* Right Fingertip Indicators with Glow */}
        {rightFingers.map((f) => {
          const active = isFingerActive(f.id);
          const cfg = FINGER_CONFIGS[f.id];
          return (
            <g key={f.id}>
              {/* Active Glow Halo */}
              {active && (
                <circle
                  cx={f.cx}
                  cy={f.cy}
                  r={f.r + 8}
                  fill={cfg.color}
                  opacity="0.55"
                  className="animate-ping"
                />
              )}
              {/* Fingertip Cap */}
              <circle
                cx={f.cx}
                cy={f.cy}
                r={f.r}
                fill={active ? cfg.color : 'rgba(255, 255, 255, 0.3)'}
                stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                strokeWidth={active ? '2.5' : '1'}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
});
