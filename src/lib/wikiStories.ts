import { normalizeTypingText } from './utils';

export interface WikiStory {

  id: string;
  title: string;
  description: string;
  extract: string;
  thumbnailUrl?: string;
  category: 'Anime & Pop Culture' | 'Technology' | 'Biography' | 'Science & History' | 'Custom';
}

const STORAGE_KEY_WIKI = 'keyhaki_wiki_stories_v1';
const STORAGE_KEY_WIKI_LEGACY = 'typecat_wiki_stories_v1';

export const STARTER_WIKI_STORIES: WikiStory[] = [
  {
    id: 'wiki-one-piece',
    title: 'One Piece',
    description: 'Japanese manga series by Eiichiro Oda',
    category: 'Anime & Pop Culture',
    thumbnailUrl:
      'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
    extract:
      'One Piece is a Japanese manga series written and illustrated by Eiichiro Oda. The story follows the adventures of Monkey D. Luffy and his pirate crew, the Straw Hat Pirates, as they explore the Grand Line in search of the legendary treasure known as the One Piece to become the next King of the Pirates.',
  },
  {
    id: 'wiki-python',
    title: 'Python (programming language)',
    description: 'High-level general-purpose programming language',
    category: 'Technology',
    thumbnailUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
    extract:
      'Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python is dynamically typed and garbage-collected, supporting multiple programming paradigms including structured, object-oriented, and functional programming.',
  },
  {
    id: 'wiki-steve-jobs',
    title: 'Steve Jobs',
    description: 'American business magnate and co-founder of Apple Inc.',
    category: 'Biography',
    thumbnailUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
    extract:
      'Steven Paul Jobs was an American businessman, inventor, and investor best known for co-founding Apple Inc. Jobs was a pioneer of the personal computer revolution and revolutionized the consumer electronics, computer animation, music, phone, and tablet industries with products like the Macintosh, iPod, iPhone, and iPad.',
  },
  {
    id: 'wiki-apollo-11',
    title: 'Apollo 11',
    description: '1969 American spaceflight that first landed humans on the Moon',
    category: 'Science & History',
    thumbnailUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/98/Aldrin_Apollo_11_original.jpg',
    extract:
      'Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, and Armstrong became the first person to step onto the lunar surface six hours later.',
  },
];

export function getSavedWikiStories(): WikiStory[] {
  if (typeof window === 'undefined') return STARTER_WIKI_STORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WIKI) || localStorage.getItem(STORAGE_KEY_WIKI_LEGACY);
    if (!raw) return STARTER_WIKI_STORIES;
    const custom: WikiStory[] = JSON.parse(raw);
    const customIds = new Set(custom.map((s) => s.id));
    const filteredStarters = STARTER_WIKI_STORIES.filter((s) => !customIds.has(s.id));
    return [...custom, ...filteredStarters];
  } catch {
    return STARTER_WIKI_STORIES;
  }
}

export function saveWikiStory(story: WikiStory): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedWikiStories();
    const filtered = existing.filter((s) => s.id !== story.id);
    localStorage.setItem(STORAGE_KEY_WIKI, JSON.stringify([story, ...filtered]));
  } catch {
    // LocalStorage quota fallback
  }
}

export interface WikiFetchResult {
  story?: WikiStory;
  error?: string;
}

// FIX: Direct Wikipedia API search supporting multi-word topics, biographies, historical events & DSA concepts — AI/2026-10-24
// WHY: No client-side filtering or regex; whatever the user searches is directly queried via Wikipedia full-text API.
export async function fetchWikiStory(topicQuery: string): Promise<WikiFetchResult> {
  const cleanQuery = topicQuery.trim();
  if (!cleanQuery) {
    return { error: 'Please enter a topic or title to search.' };
  }

  // 1. Check local cache first
  const cached = getSavedWikiStories().find(
    (s) =>
      s.title.toLowerCase() === cleanQuery.toLowerCase() ||
      s.id.toLowerCase() === `wiki-${cleanQuery.toLowerCase().replace(/\s+/g, '-')}`
  );
  if (cached) {
    return { story: cached };
  }

  try {
    let resolvedTitle = cleanQuery;

    // 2. Try direct page summary first
    const directUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      cleanQuery.replace(/\s+/g, '_')
    )}`;
    const directRes = await fetch(directUrl);

    if (directRes.ok) {
      const directData = await directRes.json();
      if (directData.extract && directData.type !== 'disambiguation') {
        const story: WikiStory = {
          id: `wiki-${directData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: directData.title,
          description: directData.description || 'Wikipedia Encyclopedia Article',
          extract: normalizeTypingText(directData.extract),
          thumbnailUrl: directData.thumbnail?.source,
          category: 'Custom',
        };
        saveWikiStory(story);
        return { story };
      }
    }

    // 3. Wikipedia Full-Text Search API (handles multi-word queries, biographies, historical events & DSA concepts)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanQuery
    )}&format=json&origin=*&utf8=1`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error('Search request failed');

    const searchData = await searchRes.json();
    const hits: Array<{ title: string }> = searchData?.query?.search || [];

    if (hits.length === 0) {
      // 4. Fallback to OpenSearch prefix search
      const openSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        cleanQuery
      )}&limit=5&namespace=0&format=json&origin=*`;
      const openSearchRes = await fetch(openSearchUrl);
      const openSearchData = await openSearchRes.json();
      const openSearchHits: string[] = openSearchData[1] || [];

      if (openSearchHits.length === 0) {
        return {
          error: `No Wikipedia article found matching "${cleanQuery}".`,
        };
      }
      resolvedTitle = openSearchHits[0];
    } else {
      resolvedTitle = hits[0].title;
    }

    // 5. Fetch canonical summary for resolved title
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      resolvedTitle.replace(/\s+/g, '_')
    )}`;
    const summaryRes = await fetch(summaryUrl);

    if (!summaryRes.ok) {
      return {
        error: `Could not retrieve article extract for "${resolvedTitle}".`,
      };
    }

    const summaryData = await summaryRes.json();
    if (!summaryData.extract || summaryData.extract.length < 20) {
      return {
        error: `The article "${resolvedTitle}" does not contain enough text to practice typing.`,
      };
    }

    const story: WikiStory = {
      id: `wiki-${summaryData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: summaryData.title,
      description: summaryData.description || 'Wikipedia Encyclopedia Article',
      extract: normalizeTypingText(summaryData.extract),
      thumbnailUrl: summaryData.thumbnail?.source,
      category: 'Custom',
    };

    saveWikiStory(story);
    return { story };
  } catch (err) {
    return {
      error: `Network error connecting to Wikipedia: ${
        err instanceof Error ? err.message : 'Please check your internet connection.'
      }`,
    };
  }
}
