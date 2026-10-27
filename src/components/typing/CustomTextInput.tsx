import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, ScrollText, ArrowRight, Search } from 'lucide-react';
import { fetchWikiStory, WikiStory } from '@/lib/wikiStories';
import { cn, normalizeTypingText } from '@/lib/utils';

interface CustomTextInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyCustomText: (text: string) => void;
  onStoryLoaded: (story: WikiStory) => void;
}

export function CustomTextInput({
  open,
  onOpenChange,
  onApplyCustomText,
  onStoryLoaded,
}: CustomTextInputProps) {
  const [activeTab, setActiveTab] = useState<'wiki' | 'paste'>('wiki');
  const [wikiQuery, setWikiQuery] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchWiki = async () => {
    const trimmed = wikiQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError(null);

    const result = await fetchWikiStory(trimmed);
    setIsSearching(false);

    if (result.story) {
      onStoryLoaded(result.story);
      onOpenChange(false);
      setWikiQuery('');
    } else {
      setSearchError(result.error || `Could not find an encyclopedia article matching "${trimmed}".`);
    }
  };

  const handleApplyPaste = () => {
    const trimmed = pasteText.trim();
    if (!trimmed) return;
    onApplyCustomText(normalizeTypingText(trimmed));
    onOpenChange(false);
    setPasteText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-amber-500" />
          Real-World Stories & Custom Practice
        </DialogTitle>
        <DialogDescription>
          Learn about any real-world topic by typing complete stories from Wikipedia, or paste your own notes and code!
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-secondary/80 border border-border">
          <button
            onClick={() => setActiveTab('wiki')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'wiki'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ScrollText className="w-3.5 h-3.5 text-amber-500" />
            <span>Wikipedia Story Search</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'paste'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Paste Own Text</span>
          </button>
        </div>

        {/* Tab 1: Wikipedia Story Search */}
        {activeTab === 'wiki' && (
          <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Search any topic, biography, historical event, or concept:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Dijkstra's algorithm, Fall of the Berlin Wall, Alan Turing, Quicksort..."
                value={wikiQuery}
                onChange={(e) => {
                  setWikiQuery(e.target.value);
                  setSearchError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchWiki();
                }}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              />
              <Button
                onClick={handleSearchWiki}
                disabled={isSearching || !wikiQuery.trim()}
                className="gap-1.5 shrink-0"
              >
                {isSearching ? (
                  'Searching...'
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Get Story</span>
                  </>
                )}
              </Button>
            </div>

            {searchError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                {searchError}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              💡 <strong>Tip:</strong> Fetches complete narrative stories and encyclopedic articles directly from Wikipedia.
            </div>
          </div>
        )}

        {/* Tab 2: Paste Your Own Text */}
        {activeTab === 'paste' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Paste Your Own Paragraph / Code:
            </label>
            <textarea
              rows={4}
              placeholder="Paste your meeting notes, email drafts, or code snippets here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
            />
            <div className="flex justify-end pt-2">
              <Button onClick={handleApplyPaste} disabled={!pasteText.trim()} className="gap-1.5">
                <span>Start Typing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
