import { useRef } from 'react';

export const useDoubleTap = (
  onSingleTap: () => void,
  onDoubleTap: () => void,
  delay: number = 300
) => {
  const lastTap = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      if (timer.current) clearTimeout(timer.current);
      lastTap.current = 0;
      onDoubleTap();
    } else {
      lastTap.current = now;
      timer.current = setTimeout(() => {
        onSingleTap();
      }, delay);
    }
  };

  return handleTap;
};
