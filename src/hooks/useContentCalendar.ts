import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

export type ContentType = 'post' | 'story' | 'reel' | 'video' | 'email' | 'ad' | 'blog' | 'newsletter';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';

export interface ContentCalendarItem {
  id: string;
  tenant_id: string | null;
  title: string;
  content_type: ContentType;
  platform: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: ContentStatus;
  task_id: string | null;
  copy_text: string | null;
  media_urls: string[];
  hashtags: string[];
  performance_metrics: Json;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContentInput {
  title: string;
  content_type: ContentType;
  platform: string;
  scheduled_date: string;
  scheduled_time?: string;
  status?: ContentStatus;
  task_id?: string;
  copy_text?: string;
  media_urls?: string[];
  hashtags?: string[];
}

export interface UpdateContentInput {
  id: string;
  title?: string;
  content_type?: ContentType;
  platform?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status?: ContentStatus;
  copy_text?: string;
  media_urls?: string[];
  hashtags?: string[];
  performance_metrics?: Json;
}

// Fetch content for a specific month
export function useContentCalendar(month?: Date) {
  const { user } = useAuth();
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ['content-calendar', format(targetMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(targetMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('team_content_calendar')
        .select('*')
        .gte('scheduled_date', start)
        .lte('scheduled_date', end)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as ContentCalendarItem[];
    },
    enabled: !!user,
  });
}

// Fetch upcoming content
export function useUpcomingContent(limit = 5) {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['content-calendar', 'upcoming', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_content_calendar')
        .select('*')
        .gte('scheduled_date', today)
        .in('status', ['draft', 'scheduled'])
        .order('scheduled_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as ContentCalendarItem[];
    },
    enabled: !!user,
  });
}

// Create content
export function useCreateContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateContentInput) => {
      const { data, error } = await supabase
        .from('team_content_calendar')
        .insert({
          title: input.title,
          content_type: input.content_type,
          platform: input.platform,
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time,
          status: input.status,
          task_id: input.task_id,
          copy_text: input.copy_text,
          media_urls: input.media_urls,
          hashtags: input.hashtags,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Conteúdo agendado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao agendar conteúdo: ' + error.message);
    },
  });
}

// Update content
export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateContentInput) => {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content_type !== undefined) updateData.content_type = updates.content_type;
      if (updates.platform !== undefined) updateData.platform = updates.platform;
      if (updates.scheduled_date !== undefined) updateData.scheduled_date = updates.scheduled_date;
      if (updates.scheduled_time !== undefined) updateData.scheduled_time = updates.scheduled_time;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.copy_text !== undefined) updateData.copy_text = updates.copy_text;
      if (updates.media_urls !== undefined) updateData.media_urls = updates.media_urls;
      if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
      if (updates.performance_metrics !== undefined) updateData.performance_metrics = updates.performance_metrics;

      const { data, error } = await supabase
        .from('team_content_calendar')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Conteúdo atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });
}

// Delete content
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_content_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
      toast.success('Conteúdo removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });
}
