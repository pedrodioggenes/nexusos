import { useEffect, useRef } from "react";

/**
 * Hook de diagnóstico silencioso — marca início/fim de montagem
 * de um componente/widget e loga a duração apenas em dev.
 *
 * Uso:
 * ```tsx
 * function MyWidget() {
 *   usePerfMark("MyWidget");
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePerfMark(name: string): void {
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (import.meta.env.DEV) {
      startRef.current = performance.now();

      return () => {
        const duration = performance.now() - startRef.current;
        console.debug(
          `[perf] ${name}: ${duration.toFixed(1)}ms (mount→unmount)`,
        );
      };
    }
  }, [name]);
}
