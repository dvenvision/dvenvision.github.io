import React from 'react';
import { TypingMetrics } from '@/hooks/useTypingEngine';
import { Zap, Target, Clock, Trophy } from 'lucide-react';

interface LiveStatsProps {
  metrics: TypingMetrics;
  bestWpm: number;
}

export const LiveStats = React.memo<LiveStatsProps>(function LiveStats({
  metrics,
  bestWpm,
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 sm:px-6 rounded-xl bg-card border border-border shadow-sm">
        {/* Speed / WPM */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none text-foreground">
              {metrics.wpm}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
              Net WPM
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none text-foreground">
              {metrics.accuracy}%
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
              Accuracy
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none text-foreground">
              {formatTime(metrics.elapsedSeconds)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
              Time
            </div>
          </div>
        </div>

        {/* Best Record */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none text-foreground">
              {bestWpm}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
              Best WPM
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          style={{ width: `${metrics.progressPercent}%` }}
          className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
        />
      </div>
    </div>
  );
});
