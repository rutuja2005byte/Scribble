import { WORDS } from '../constants/gameConfig.js';

export function getRandomWord(previousWord) {
  const pool = WORDS.filter((word) => word !== previousWord);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function toBlanks(word) {
  return word
    .split('')
    .map((char) => (char === ' ' ? ' ' : '_'))
    .join(' ');
}

export function normalizeGuess(value) {
  return String(value || '').trim().toLowerCase();
}
