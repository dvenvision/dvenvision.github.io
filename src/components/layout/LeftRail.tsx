import React, { useMemo } from 'react';
import { User, CheckCircle2, ChevronRight, ChevronLeft, BookOpen, ScrollText, MessageSquare } from 'lucide-react';
import { OxfordEntry, ALL_ALPHABET_LETTERS, OxfordCollectionType } from '@/lib/oxfordDataset';
import { WikiStory } from '@/lib/wikiStories';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PracticeMode } from '@/store/useTypingStore';

interface LeftRailProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mode: PracticeMode;
  onSetMode: (mode: PracticeMode) => void;
  // Oxford Word Timeline Props
  oxfordWords: OxfordEntry[];
  activeOxfordWordId: string;
  onSelectOxfordWord: (wordId: string) => void;
  completedWordIds: Set<string>;
  selectedLetter: string; // 'ALL' or 'A'..'Z'
  onSelectLetter: (letter: string) => void;
  oxfordCollection: OxfordCollectionType;
  onSetOxfordCollection: (col: OxfordCollectionType) => void;
  isLoadingOxford?: boolean;
  // Wikipedia Stories Props
  wikiStories: WikiStory[];
  activeWikiStoryId: string;
  onSelectWikiStory: (story: WikiStory) => void;
}

