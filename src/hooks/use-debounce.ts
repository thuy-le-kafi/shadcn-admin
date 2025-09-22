import { useEffect, useRef, useState } from 'react';

export const useDebounce = <T>(data: T, delay: number, throttle?: boolean) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(data);
  const lastExecuted = useRef(0);

  useEffect(
    () => {
      if (throttle) {
        const now = Date.now();
        const timeSinceLastExecuted = now - lastExecuted.current;

        if (timeSinceLastExecuted >= delay) {
          setDebouncedValue(data);
          lastExecuted.current = now;
        } else {
          const handler = setTimeout(() => {
            setDebouncedValue(data);
            lastExecuted.current = Date.now();
          }, delay - timeSinceLastExecuted);

          return () => {
            clearTimeout(handler);
          };
        }
      } else {
        // Set debouncedValue to value (passed in) after the specified delay
        const handler = setTimeout(() => {
          setDebouncedValue(data);
        }, delay);

        // Return a cleanup function that will be called every time ...
        // ... useEffect is re-called. useEffect will only be re-called ...
        // ... if value changes (see the inputs array below).
        // This is how we prevent debouncedValue from changing if value is ...
        // ... changed within the delay period. Timeout gets cleared and restarted.
        // To put it in context, if the user is typing within our app's ...
        // ... search box, we don't want the debouncedValue to update until ...
        // ... they've stopped typing for more than 500ms.
        return () => {
          clearTimeout(handler);
        };
      }
    },
    // Only re-call effect if value changes
    // You could also add the "delay" var to inputs array if you ...
    // ... need to be able to change that dynamically.
    [data, throttle, delay],
  );

  return debouncedValue;
};
