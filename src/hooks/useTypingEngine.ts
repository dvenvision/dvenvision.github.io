import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface TypingMetrics {
  wpm: number;
  grossWpm: number;
  accuracy: number;
  cpm: number;
  elapsedSeconds: number;
  progressPercent: number;
  totalKeystrokes: number;
  totalErrors: number;
}

interface UseTypingEngineProps {
  targetText: string;
  enabled?: boolean;
  onKeyMatch?: (char: string) => void;
  onKeyMismatch?: (expected: string, actual: string) => void;
  onComplete?: (metrics: TypingMetrics) => void;
}

export function useTypingEngine({
  targetText,
  enabled = true,
  onKeyMatch,
  onKeyMismatch,
  onComplete,
}: UseTypingEngineProps) {
  const [cursorIndex, setCursorIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Consecutive error tracking for mascot assistance
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastMistypedChar, setLastMistypedChar] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const hasTriggeredCompletionRef = useRef(false);

  // Reset engine when target text changes
  const reset = useCallback(() => {
    setCursorIndex(0);
    setErrorIndices(new Set());
    setKeystrokeCount(0);
    setErrorCount(0);
    setIsStarted(false);
    setIsFinished(false);
    setElapsedSeconds(0);
    setConsecutiveErrors(0);
    setLastMistypedChar(null);
    startTimeRef.current = null;
    hasTriggeredCompletionRef.current = false;
  }, []);

  useEffect(() => {
    reset();
  }, [targetText, reset]);

  // Timer interval
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const secs = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setElapsedSeconds(secs);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isStarted, isFinished]);

  // Keystroke listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || isFinished) return;

      // FIX: Do not intercept keystrokes if typing inside an input, textarea, or contentEditable element — AI/2026-10-24
      // WHY: Calling e.preventDefault() on Space blocked users from typing spaces and multiple words in modal inputs.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore functional meta keys
      if (
        ['Alt', 'Control', 'Meta', 'Shift', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
          e.key
        )
      ) {
        return;
      }

      // Prevent scrolling on Space or Tab during active typing practice
      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
      }

      // Start timing on first printable keystroke
      if (!isStarted) {
        setIsStarted(true);
        startTimeRef.current = Date.now();
      }

      const expectedChar = targetText[cursorIndex];

      // Handle Backspace
      if (e.key === 'Backspace') {
        if (cursorIndex > 0) {
          const prevIndex = cursorIndex - 1;
          setCursorIndex(prevIndex);
          setErrorIndices((prev) => {
            const next = new Set(prev);
            next.delete(prevIndex);
            return next;
          });
          setConsecutiveErrors(0);
        }
        return;
      }

      // Ignore multi-char keys (like F1-F12)
      if (e.key.length > 1) return;

      setKeystrokeCount((c) => c + 1);

      if (e.key === expectedChar) {
        onKeyMatch?.(expectedChar);
        setConsecutiveErrors(0);
        setLastMistypedChar(null);

        const nextIndex = cursorIndex + 1;
        setCursorIndex(nextIndex);

        if (nextIndex >= targetText.length) {
          setIsFinished(true);
        }
      } else {
        // Mismatch
        onKeyMismatch?.(expectedChar, e.key);
        setErrorCount((c) => c + 1);
        setErrorIndices((prev) => new Set(prev).add(cursorIndex));
        setConsecutiveErrors((prev) => prev + 1);
        setLastMistypedChar(expectedChar);
      }
    },
    [enabled, cursorIndex, targetText, isStarted, isFinished, onKeyMatch, onKeyMismatch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Derived metrics calculations
  const metrics: TypingMetrics = useMemo(() => {
    const minutes = Math.max(elapsedSeconds / 60, 0.016); // Minimum 1 second equivalent
    const grossWpm = Math.round(keystrokeCount / 5 / minutes);
    const uncorrectedErrors = errorIndices.size;
    const netWpm = Math.max(0, Math.round((cursorIndex / 5 - uncorrectedErrors) / minutes));
    const accuracy =
      keystrokeCount === 0
        ? 100
        : Math.max(0, Math.round(((keystrokeCount - errorCount) / keystrokeCount) * 100));
    const progressPercent =
      targetText.length === 0
        ? 0
        : Math.min(100, Math.round((cursorIndex / targetText.length) * 100));

    return {
      wpm: netWpm,
      grossWpm,
      accuracy,
      cpm: Math.round(cursorIndex / minutes),
      elapsedSeconds,
      progressPercent,
      totalKeystrokes: keystrokeCount,
      totalErrors: errorCount,
    };
  }, [cursorIndex, elapsedSeconds, errorCount, errorIndices.size, keystrokeCount, targetText.length]);

  // Trigger onComplete once upon exercise completion
  useEffect(() => {
    if (isFinished && !hasTriggeredCompletionRef.current) {
      hasTriggeredCompletionRef.current = true;
      onComplete?.(metrics);
    }
  }, [isFinished, metrics, onComplete]);

  return {
    cursorIndex,
    errorIndices,
    metrics,
    isStarted,
    isFinished,
    consecutiveErrors,
    lastMistypedChar,
    reset,
  };
}