export const LeftRail = React.memo<LeftRailProps>(function LeftRail({
  isCollapsed,
  onToggleCollapse,
  mode,
  onSetMode,
  oxfordWords,
  activeOxfordWordId,
  onSelectOxfordWord,
  completedWordIds,
  selectedLetter,
  onSelectLetter,
  oxfordCollection,
  onSetOxfordCollection,
  isLoadingOxford = false,
  wikiStories,
  activeWikiStoryId,
  onSelectWikiStory,
}) {
  // Filtered Oxford words by selected letter
  const displayedOxfordWords = useMemo(() => {
    if (selectedLetter === 'ALL') return oxfordWords;
    return oxfordWords.filter((w) => w.letter === selectedLetter);
  }, [oxfordWords, selectedLetter]);

  const totalCompleted = completedWordIds.size;
  const progressPercent = Math.min(
    100,
    Math.round((totalCompleted / Math.max(oxfordWords.length, 1)) * 100)
  );

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r border-border bg-card/70 backdrop-blur-md transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-14 items-center py-4' : 'w-72 sm:w-84 p-3 sm:p-4'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center gap-2.5 mb-3', isCollapsed ? 'justify-center' : 'px-1')}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/25 via-pink-400/10 to-primary/20 border border-pink-400/30 flex items-center justify-center p-1 shadow-md shadow-pink-500/10 shrink-0 overflow-hidden group hover:scale-105 transition-transform">
          <img src="/chopper-logo.png" alt="KeyHaki" className="w-full h-full object-contain drop-shadow" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-black text-base text-foreground leading-tight flex items-center gap-1.5 tracking-tight">
              KeyHaki
              <span className="text-[9px] px-1.5 py-0.5 text-pink-400 font-bold bg-pink-500/10 border border-pink-500/20 rounded-full">
                One Piece
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              Touch Typing & Vocab
            </span>
          </div>
        )}
      </div>

      {/* Mode Selector Tabs in Left Rail */}
      {!isCollapsed && (
        <div className="grid grid-cols-3 gap-1 p-1 mb-2.5 rounded-xl bg-secondary/60 border border-border">
          <button
            onClick={() => onSetMode('vocab')}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'vocab' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Oxford 3000/5000 & Phrases"
          >
            <BookOpen className="w-3.5 h-3.5 mb-0.5 text-primary" />
            <span className="text-[10px]">Oxford</span>
          </button>
          <button
            onClick={() => onSetMode('custom')}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'custom' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Wikipedia Real-World Stories & Biographies"
          >
            <ScrollText className="w-3.5 h-3.5 mb-0.5 text-amber-500" />
            <span className="text-[10px]">Stories</span>
          </button>
          <button
            onClick={() => onSetMode('everyday')}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'everyday' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Everyday Messages"
          >
            <MessageSquare className="w-3.5 h-3.5 mb-0.5 text-emerald-500" />
            <span className="text-[10px]">Everyday</span>
          </button>
        </div>
      )}

      {/* VIEW A: OXFORD VOCABULARY A-Z TIMELINE */}
      {mode === 'vocab' && !isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
          {/* Oxford Sub-Collection Switcher: Words (5,000) vs Phrases (750) */}
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-secondary/70 border border-border text-[10px]">
            <button
              onClick={() => onSetOxfordCollection('words')}
              className={cn(
                'py-1 rounded font-semibold transition-all cursor-pointer text-center',
                oxfordCollection === 'words'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Oxford 5000 Words
            </button>
            <button
              onClick={() => onSetOxfordCollection('phrases')}
              className={cn(
                'py-1 rounded font-semibold transition-all cursor-pointer text-center',
                oxfordCollection === 'phrases'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Phrase List (750)
            </button>
          </div>

          {/* Progress Tracker Card */}
          <div className="p-2 rounded-xl bg-secondary/40 border border-border/80">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-muted-foreground">
                {oxfordCollection === 'words' ? 'Oxford 5000' : 'Oxford Phrases'}
              </span>
              <span className="font-mono text-primary font-bold">
                {displayedOxfordWords.length} words listed
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* A-Z Quick Jump Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1 px-1">
              <span>Filter by Letter:</span>
              <span className="text-primary font-mono">{selectedLetter}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
              <button
                onClick={() => onSelectLetter('ALL')}
                className={cn(
                  'px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer',
                  selectedLetter === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              {ALL_ALPHABET_LETTERS.map((ltr) => (
                <button
                  key={ltr}
                  onClick={() => onSelectLetter(ltr)}
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer',
                    selectedLetter === ltr
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {ltr}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Word List Timeline */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {isLoadingOxford ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Loading Oxford dictionary entries...</span>
              </div>
            ) : displayedOxfordWords.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No entries found starting with '{selectedLetter}'.
              </div>
            ) : (
              displayedOxfordWords.map((entry) => {
                const isActive = entry.id === activeOxfordWordId;
                const isCompleted = completedWordIds.has(entry.id);

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectOxfordWord(entry.id)}
                    className={cn(
                      'group flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all border cursor-pointer',
                      isActive
                        ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-sm'
                        : 'bg-card/50 border-border/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20 shrink-0 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-muted-foreground/60 shrink-0" />
                      )}
                      <span className="truncate capitalize text-foreground font-semibold">
                        {entry.word}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] uppercase font-mono text-muted-foreground">
                        {entry.partOfSpeech}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {entry.cefr}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW B: WIKIPEDIA STORIES LIST */}
      {mode === 'custom' && !isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="font-bold text-amber-500 block mb-0.5">Wikipedia Stories Mode</span>
            <span className="text-muted-foreground text-[11px] leading-tight block">
              Type full narrative stories from real-world encyclopedic topics.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {wikiStories.map((story) => {
              const isActive = story.id === activeWikiStoryId;
              return (
                <div
                  key={story.id}
                  onClick={() => onSelectWikiStory(story)}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-1',
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 font-bold shadow-sm'
                      : 'bg-card/50 border-border/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{story.title}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-500 border-amber-500/30">
                      {story.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW C: EVERYDAY MESSAGES LIST */}
      {mode === 'everyday' && !isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="font-bold text-emerald-500 block mb-0.5">Everyday Messages</span>
            <span className="text-muted-foreground text-[11px] leading-tight block">
              Real workplace chats, casual greetings, and team sync messages.
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center p-4 text-xs text-muted-foreground">
            Type with full punctuation and shift key coordination!
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md transition-all cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Bottom Typist Profile */}
      <div className="pt-3 border-t border-border mt-auto">
        <div className={cn('flex items-center gap-2.5', isCollapsed ? 'justify-center' : 'px-1')}>
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            <User className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Typist Profile</span>
              <span className="text-[10px] text-muted-foreground font-mono">Zero Login Session</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
