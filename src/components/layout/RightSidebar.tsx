import React from 'react';
import { OxfordEntry } from '@/lib/oxfordDataset';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Volume2,
} from 'lucide-react';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeOxfordWord: OxfordEntry;
  oxfordList: OxfordEntry[];
  onSelectWordById: (id: string) => void;
  onOpenCustomModal: () => void;
}

export const RightSidebar = React.memo<RightSidebarProps>(function RightSidebar({
  isOpen,
  onClose,
  activeOxfordWord,
  oxfordList,
  onSelectWordById,
  onOpenCustomModal,
}) {
  if (!isOpen) return null;

  // Find previous and next word in the active dynamic list
  const currentIndex = oxfordList.findIndex((w) => w.id === activeOxfordWord.id);
  const prevWord =
    currentIndex > 0
      ? oxfordList[currentIndex - 1]
      : oxfordList[oxfordList.length - 1] || activeOxfordWord;
  const nextWord =
    currentIndex < oxfordList.length - 1
      ? oxfordList[currentIndex + 1]
      : oxfordList[0] || activeOxfordWord;

  const playVoiceAudio = () => {
    if (activeOxfordWord.voiceUrl) {
      try {
        const audio = new Audio(activeOxfordWord.voiceUrl);
        audio.play().catch(() => {});
      } catch {
        // Audio playback fallback
      }
    }
  };

  return (
    <aside className="w-80 sm:w-96 h-full flex flex-col border-l border-border bg-card/95 backdrop-blur-md shadow-2xl z-40 transition-all select-none animate-in slide-in-from-right-4">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-extrabold text-sm sm:text-base text-foreground">
            Oxford Deep-Dive
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Active Word Spotlight Card */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-foreground capitalize tracking-tight">
                  {activeOxfordWord.word}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {activeOxfordWord.cefr}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
                <span>{activeOxfordWord.phonetic}</span>
                <span>•</span>
                <span className="italic">{activeOxfordWord.partOfSpeech}</span>
              </div>
            </div>

            {/* Audio Voice Pronunciation Button */}
            {activeOxfordWord.voiceUrl && (
              <button
                onClick={playVoiceAudio}
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all cursor-pointer"
                title="Play Oxford Audio Pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Definition */}
          <div className="p-3 rounded-xl bg-card border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Oxford Definition
            </span>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
              {activeOxfordWord.definition}
            </p>
            {activeOxfordWord.definitionUrl && (
              <a
                href={activeOxfordWord.definitionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[11px] text-primary hover:underline font-semibold"
              >
                <span>View on Oxford Learner's Dictionaries</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>

        {/* Quick Navigation Between Words */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectWordById(prevWord.id)}
            className="flex-1 text-xs gap-1 h-9 cursor-pointer truncate"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev: {prevWord.word}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectWordById(nextWord.id)}
            className="flex-1 text-xs gap-1 h-9 cursor-pointer truncate"
          >
            Next: {nextWord.word}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Custom Text / Lookup Button */}
        <div className="pt-2">
          <Button
            onClick={onOpenCustomModal}
            className="w-full gap-2 text-xs font-semibold h-10 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Search Any Wikipedia Story / Custom Text
          </Button>
        </div>
      </div>
    </aside>
  );
});
