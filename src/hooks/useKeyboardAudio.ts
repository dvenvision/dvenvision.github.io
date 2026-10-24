import { useRef, useCallback, useEffect } from 'react';

export function useKeyboardAudio(soundEnabled = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Clean up AudioContext on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Mechanical Switch Click (e.g. Cherry MX Blue / Brown tactile click)
  const playKeyClick = useCallback(
    (isSpace = false) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Subtle random frequency variation for realistic mechanical feel
        const jitter = (Math.random() - 0.5) * 60;
        const startFreq = isSpace ? 320 + jitter : 720 + jitter;
        const endFreq = isSpace ? 80 : 160;

        osc.type = isSpace ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

        const volume = isSpace ? 0.22 : 0.16;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
      } catch {
        // Silently fail on restricted environments
      }
    },
    [soundEnabled, getAudioContext]
  );

  // Soft Error Tone
  const playErrorTone = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.09);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled, getAudioContext]);

  return { playKeyClick, playErrorTone };
}
