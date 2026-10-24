export type { OxfordEntry, OxfordCollectionType } from './oxfordDynamicLoader';
export {
  loadOxfordWords,
  loadOxfordPhrases,
  getCompletedWordIds,
  markWordCompleted,
} from './oxfordDynamicLoader';
import type { OxfordEntry } from './oxfordDynamicLoader';

export interface EverydayLesson {
  title: string;
  text: string;
  category: string;
}

// FIX: Authentic Oxford 3000/5000 definition & example for ability — AI/2026-10-24
// WHY: Remove synthetic placeholder sentences so all typing uses authentic Oxford corpus.
export const INITIAL_OXFORD_WORD: OxfordEntry = {
  id: 'oxford-word-ability-0',
  word: 'ability',
  letter: 'A',
  cefr: 'A2',
  partOfSpeech: 'noun',
  phonetic: '/əˈbɪləti/',
  definition: 'the fact that somebody/something is able to do something',
  sentence: 'People with the disease may lose their ability to communicate.',
  definitionUrl: 'https://www.oxfordlearnersdictionaries.com/definition/english/ability_1',
};

// All 26 letters of the English alphabet
export const ALL_ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Core Everyday Messages lessons
export const EVERYDAY_MESSAGES_LESSONS: EverydayLesson[] = [
  {
    title: 'Everyday Messages — Part 1',
    text: 'Hey! Could you please send me the meeting notes from earlier today? Thanks!',
    category: 'Workplace Chat',
  },
  {
    title: 'Schedule & Time Updates',
    text: "I'll be running about 10 minutes late. Please start without me if needed.",
    category: 'Casual Update',
  },
  {
    title: 'Project Roadmap Sync',
    text: "Let's sync up tomorrow morning at 9:30 AM to finalize the project roadmap.",
    category: 'Planning',
  },
  {
    title: 'Team Appreciation',
    text: 'Great work on the presentation! Everyone was really impressed by the results.',
    category: 'Feedback',
  },
  {
    title: 'Coffee & Code Check',
    text: 'Are you free for a quick coffee break at 3:15 PM? Let me know when you finish this pull request.',
    category: 'Informal',
  },
];
