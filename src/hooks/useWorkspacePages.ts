import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkspacePage {
  id: string;
  tenant_id: string | null;
  parent_page_id: string | null;
  title: string;
  icon: string;
  cover_image: string | null;
  content: unknown[];
  is_template: boolean;
  is_favorite: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreatePageInput {
  title?: string;
  icon?: string;
  parent_page_id?: string;
  content?: unknown[];
}

export interface UpdatePageInput {
  id: string;
  title?: string;
  icon?: string;
  cover_image?: string | null;
  content?: unknown[];
  is_favorite?: boolean;
  parent_page_id?: string | null;
}

// Fetch all active pages (not deleted)
export function useWorkspacePages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workspace-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_pages')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WorkspacePage[];
    },
    enabled: !!user,
  });
}

// Fetch trashed pages
export function useTrashedPages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workspace-pages-trashed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_pages')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WorkspacePage[];
    },
    enabled: !!user,
  });
}

// Fetch single page
export function useWorkspacePage(pageId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workspace-page', pageId],
    queryFn: async () => {
      if (!pageId) return null;
      
      const { data, error } = await supabase
        .from('workspace_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      return data as WorkspacePage;
    },
    enabled: !!user && !!pageId,
  });
}

// Fetch pages tree (for sidebar)
export function useWorkspacePagesTree() {
  const { data: pages, ...rest } = useWorkspacePages();

  // Build tree structure
  const buildTree = (pages: WorkspacePage[], parentId: string | null = null): (WorkspacePage & { children: WorkspacePage[] })[] => {
    return pages
      .filter(p => p.parent_page_id === parentId)
      .map(page => ({
        ...page,
        children: buildTree(pages, page.id) as WorkspacePage[],
      }));
  };

  const tree = pages ? buildTree(pages) : [];
  const favorites = pages?.filter(p => p.is_favorite) || [];

  return { tree, favorites, pages, ...rest };
}

// Create page
export function useCreateWorkspacePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePageInput) => {
      // BlockNote requires at least one block - create default paragraph block
      const defaultContent = [
        {
          id: crypto.randomUUID(),
          type: "paragraph",
          props: {
            textColor: "default",
            backgroundColor: "default",
            textAlignment: "left"
          },
          content: [],
          children: []
        }
      ];
      
      const insertData: Record<string, unknown> = {
        title: input.title || 'Sem título',
        icon: input.icon || '📄',
        parent_page_id: input.parent_page_id || null,
        content: (input.content && input.content.length > 0 ? input.content : defaultContent) as unknown,
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('workspace_pages')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as WorkspacePage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages'] });
    },
    onError: (error) => {
      toast.error('Erro ao criar página: ' + error.message);
    },
  });
}

// Update page
export function useUpdateWorkspacePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePageInput) => {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.cover_image !== undefined) updateData.cover_image = updates.cover_image;
      if (updates.content !== undefined) updateData.content = updates.content as unknown;
      if (updates.is_favorite !== undefined) updateData.is_favorite = updates.is_favorite;
      if (updates.parent_page_id !== undefined) updateData.parent_page_id = updates.parent_page_id;

      const { data, error } = await supabase
        .from('workspace_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkspacePage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-page', data.id] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar página: ' + error.message);
    },
  });
}

// Soft delete page (move to trash)
export function useDeleteWorkspacePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workspace_pages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-pages-trashed'] });
      toast.success('Página movida para a lixeira');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });
}

// Restore page from trash
export function useRestorePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workspace_pages')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-pages-trashed'] });
      toast.success('Página restaurada');
    },
    onError: (error) => {
      toast.error('Erro ao restaurar: ' + error.message);
    },
  });
}

// Permanent delete page
export function usePermanentDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workspace_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages-trashed'] });
      toast.success('Página excluída permanentemente');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });
}

// Empty trash (delete all trashed pages)
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('workspace_pages')
        .delete()
        .not('deleted_at', 'is', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages-trashed'] });
      toast.success('Lixeira esvaziada');
    },
    onError: (error) => {
      toast.error('Erro ao esvaziar lixeira: ' + error.message);
    },
  });
}

// Toggle favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from('workspace_pages')
        .update({ is_favorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-pages'] });
    },
  });
}
