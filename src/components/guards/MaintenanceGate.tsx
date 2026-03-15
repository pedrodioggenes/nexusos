import { useEffect, useState, ReactNode } from 'react';
import { Wrench } from 'lucide-react';

const EXTERNAL_URL = 'https://aocrxaercsmgcnybdsto.supabase.co';
const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvY3J4YWVyY3NtZ2NueWJkc3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzE5ODYsImV4cCI6MjA4ODk0Nzk4Nn0.4ib9mUb_MfDP4TPvWpx0jRJ2knEakIt0UO3kX4hyd1k';

interface MaintenanceGateProps {
  children: ReactNode;
}

/**
 * Global maintenance gate — uses direct REST API call to bypass RLS.
 * Works even when no user is authenticated (anon key + apikey header).
 * Shows maintenance screen on ANY route when maintenance_mode is true.
 */
export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const [checking, setChecking] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        // Direct REST call bypasses supabase-js session/RLS issues
        const res = await fetch(
          `${EXTERNAL_URL}/rest/v1/system_settings?key=eq.maintenance_mode&select=value`,
          {
            headers: {
              'apikey': EXTERNAL_ANON_KEY,
              'Authorization': `Bearer ${EXTERNAL_ANON_KEY}`,
            },
          }
        );
        
        if (res.ok) {
          const rows = await res.json();
          if (mounted && rows.length > 0) {
            const val = rows[0].value;
            setIsMaintenance(val === true || val === 'true');
          } else if (mounted) {
            setIsMaintenance(false);
          }
        }
      } catch {
        // If check fails, allow access (don't block if network error)
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    // Re-check every 30s in case maintenance is toggled
    const interval = setInterval(check, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-5 w-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-festval-charcoal px-4">
        <div className="text-center max-w-md space-y-8">
          {/* Araripe wordmark */}
          <p className="font-['Playfair_Display'] text-lg font-bold tracking-wide text-festval-ivory">
            Araripe<span className="text-festval-copper">·</span>
          </p>

          {/* Icon */}
          <div className="mx-auto h-16 w-16 rounded-2xl bg-festval-copper/10 flex items-center justify-center border border-festval-border">
            <Wrench className="h-7 w-7 text-festval-copper" />
          </div>

          {/* Copy */}
          <div className="space-y-3">
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-festval-ivory tracking-tight">
              Sistema em Manutenção
            </h1>
            <p className="text-festval-stone text-sm leading-relaxed font-['DM_Sans']">
              Estamos realizando melhorias para oferecer uma experiência ainda melhor.
              Voltamos em instantes.
            </p>
          </div>

          {/* Pulsing dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-festval-copper animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-festval-copper animate-pulse [animation-delay:300ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-festval-copper animate-pulse [animation-delay:600ms]" />
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-festval-stone-muted text-[11px] font-['DM_Mono'] tracking-wider uppercase">
          Nexus OS · Araripe.me
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
