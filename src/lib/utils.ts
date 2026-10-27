import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes unicode typographical characters (curly apostrophes, smart quotes,
 * em/en dashes, non-breaking spaces) into standard typeable ANSI characters.
 */
export function normalizeTypingText(text: string): string {
  if (!text) return '';
  return text
    // Replace smart/curly single quotes, apostrophes, acute accents, backticks with standard ASCII '
    .replace(/[\u2018\u2019\u201A\u201B\u02BC\u0060\u00B4]/g, "'")
    // Replace smart/curly double quotes with standard ASCII "
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    // Replace dashes (em dash, en dash, minus) with standard hyphen -
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    // Replace ellipsis character with three periods
    .replace(/\u2026/g, '...')
    // Replace non-breaking and special spaces with standard ASCII space
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    // Collapse repeated horizontal spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
}

