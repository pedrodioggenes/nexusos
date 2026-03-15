import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WorkSchedule {
  start?: string; // "08:00"
  end?: string;   // "18:00"
  days?: number[]; // 0=Sun, 1=Mon...6=Sat
}

const OFF_HOURS_TERM_TEXT = `Declaro, por livre e espontânea vontade, que estou acessando o sistema NexusDesk fora do meu horário regular de trabalho. Estou ciente de que este acesso não configura hora extra, sobreaviso ou qualquer outra modalidade de trabalho extraordinário, e que a empresa está isenta de qualquer obrigação de pagamento adicional decorrente deste acesso voluntário.`;

export function useHWOffHoursCheck() {
  const { user, tenant } = useAuth();
  const [isOffHours, setIsOffHours] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);

  useEffect(() => {
    if (!user?.id || !tenant?.id) {
      setIsChecking(false);
      return;
    }

    const checkSchedule = async () => {
      try {
        // Get employee work_schedule
        const { data: employee } = await (supabase as any)
          .from('employees')
          .select('work_schedule')
          .eq('user_id', user.id)
          .eq('tenant_id', tenant.id)
          .maybeSingle();

        if (!employee?.work_schedule) {
          // No schedule defined = no restriction
          setIsOffHours(false);
          setIsChecking(false);
          return;
        }

        const schedule = employee.work_schedule as WorkSchedule;
        setWorkSchedule(schedule);

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Check day
        const workDays = schedule.days ?? [1, 2, 3, 4, 5]; // Default Mon-Fri
        const isDayOff = !workDays.includes(currentDay);

        // Check time
        const start = schedule.start ?? '08:00';
        const end = schedule.end ?? '18:00';
        const isOutsideHours = currentTime < start || currentTime >= end;

        const offHours = isDayOff || isOutsideHours;
        setIsOffHours(offHours);

        if (offHours) {
          // Check if already accepted today
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const { data: existingTerm } = await (supabase as any)
            .from('hw_off_hours_access_terms')
            .select('id')
            .eq('user_id', user.id)
            .eq('tenant_id', tenant.id)
            .gte('accessed_at', todayStart.toISOString())
            .limit(1);

          if (existingTerm && existingTerm.length > 0) {
            setHasAccepted(true);
          }
        }
      } catch (err) {
        console.error('Error checking work schedule:', err);
        setIsOffHours(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSchedule();
  }, [user?.id, tenant?.id]);

  const acceptTermWithPassword = useCallback(async (password: string) => {
    if (!user?.id || !tenant?.id || !user.email) throw new Error('Not authenticated');

    // Verify password by attempting sign-in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError) {
      throw new Error('Senha incorreta');
    }

    // Generate term hash
    const termData = `${user.id}|${new Date().toISOString()}|${OFF_HOURS_TERM_TEXT}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(termData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const termHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert legal term
    const { error } = await (supabase as any)
      .from('hw_off_hours_access_terms')
      .insert({
        user_id: user.id,
        tenant_id: tenant.id,
        term_text: OFF_HOURS_TERM_TEXT,
        term_hash: termHash,
        user_agent: navigator.userAgent,
        work_schedule: workSchedule,
      });

    if (error) throw error;

    setHasAccepted(true);
  }, [user?.id, user?.email, tenant?.id, workSchedule]);

  // Show guard if off-hours AND not yet accepted
  const showGuard = isOffHours && !hasAccepted && !isChecking;

  return {
    showGuard,
    isChecking,
    acceptTermWithPassword,
    termText: OFF_HOURS_TERM_TEXT,
  };
}
