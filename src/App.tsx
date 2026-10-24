import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTypingStore, PracticeMode } from '@/store/useTypingStore';
import { useKeyboardAudio } from '@/hooks/useKeyboardAudio';
import { useTypingEngine, TypingMetrics } from '@/hooks/useTypingEngine';
import {
  OxfordEntry,
  OxfordCollectionType,
  loadOxfordWords,
  loadOxfordPhrases,
  getCompletedWordIds,
  markWordCompleted,
  INITIAL_OXFORD_WORD,
  EVERYDAY_MESSAGES_LESSONS,
} from '@/lib/oxfordDataset';
import {
  getSavedWikiStories,
  WikiStory,
  STARTER_WIKI_STORIES,
} from '@/lib/wikiStories';

import { LeftRail } from '@/components/layout/LeftRail';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { FloatingControls } from '@/components/layout/FloatingControls';
import { TypingCard } from '@/components/typing/TypingCard';
import { LiveStats } from '@/components/typing/LiveStats';
import { MascotTip } from '@/components/typing/MascotTip';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { CustomTextInput } from '@/components/typing/CustomTextInput';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ScrollText } from 'lucide-react';

export default function App() {
  const {
    mode,
    setMode,
    customText,
    setCustomText,
    soundEnabled,
    toggleSound,
    handsVisible,
    toggleHands,
    keyboardVisible,
    toggleKeyboard,
    theme,
    toggleTheme,
    bestWpm,
    recordBestWpm,
  } = useTypingStore();

  const [everydayIndex, setEverydayIndex] = useState(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- DYNAMIC OXFORD DATASET STATE (Words & Phrases) ---
  const [oxfordCollection, setOxfordCollection] = useState<OxfordCollectionType>('words');
  const [oxfordWords, setOxfordWords] = useState<OxfordEntry[]>([INITIAL_OXFORD_WORD]);
  const [oxfordPhrases, setOxfordPhrases] = useState<OxfordEntry[]>([]);
  const [isLoadingOxford, setIsLoadingOxford] = useState(true);

  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [activeOxfordWordId, setActiveOxfordWordId] = useState(INITIAL_OXFORD_WORD.id);
  const [completedWordIds, setCompletedWordIds] = useState<Set<string>>(() =>
    getCompletedWordIds()
  );

  // Dynamically fetch and parse Oxford 5000 Words and Phrase List on startup
  useEffect(() => {
    let isMounted = true;
    async function loadDatasets() {
      try {
        const [loadedWords, loadedPhrases] = await Promise.all([
          loadOxfordWords(),
          loadOxfordPhrases(),
        ]);
        if (!isMounted) return;

        if (loadedWords.length > 0) {
          setOxfordWords(loadedWords);
          setActiveOxfordWordId(loadedWords[0].id);
        }
        if (loadedPhrases.length > 0) {
          setOxfordPhrases(loadedPhrases);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingOxford(false);
      }
    }

    loadDatasets();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentOxfordList = useMemo(() => {
    return oxfordCollection === 'words' ? oxfordWords : oxfordPhrases;
  }, [oxfordCollection, oxfordWords, oxfordPhrases]);

  const activeOxfordWord = useMemo(() => {
    return (
      currentOxfordList.find((w) => w.id === activeOxfordWordId) ||
      currentOxfordList[0] ||
      INITIAL_OXFORD_WORD
    );
  }, [currentOxfordList, activeOxfordWordId]);

  const handleSetOxfordCollection = useCallback((col: OxfordCollectionType) => {
    setOxfordCollection(col);
    const list = col === 'words' ? oxfordWords : oxfordPhrases;
    if (list.length > 0) {
      setActiveOxfordWordId(list[0].id);
    }
  }, [oxfordWords, oxfordPhrases]);

  // --- WIKIPEDIA STORIES STATE ---
  const [wikiStories, setWikiStories] = useState<WikiStory[]>(() =>
    getSavedWikiStories()
  );
  const [activeWikiStoryId, setActiveWikiStoryId] = useState(
    () => STARTER_WIKI_STORIES[0].id
  );

  const activeWikiStory = useMemo(() => {
    return (
      wikiStories.find((s) => s.id === activeWikiStoryId) ||
      STARTER_WIKI_STORIES[0]
    );
  }, [wikiStories, activeWikiStoryId]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Audio synthesizer
  const { playKeyClick, playErrorTone } = useKeyboardAudio(soundEnabled);

  // Determine current target text based on active mode
  const targetText = useMemo(() => {
    if (mode === 'vocab') {
      return activeOxfordWord.sentence;
    }
    if (mode === 'custom') {
      if (customText) return customText;
      return activeWikiStory.extract;
    }
    if (mode === 'everyday') {
      return EVERYDAY_MESSAGES_LESSONS[everydayIndex].text;
    }
    return 'Practice makes progress. Consistent 10-finger typing develops lifelong muscle memory.';
  }, [mode, activeOxfordWord.sentence, customText, activeWikiStory.extract, everydayIndex]);

  // Audio callbacks
  const handleKeyMatch = useCallback(
    (char: string) => {
      playKeyClick(char === ' ');
    },
    [playKeyClick]
  );

  const handleKeyMismatch = useCallback(() => {
    playErrorTone();
  }, [playErrorTone]);

  const resetEngineRef = useRef<() => void>(() => {});

  // Handle exercise completion & automatic sequential sync!
  const handleComplete = useCallback(
    (metrics: TypingMetrics) => {
      recordBestWpm(metrics.wpm);

      // FIX: Seamless rapid flow in Oxford mode — AI/2026-10-24
      // WHY: User requested no popup/interruption when typing Oxford words/phrases; immediately advance to next.
      if (mode === 'vocab') {
        markWordCompleted(activeOxfordWord.id);
        setCompletedWordIds((prev) => new Set(prev).add(activeOxfordWord.id));

        // Seamless rapid vocabulary flow: directly advance to next word/phrase with 0 popup interruption!
        const currentIdx = currentOxfordList.findIndex((w) => w.id === activeOxfordWordId);
        const nextIdx = (currentIdx + 1) % currentOxfordList.length;
        if (currentOxfordList[nextIdx]) {
          setActiveOxfordWordId(currentOxfordList[nextIdx].id);
        }
        resetEngineRef.current();
      }
    },
    [mode, activeOxfordWord.id, currentOxfordList, activeOxfordWordId, recordBestWpm]
  );

  // Typing Engine
  const {
    cursorIndex,
    errorIndices,
    metrics,
    isFinished,
    consecutiveErrors,
    lastMistypedChar,
    reset,
  } = useTypingEngine({
    targetText,
    enabled: !isCustomModalOpen,
    onKeyMatch: handleKeyMatch,
    onKeyMismatch: handleKeyMismatch,
    onComplete: handleComplete,
  });

  resetEngineRef.current = reset;

  const currentTargetChar = targetText[cursorIndex] || '';

  // Advancing to next exercise
  const handleNextExercise = useCallback(() => {
    if (mode === 'vocab') {
      // Natural Sequential Sync: Advance to the next word in the active Oxford list
      const currentIdx = currentOxfordList.findIndex((w) => w.id === activeOxfordWordId);
      const nextIdx = (currentIdx + 1) % currentOxfordList.length;
      setActiveOxfordWordId(currentOxfordList[nextIdx].id);
    } else if (mode === 'custom') {
      const currentStoryIdx = wikiStories.findIndex((s) => s.id === activeWikiStoryId);
      const nextStoryIdx = (currentStoryIdx + 1) % wikiStories.length;
      setActiveWikiStoryId(wikiStories[nextStoryIdx].id);
      setCustomText('');
    } else if (mode === 'everyday') {
      setEverydayIndex((prev) => (prev + 1) % EVERYDAY_MESSAGES_LESSONS.length);
    }
    reset();
  }, [
    mode,
    currentOxfordList,
    activeOxfordWordId,
    wikiStories,
    activeWikiStoryId,
    setCustomText,
    everydayIndex,
    reset,
  ]);

  // Selection handlers
  const handleSelectOxfordWord = useCallback(
    (wordId: string) => {
      setActiveOxfordWordId(wordId);
      setMode('vocab');
      reset();
    },
    [setMode, reset]
  );

  const handleSelectWikiStory = useCallback(
    (story: WikiStory) => {
      setActiveWikiStoryId(story.id);
      setCustomText('');
      setMode('custom');
      reset();
    },
    [setCustomText, setMode, reset]
  );

  const handleApplyCustomText = useCallback(
    (text: string) => {
      setCustomText(text);
      setMode('custom');
      reset();
    },
    [setCustomText, setMode, reset]
  );

  const handleStoryLoaded = useCallback(
    (story: WikiStory) => {
      setWikiStories((prev) => {
        const filtered = prev.filter((s) => s.id !== story.id);
        return [story, ...filtered];
      });
      setActiveWikiStoryId(story.id);
      setCustomText('');
      setMode('custom');
      reset();
    },
    [setCustomText, setMode, reset]
  );

  // Top Notch Prompt Header
  const topPrompt = useMemo(() => {
    if (mode === 'vocab') {
      return (
        <div className="flex items-center gap-2 truncate">
          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-extrabold capitalize text-foreground">
            {activeOxfordWord.word}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold">
            {activeOxfordWord.cefr}
          </Badge>
          <span className="text-muted-foreground truncate hidden sm:inline">
            — {activeOxfordWord.definition}
          </span>
        </div>
      );
    }
    if (mode === 'custom') {
      return (
        <div className="flex items-center gap-2 truncate">
          <ScrollText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-bold text-foreground">{activeWikiStory.title}</span>
          <span className="text-muted-foreground truncate hidden sm:inline">
            — {activeWikiStory.description}
          </span>
        </div>
      );
    }
    return (
      <span>
        Rest your fingers on A S D F J K L ;, then type the first '{currentTargetChar}' to begin.
      </span>
    );
  }, [mode, activeOxfordWord, activeWikiStory, currentTargetChar]);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-foreground selection:bg-primary/20">
      {/* Floating Top-Right Controls */}
      <FloatingControls
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        handsVisible={handsVisible}
        onToggleHands={toggleHands}
        keyboardVisible={keyboardVisible}
        onToggleKeyboard={toggleKeyboard}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onReset={reset}
      />

      {/* Left Rail: Dynamic Oxford 5000 Words / Phrases Timeline + A-Z Filter + Wikipedia Stories */}
      <LeftRail
        isCollapsed={isLeftRailCollapsed}
        onToggleCollapse={() => setIsLeftRailCollapsed((prev) => !prev)}
        mode={mode}
        onSetMode={(newMode: PracticeMode) => {
          setMode(newMode);
          reset();
        }}
        oxfordWords={currentOxfordList}
        activeOxfordWordId={activeOxfordWordId}
        onSelectOxfordWord={handleSelectOxfordWord}
        completedWordIds={completedWordIds}
        selectedLetter={selectedLetter}
        onSelectLetter={setSelectedLetter}
        oxfordCollection={oxfordCollection}
        onSetOxfordCollection={handleSetOxfordCollection}
        isLoadingOxford={isLoadingOxford}
        wikiStories={wikiStories}
        activeWikiStoryId={activeWikiStoryId}
        onSelectWikiStory={handleSelectWikiStory}
      />

      {/* Center Main Stage */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 py-4 flex flex-col justify-between items-center max-w-5xl mx-auto space-y-3">
        {/* Live Performance Micro Stats */}
        <div className="w-full max-w-4xl pt-2">
          <LiveStats metrics={metrics} bestWpm={bestWpm} />
        </div>

        {/* Big Clean Typing Card with Word Wrapping & Integrated Notch */}
        <div className="w-full flex-1 flex items-center justify-center my-3">
          <TypingCard
            targetText={targetText}
            cursorIndex={cursorIndex}
            errorIndices={errorIndices}
            isFinished={isFinished}
            metrics={metrics}
            onReset={reset}
            onNext={handleNextExercise}
            topPrompt={topPrompt}
            showCompletionModal={mode !== 'vocab'}
          />
        </div>

        {/* Mascot Advice on consecutive errors */}
        {consecutiveErrors >= 2 && (
          <div className="w-full max-w-4xl animate-in fade-in-0 slide-in-from-bottom-2">
            <MascotTip
              consecutiveErrors={consecutiveErrors}
              lastMistypedChar={lastMistypedChar}
              targetChar={currentTargetChar}
            />
          </div>
        )}

        {/* 3D Perspective Virtual Keyboard with Overlaid Hands (toggleable for distraction-free typing) */}
        {keyboardVisible && (
          <div className="w-full max-w-4xl pb-3 pt-1 animate-in fade-in-0 duration-200">
            <VirtualKeyboard targetChar={currentTargetChar} showHands={handsVisible} />
          </div>
        )}
      </main>

      {/* Right Sidebar for Word Nuances & Deep-Dive */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        activeOxfordWord={activeOxfordWord}
        oxfordList={currentOxfordList}
        onSelectWordById={handleSelectOxfordWord}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Wikipedia Story Search & Custom Text Modal */}
      <CustomTextInput
        open={isCustomModalOpen}
        onOpenChange={setIsCustomModalOpen}
        onApplyCustomText={handleApplyCustomText}
        onStoryLoaded={handleStoryLoaded}
      />
    </div>
  );
}
