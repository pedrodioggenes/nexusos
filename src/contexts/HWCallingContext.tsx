/**
 * Global calling context — makes useHWCalling available across all NexusDesk views.
 */
import { createContext, useContext } from 'react';
import { useHWCalling } from '@/hooks/useHWCalling';
import type { CallType, CallStatus } from '@/hooks/useHWCalling';

type HWCallingContextType = ReturnType<typeof useHWCalling>;

const HWCallingContext = createContext<HWCallingContextType | null>(null);

export function HWCallingProvider({ children }: { children: React.ReactNode }) {
  const calling = useHWCalling();
  return (
    <HWCallingContext.Provider value={calling}>
      {children}
    </HWCallingContext.Provider>
  );
}

export function useGlobalCalling(): HWCallingContextType {
  const ctx = useContext(HWCallingContext);
  if (!ctx) throw new Error('useGlobalCalling must be used within HWCallingProvider');
  return ctx;
}

export type { CallType, CallStatus };
