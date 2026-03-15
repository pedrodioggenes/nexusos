import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TaskType = 'social' | 'traffic' | 'design' | 'copy' | 'video';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision';

export interface TeamTask {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
  assignee_name: string | null;
  deadline: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  platforms: string[];
  campaign_id: string | null;
  parent_task_id: string | null;
  attachments: string[];
  approval_status: ApprovalStatus | null;
  approved_by: string | null;
  approved_at: string | null;
  revision_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  task_type: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: string;
  deadline?: string;
  estimated_hours?: number;
  platforms?: string[];
  campaign_id?: string;
  parent_task_id?: string;
  attachments?: string[];
  source_page_id?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: string;
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  platforms?: string[];
  approval_status?: ApprovalStatus;
  revision_notes?: string;
}

interface TaskWithProfile {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  platforms: string[] | null;
  campaign_id: string | null;
  parent_task_id: string | null;
  attachments: unknown;
  approval_status: string | null;
  approved_by: string | null;
  approved_at: string | null;
  revision_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
}

// Fetch tasks by type
export function useTeamTasks(taskType?: TaskType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-tasks', taskType],
    queryFn: async () => {
      let query = supabase
        .from('team_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (taskType) {
        query = query.eq('task_type', taskType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((task): TeamTask => ({
        ...task,
        task_type: task.task_type as TaskType,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
        assignee_name: null, // Will be populated separately if needed
        platforms: task.platforms || [],
        attachments: Array.isArray(task.attachments) ? task.attachments as string[] : [],
        approval_status: task.approval_status as ApprovalStatus | null,
      }));
    },
    enabled: !!user,
  });
}

// Fetch tasks grouped by status (for Kanban)
export function useTeamTasksByStatus(taskType?: TaskType) {
  const { data: tasks, ...rest } = useTeamTasks(taskType);

  const tasksByStatus = {
    backlog: tasks?.filter(t => t.status === 'backlog') || [],
    todo: tasks?.filter(t => t.status === 'todo') || [],
    in_progress: tasks?.filter(t => t.status === 'in_progress') || [],
    review: tasks?.filter(t => t.status === 'review') || [],
    done: tasks?.filter(t => t.status === 'done') || [],
  };

  return { tasksByStatus, tasks, ...rest };
}

// Create new task
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const insertData = {
        title: input.title,
        description: input.description,
        task_type: input.task_type,
        priority: input.priority || 'medium',
        status: input.status || 'backlog',
        assigned_to: input.assignee_id,
        deadline: input.deadline,
        estimated_hours: input.estimated_hours,
        platforms: input.platforms || [],
        campaign_id: input.campaign_id,
        parent_task_id: input.parent_task_id,
        attachments: input.attachments || [],
        created_by: user?.id,
        source_page_id: input.source_page_id,
      };
      
      const { data, error } = await supabase
        .from('team_tasks')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['team-tasks', variables.task_type] });
      toast.success('Demanda criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar demanda: ' + error.message);
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput) => {
      const { data, error } = await supabase
        .from('team_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar demanda: ' + error.message);
    },
  });
}

// Update task status (for Kanban drag-and-drop)
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data, error } = await supabase
        .from('team_tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
    },
  });
}

// Approve task
export function useApproveTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, approved, notes }: { id: string; approved: boolean; notes?: string }) => {
      const { data, error } = await supabase
        .from('team_tasks')
        .update({
          approval_status: approved ? 'approved' : 'revision',
          approved_by: approved ? user?.id : null,
          approved_at: approved ? new Date().toISOString() : null,
          revision_notes: !approved ? notes : null,
          status: approved ? 'approved' : 'review',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success(variables.approved ? 'Demanda aprovada!' : 'Solicitada revisão');
    },
    onError: (error) => {
      toast.error('Erro na aprovação: ' + error.message);
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Demanda excluída');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });
}
