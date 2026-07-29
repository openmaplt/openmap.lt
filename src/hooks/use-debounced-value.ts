import { useEffect, useState } from "react";

// Debounces a primitive value — pass values already reduced to
// strings/numbers/booleans (not fresh object/array literals, which get a new
// identity every render and would reset the timer on every call regardless
// of whether the underlying data actually changed).
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
