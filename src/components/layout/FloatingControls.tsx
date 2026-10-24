import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  BookOpen,
  RotateCcw,
  Hand,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingControlsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  handsVisible: boolean;
  onToggleHands: () => void;
  keyboardVisible: boolean;
  onToggleKeyboard: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onReset: () => void;
}

export const FloatingControls = React.memo<FloatingControlsProps>(function FloatingControls({
  soundEnabled,
  onToggleSound,
  handsVisible,
  onToggleHands,
  keyboardVisible,
  onToggleKeyboard,
  isFullscreen,
  onToggleFullscreen,
  isRightSidebarOpen,
  onToggleRightSidebar,
  theme,
  onToggleTheme,
  onReset,
}) {
  const buttonClass =
    'w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-card/80 hover:bg-card border border-border shadow-md backdrop-blur-md text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all select-none';

  return (
    <div
      className={cn(
        'fixed top-4 z-50 flex items-center gap-2 transition-all duration-300',
        isRightSidebarOpen ? 'right-[330px] sm:right-[395px]' : 'right-4'
      )}
    >
      {/* Restart */}
      <button
        onClick={onReset}
        className={buttonClass}
        title="Restart Current Exercise"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Toggle Hands */}
      <button
        onClick={onToggleHands}
        className={cn(buttonClass, handsVisible && 'text-primary ring-2 ring-primary/30')}
        title={handsVisible ? 'Hide Overlaid Hands' : 'Show Overlaid Hands'}
      >
        <Hand className="w-4 h-4" />
      </button>

      {/* Toggle Virtual Keyboard (Distraction-Free) */}
      <button
        onClick={onToggleKeyboard}
        className={cn(buttonClass, keyboardVisible && 'text-primary ring-2 ring-primary/30')}
        title={keyboardVisible ? 'Hide Virtual Keyboard (Distraction-Free)' : 'Show Virtual Keyboard'}
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Sound */}
      <button
        onClick={onToggleSound}
        className={cn(buttonClass, soundEnabled && 'text-primary')}
        title={soundEnabled ? 'Mute Mechanical Switch Sounds' : 'Unmute Sound'}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Oxford Vocabulary Sidebar */}
      <button
        onClick={onToggleRightSidebar}
        className={cn(
          buttonClass,
          isRightSidebarOpen ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
        )}
        title={isRightSidebarOpen ? 'Hide Vocabulary Panel' : 'Show Oxford Vocabulary'}
      >
        <BookOpen className="w-4 h-4" />
      </button>

      {/* Theme */}
      <button onClick={onToggleTheme} className={buttonClass} title="Toggle Dark/Light Mode">
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Fullscreen (Matching img3) */}
      <button
        onClick={onToggleFullscreen}
        className={buttonClass}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Immersion'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
});
