import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch user_roles and profiles separately to avoid FK issues
      const [rolesResult, profilesResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('user_id, email, full_name')
      ]);

      if (rolesResult.error) throw rolesResult.error;
      if (profilesResult.error) throw profilesResult.error;

      // Combine the data
      const usersWithProfiles = rolesResult.data.map(role => ({
        ...role,
        profiles: profilesResult.data?.find(p => p.user_id === role.user_id) || null
      }));

      return usersWithProfiles as UserWithRole[];
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Perfil do usuário atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
}
