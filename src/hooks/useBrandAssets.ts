import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type AssetType = 'logo' | 'font' | 'color' | 'template' | 'image' | 'video' | 'document' | 'guideline';

export interface BrandAsset {
  id: string;
  tenant_id: string | null;
  name: string;
  asset_type: AssetType;
  file_url: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  usage_guidelines: string | null;
  is_approved: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  name: string;
  asset_type: AssetType;
  file_url?: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  usage_guidelines?: string;
  is_approved?: boolean;
}

export interface UpdateAssetInput {
  id: string;
  name?: string;
  asset_type?: AssetType;
  file_url?: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  usage_guidelines?: string;
  is_approved?: boolean;
}

// Fetch all brand assets
export function useBrandAssets(assetType?: AssetType, category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['brand-assets', assetType, category],
    queryFn: async () => {
      let query = supabase
        .from('team_brand_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BrandAsset[];
    },
    enabled: !!user,
  });
}

// Search assets by tags or name
export function useSearchAssets(searchTerm: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['brand-assets', 'search', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_brand_assets')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BrandAsset[];
    },
    enabled: !!user && searchTerm.length > 2,
  });
}

// Get asset categories
export function useAssetCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['brand-assets', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_brand_assets')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;
      
      const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
      return categories as string[];
    },
    enabled: !!user,
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAssetInput) => {
      const { data, error } = await supabase
        .from('team_brand_assets')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar asset: ' + error.message);
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAssetInput) => {
      const { data, error } = await supabase
        .from('team_brand_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar asset: ' + error.message);
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_brand_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover asset: ' + error.message);
    },
  });
}

// Color assets helper
export interface ColorAsset extends BrandAsset {
  colorValue?: string;
  colorName?: string;
}

export function useBrandColors() {
  const { data: assets, ...rest } = useBrandAssets('color');

  const colors: ColorAsset[] = (assets || []).map(asset => ({
    ...asset,
    colorValue: (asset.tags?.[0] || '#000000'),
    colorName: asset.name,
  }));

  return { colors, ...rest };
}
