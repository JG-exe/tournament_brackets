import { useEffect, useReducer } from 'react';

/** useReducer that loads from / saves to localStorage. null state clears it. */
export function usePersistedReducer(reducer, key) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (state) localStorage.setItem(key, JSON.stringify(state));
      else localStorage.removeItem(key);
    } catch {
      /* storage blocked: app still works, just no persistence */
    }
  }, [state, key]);

  return [state, dispatch];
}
