/**
 * Hook for NexusDesk team members (tenant members with presence)
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  initials: string;
  email: string;
  avatar_url?: string;
  role?: string;
  department_role?: string;
}

export function useHWMembers() {
  const { tenant } = useAuth();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['nexusdesk-members', tenant?.id],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!tenant?.id) return [];

      const [rolesRes, profilesRes] = await Promise.all([
        supabase
          .from('user_roles')
          .select('user_id, role, department_role')
          .eq('tenant_id', tenant.id)
          .eq('user_type', 'internal')
          .limit(50),
        supabase
          .from('profiles')
          .select('user_id, full_name, email, avatar_url'),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const profileMap = new Map(
        (profilesRes.data || []).map((p) => [p.user_id, p])
      );

      return (rolesRes.data || []).map((ur) => {
        const p = profileMap.get(ur.user_id);
        const name = p?.full_name || p?.email?.split('@')[0] || 'Usuário';
        return {
          id: ur.user_id,
          user_id: ur.user_id,
          full_name: name,
          initials: name.slice(0, 2).toUpperCase(),
          email: p?.email || '',
          avatar_url: p?.avatar_url,
          role: ur.role,
          department_role: ur.department_role,
        } as TeamMember;
      });
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 5,
  });

  return { members, isLoading };
}
