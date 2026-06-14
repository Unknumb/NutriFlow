// nutriflow-frontend/src/shared/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react';

/**
 * Devuelve el valor "estabilizado" después de `delayMs` sin cambios.
 * Útil para búsquedas server-side mientras el usuario escribe.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
