// src/shared/ui/route-loader/RouteLoaderContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';

const MIN_LOADER_MS = 500;

type RouteLoaderContextValue = {
  visible: boolean;
  start: () => void;
  stop: () => void;
};

const RouteLoaderContext = createContext<RouteLoaderContextValue | null>(null);

export function RouteLoaderProvider({ children }: PropsWithChildren) {
  const [visible, setVisible] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const start = useCallback(() => {
    // если уже показываем – не перезапускаем
    if (visible && startedAtRef.current !== null) return;

    clearTimer();
    startedAtRef.current = Date.now();
    setVisible(true);
  }, [visible]);

  const stop = useCallback(() => {
    if (!startedAtRef.current) {
      // на всякий случай
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const rest = MIN_LOADER_MS - elapsed;

    if (rest <= 0) {
      setVisible(false);
      startedAtRef.current = null;
      clearTimer();
    } else {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        startedAtRef.current = null;
        clearTimer();
      }, rest);
    }
  }, []);

  const value: RouteLoaderContextValue = {
    visible,
    start,
    stop,
  };

  return (
    <RouteLoaderContext.Provider value={value}>
      {children}
    </RouteLoaderContext.Provider>
  );
}

export function useRouteLoader() {
  const ctx = useContext(RouteLoaderContext);
  if (!ctx) {
    throw new Error('useRouteLoader must be used within RouteLoaderProvider');
  }
  return ctx;
}