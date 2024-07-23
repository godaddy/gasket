import { useContext } from 'react';
import { GasketIntlContext } from './context';

/**
 * React hook that dispatches locale file load and returns status
 * @type {import('.').useMessages}
 */
export default function useMessages() {
  const { messages } = useContext(GasketIntlContext);
  return messages;
}
