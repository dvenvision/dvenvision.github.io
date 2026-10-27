import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { normalizeTypingText } from '@/lib/utils';

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
  const cleanTargetText = useMemo(() => normalizeTypingText(targetText), [targetText]);

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
  const endTimeRef = useRef<number | null>(null);
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
    endTimeRef.current = null;
    hasTriggeredCompletionRef.current = false;
  }, []);

  useEffect(() => {
    reset();
  }, [cleanTargetText, reset]);

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

      // Handle Enter and dead keys on international layouts
      let inputChar = e.key;
      if (inputChar === 'Enter') {
        inputChar = '\n';
        e.preventDefault();
      } else if (inputChar === 'Dead') {
        if (e.code === 'Quote') {
          inputChar = e.shiftKey ? '"' : "'";
        } else if (e.code === 'Backquote') {
          inputChar = e.shiftKey ? '~' : '`';
        } else if (e.code === 'Digit6') {
          inputChar = '^';
        }
      }

      // Ignore multi-char keys (like F1-F12)
      if (inputChar.length > 1) return;

      // Prevent scrolling on Space or Tab, and prevent Firefox Quick-Find from capturing ' or /
      if ([' ', 'Tab', "'", '/'].includes(inputChar)) {
        e.preventDefault();
      }

      // Start timing on first printable keystroke
      if (!isStarted) {
        setIsStarted(true);
        startTimeRef.current = Date.now();
      }

      if (cursorIndex >= cleanTargetText.length) return;

      const expectedChar = cleanTargetText[cursorIndex];

      setKeystrokeCount((c) => c + 1);

      // Resilient character matching: support standard ASCII as well as typographic quote/dash variations
      const isMatch =
        inputChar === expectedChar ||
        (inputChar === "'" && /['’‘`´ʼ]/.test(expectedChar)) ||
        (inputChar === '"' && /["“”«»]/.test(expectedChar)) ||
        (inputChar === '-' && /[-—–−]/.test(expectedChar)) ||
        (inputChar === ' ' && /[\s\u00A0\u2009]/.test(expectedChar));

      const nextIndex = cursorIndex + 1;

      if (isMatch) {
        onKeyMatch?.(expectedChar);
        setConsecutiveErrors(0);
        setLastMistypedChar(null);

        setCursorIndex(nextIndex);

        if (nextIndex >= cleanTargetText.length) {
          endTimeRef.current = Date.now();
          setIsFinished(true);
        }
      } else {
        // Mismatch: record error and ALWAYS advance cursor forward so user is never blocked!
        onKeyMismatch?.(expectedChar, inputChar);
        setErrorCount((c) => c + 1);
        setErrorIndices((prev) => new Set(prev).add(cursorIndex));
        setConsecutiveErrors((prev) => prev + 1);
        setLastMistypedChar(expectedChar);

        setCursorIndex(nextIndex);

        if (nextIndex >= cleanTargetText.length) {
          endTimeRef.current = Date.now();
          setIsFinished(true);
        }
      }
    },
    [enabled, cursorIndex, cleanTargetText, isStarted, isFinished, onKeyMatch, onKeyMismatch]
  );


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Derived metrics calculations using high-precision elapsed time
  const metrics: TypingMetrics = useMemo(() => {
    const finishTime = endTimeRef.current;
    const startTime = startTimeRef.current;
    let preciseSeconds = elapsedSeconds;

    if (startTime) {
      if (finishTime) {
        preciseSeconds = Math.max(0.1, (finishTime - startTime) / 1000);
      } else if (isStarted) {
        preciseSeconds = Math.max(0.1, (Date.now() - startTime) / 1000);
      }
    }

    const minutes = Math.max(preciseSeconds / 60, 0.008); // Minimum ~0.5 second floor
    const grossWpm = Math.round(keystrokeCount / 5 / minutes);
    const uncorrectedErrors = errorIndices.size;
    const netWpm = Math.max(0, Math.round((cursorIndex / 5 - uncorrectedErrors) / minutes));
    const accuracy =
      keystrokeCount === 0
        ? 100
        : Math.max(0, Math.round(((keystrokeCount - errorCount) / keystrokeCount) * 100));
    const progressPercent =
      cleanTargetText.length === 0
        ? 0
        : Math.min(100, Math.round((cursorIndex / cleanTargetText.length) * 100));

    return {
      wpm: netWpm,
      grossWpm,
      accuracy,
      cpm: Math.round(cursorIndex / minutes),
      elapsedSeconds: isFinished ? Math.max(1, Math.round(preciseSeconds)) : elapsedSeconds,
      progressPercent,
      totalKeystrokes: keystrokeCount,
      totalErrors: errorCount,
    };
  }, [
    cursorIndex,
    elapsedSeconds,
    errorCount,
    errorIndices.size,
    isFinished,
    isStarted,
    keystrokeCount,
    cleanTargetText.length,
  ]);


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
