import React, { useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypingMetrics } from '@/hooks/useTypingEngine';

interface TypingCardProps {
  targetText: string;
  cursorIndex: number;
  errorIndices: Set<number>;
  isFinished: boolean;
  metrics: TypingMetrics;
  onReset: () => void;
  onNext?: () => void;
  topPrompt?: React.ReactNode;
  showCompletionModal?: boolean;
}

export const TypingCard = React.memo<TypingCardProps>(function TypingCard({
  targetText,
  cursorIndex,
  errorIndices,
  isFinished,
  metrics,
  onReset,
  onNext,
  topPrompt,
  showCompletionModal = true,
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group text into whole words so the browser NEVER breaks a word mid-word (Matching img2)
  const wordTokens = useMemo(() => {
    // Regex matches words and punctuation together, keeping spaces/newlines with them
    const tokens: Array<{ text: string; startIndex: number }> = [];
    let currentIndex = 0;

    // Split by spaces or newlines while preserving delimiters
    const parts = targetText.split(/(\s+)/);

    for (const part of parts) {
      if (part.length > 0) {
        tokens.push({
          text: part,
          startIndex: currentIndex,
        });
        currentIndex += part.length;
      }
    }
    return tokens;
  }, [targetText]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-card border border-border/80 shadow-[0_10px_35px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] transition-all">
      {/* Top Floating Info Pill (shown only when relevant) */}
      {topPrompt && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-1 rounded-full bg-card border border-border shadow-sm text-xs font-semibold text-foreground/85 select-none whitespace-nowrap">
          <span>{topPrompt}</span>
        </div>
      )}

      {/* Monospaced Text Container (Matching img2 typography & spacing) */}
      <div
        ref={containerRef}
        className="font-mono text-xl sm:text-2xl leading-[2.2] tracking-normal select-none p-8 sm:p-12 min-h-[160px] flex flex-wrap items-center justify-center text-center focus:outline-none"
        tabIndex={0}
      >
        {wordTokens.map((token, tokenIdx) => {
          const isWhitespaceToken = /^\s+$/.test(token.text);

          // If the token is a newline, render an explicit line break with active cursor support
          if (token.text.includes('\n')) {
            return (
              <span key={tokenIdx} className="w-full flex items-center justify-center my-1 select-none">
                {token.text.split('').map((char, charOffset) => {
                  const globalIndex = token.startIndex + charOffset;
                  const isTyped = globalIndex < cursorIndex;
                  const isCurrent = globalIndex === cursorIndex;
                  const isError = errorIndices.has(globalIndex);

                  if (char !== '\n') return null;

                  return (
                    <span
                      key={charOffset}
                      className={cn(
                        'relative inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded transition-all duration-75',
                        isTyped && !isError && 'text-muted-foreground/60 bg-secondary/30',
                        isError && 'bg-rose-500/20 text-rose-500 underline decoration-rose-500',
                        !isTyped && !isCurrent && 'text-muted-foreground/30 bg-secondary/15',
                        isCurrent && 'text-primary bg-primary/10 ring-2 ring-primary/40 font-black'
                      )}
                    >
                      {isCurrent && (
                        <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-primary animate-cursor rounded-full shadow-[0_0_8px_rgba(79,70,229,0.9)]" />
                      )}
                      <span>↵ Enter</span>
                    </span>
                  );
                })}
              </span>
            );
          }

          // Render intact word chunk (never breaks across lines!)
          return (
            <span
              key={tokenIdx}
              className={cn(
                'inline-block whitespace-nowrap',
                // Space token between words
                isWhitespaceToken ? 'w-2 sm:w-3 text-center' : 'mx-[1px]'
              )}
            >
              {token.text.split('').map((char, charOffset) => {
                const globalIndex = token.startIndex + charOffset;
                const isTyped = globalIndex < cursorIndex;
                const isCurrent = globalIndex === cursorIndex;
                const isError = errorIndices.has(globalIndex);

                return (
                  <span
                    key={charOffset}
                    className={cn(
                      'relative inline-block transition-colors duration-75',
                      // Typed correctly (crisp dark/white text)
                      isTyped && !isError && 'text-foreground font-semibold',
                      // Erroneous keystroke (soft red highlight)
                      isError && 'bg-rose-500/20 text-rose-500 underline decoration-rose-500 rounded px-[1px]',
                      // Pending upcoming characters (clean subtle gray, matching img2)
                      !isTyped && !isCurrent && 'text-muted-foreground/50 dark:text-muted-foreground/40',
                      // Active cursor character
                      isCurrent && 'text-primary font-bold'
                    )}
                  >
                    {/* Blinking blue/primary vertical cursor bar (Matching img2) */}
                    {isCurrent && (
                      <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-primary animate-cursor rounded-full shadow-[0_0_8px_rgba(79,70,229,0.9)]" />
                    )}

                    {/* Display character naturally without cluttering space dots */}
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>

      {/* Completion Modal Overlay (suppressed in rapid Oxford mode) */}
      {isFinished && showCompletionModal && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 rounded-3xl bg-card/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-foreground mb-1">Lesson Completed!</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Completed with <strong className="text-foreground">{metrics.accuracy}% accuracy</strong> and a speed of{' '}
            <strong className="text-primary">{metrics.wpm} Net WPM</strong>.
          </p>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            {onNext && (
              <Button onClick={onNext} className="gap-2">
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
