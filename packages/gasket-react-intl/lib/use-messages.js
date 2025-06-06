import { useContext } from 'react';
import { GasketIntlContext } from './context.js';

/**
 * React hook that dispatches locale file load and returns status
 * @type {import('./index.d.ts').useMessages}
 */
export default function useMessages() {
  const { messages } = useContext(GasketIntlContext);
  return messages;
}
