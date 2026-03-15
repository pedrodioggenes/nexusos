import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Global handler for unhandled promise rejections
 * Prevents async errors in event handlers from crashing the entire app
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      
      // Prevent the default browser behavior (crash)
      event.preventDefault();
      
      // Show user-friendly error message
      const message = event.reason?.message || "Ocorreu um erro inesperado. Tente novamente.";
      toast.error(message);
    };

    window.addEventListener("unhandledrejection", handleRejection);
    
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return <>{children}</>;
}
