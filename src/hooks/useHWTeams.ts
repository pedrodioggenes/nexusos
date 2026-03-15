import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWDepartmentWithTeams {
  id: string;
  name: string;
  teams: {
    id: string;
    name: string;
    leaderName: string;
    members: {
      id: string;
      userId: string;
      name: string;
      initials: string;
      role: string;
      status: string;
      online: boolean;
      trainings: number;
    }[];
  }[];
}

export function useHWDepartments(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-departments", tenantId],
    queryFn: async (): Promise<HWDepartmentWithTeams[]> => {
      if (!tenantId) return [];

      // Get departments
      const { data: departments, error: deptErr } = await supabase
        .from("hw_departments")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name");
      if (deptErr) throw deptErr;
      if (!departments?.length) return [];

      // Get teams
      const deptIds = departments.map(d => d.id);
      const { data: teams } = await supabase
        .from("hw_teams")
        .select("*")
        .in("department_id", deptIds);

      // Get team members
      const teamIds = (teams || []).map(t => t.id);
      let members: any[] = [];
      if (teamIds.length > 0) {
        const { data: tm } = await supabase
          .from("hw_team_members")
          .select("*")
          .in("team_id", teamIds);
        members = tm || [];
      }

      // Get profiles for all user IDs (leaders + members)
      const leaderIds = (teams || []).filter(t => t.leader_id).map(t => t.leader_id!);
      const memberUserIds = members.map(m => m.user_id);
      const allUserIds = [...new Set([...leaderIds, ...memberUserIds])];

      let profileMap = new Map<string, any>();
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", allUserIds);
        profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      }

      // Get department roles for member user IDs
      let roleMap = new Map<string, string>();
      if (memberUserIds.length > 0) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, department_role")
          .in("user_id", memberUserIds);
        roleMap = new Map((roles || []).map(r => [r.user_id, r.department_role || 'Colaborador']));
      }

      // Get training counts
      let trainingMap = new Map<string, number>();
      if (memberUserIds.length > 0) {
        const { data: trainings } = await supabase
          .from("hw_training_assignments")
          .select("user_id")
          .in("user_id", memberUserIds)
          .eq("status", "pending");
        const counts: Record<string, number> = {};
        (trainings || []).forEach(t => { counts[t.user_id] = (counts[t.user_id] || 0) + 1; });
        trainingMap = new Map(Object.entries(counts));
      }

      return departments.map(dept => {
        const deptTeams = (teams || []).filter(t => t.department_id === dept.id);

        return {
          id: dept.id,
          name: dept.name,
          teams: deptTeams.map(team => {
            const leaderProfile = team.leader_id ? profileMap.get(team.leader_id) : null;
            const leaderName = leaderProfile?.full_name || leaderProfile?.email?.split("@")[0] || 'Sem líder';

            const teamMembers = members
              .filter(m => m.team_id === team.id)
              .map(m => {
                const profile = profileMap.get(m.user_id);
                const name = profile?.full_name || profile?.email?.split("@")[0] || 'Usuário';
                const role = roleMap.get(m.user_id) || 'Colaborador';
                return {
                  id: m.id,
                  userId: m.user_id,
                  name,
                  initials: name.slice(0, 2).toUpperCase(),
                  role,
                  status: 'ativo',
                  online: false,
                  trainings: trainingMap.get(m.user_id) || 0,
                };
              });

            return { id: team.id, name: team.name, leaderName, members: teamMembers };
          }),
        };
      });
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("hw_team_members")
        .insert([{ team_id: teamId, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-departments", variables.tenantId] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, tenantId }: { memberId: string; tenantId: string }) => {
      const { error } = await supabase.from("hw_team_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-departments", variables.tenantId] });
    },
  });
}
