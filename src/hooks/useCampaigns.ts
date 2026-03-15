import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type MessageType = Database['public']['Enums']['message_type'];
type UnitScope = Database['public']['Enums']['unit_scope'];
type CampaignStatus = Database['public']['Enums']['campaign_status'];

export interface Campaign {
  id: string;
  title: string;
  message_type: MessageType;
  unit_scope: UnitScope;
  content_text: string;
  media_url: string | null;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithUnits extends Campaign {
  campaign_units: { unit_id: string; units: { id: string; name: string; city: string } }[];
}

export interface CreateCampaignData {
  title: string;
  message_type: MessageType;
  unit_scope: UnitScope;
  content_text: string;
  media_url?: string;
  scheduled_at?: string;
  unit_ids?: string[];
}

export function useCampaigns(filters?: { status?: CampaignStatus; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          campaign_units (
            unit_id,
            units (id, name, city)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as unknown as CampaignWithUnits[];
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_units (
            unit_id,
            units (id, name, city)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as CampaignWithUnits;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          title: data.title,
          message_type: data.message_type,
          unit_scope: data.unit_scope,
          content_text: data.content_text,
          media_url: data.media_url || null,
          scheduled_at: data.scheduled_at || null,
          created_by: user?.id || null,
        })
        .select()
        .single();
      
      if (campaignError) throw campaignError;

      // Create campaign_units if needed
      if (data.unit_ids && data.unit_ids.length > 0) {
        const campaignUnits = data.unit_ids.map(unit_id => ({
          campaign_id: campaign.id,
          unit_id,
        }));

        const { error: unitsError } = await supabase
          .from('campaign_units')
          .insert(campaignUnits);

        if (unitsError) throw unitsError;
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campanha criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar campanha: ' + error.message);
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, unit_ids, ...data }: { id: string; unit_ids?: string[] } & Partial<CreateCampaignData>) => {
      // Update campaign
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({
          title: data.title,
          message_type: data.message_type,
          unit_scope: data.unit_scope,
          content_text: data.content_text,
          media_url: data.media_url,
          scheduled_at: data.scheduled_at,
        })
        .eq('id', id);
      
      if (campaignError) throw campaignError;

      // Update campaign_units if needed
      if (unit_ids !== undefined) {
        // Delete existing
        await supabase.from('campaign_units').delete().eq('campaign_id', id);

        // Insert new
        if (unit_ids.length > 0) {
          const campaignUnits = unit_ids.map(unit_id => ({
            campaign_id: id,
            unit_id,
          }));

          const { error: unitsError } = await supabase
            .from('campaign_units')
            .insert(campaignUnits);

          if (unitsError) throw unitsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campanha atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar campanha: ' + error.message);
    },
  });
}

export function useCalculateAudience() {
  return useMutation({
    mutationFn: async ({ unitScope, unitIds }: { unitScope: UnitScope; unitIds?: string[] }) => {
      // Get active contacts with their subscriptions
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select(`
          id,
          subscriptions (
            scope,
            unit_id
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      const audienceByUnit: Record<string, number> = {};
      const uniqueContactIds = new Set<string>();

      contacts.forEach((contact: any) => {
        const subscription = contact.subscriptions;
        if (!subscription) return;

        if (unitScope === 'all_units') {
          // Only include contacts with all_units subscription
          if (subscription.scope === 'all_units') {
            uniqueContactIds.add(contact.id);
            audienceByUnit['Todas as unidades'] = (audienceByUnit['Todas as unidades'] || 0) + 1;
          }
        } else if (unitScope === 'single_unit' && unitIds && unitIds.length === 1) {
          const targetUnitId = unitIds[0];
          if (subscription.scope === 'all_units' || 
              (subscription.scope === 'single_unit' && subscription.unit_id === targetUnitId)) {
            uniqueContactIds.add(contact.id);
          }
        } else if (unitScope === 'selected_units' && unitIds && unitIds.length > 0) {
          if (subscription.scope === 'all_units') {
            uniqueContactIds.add(contact.id);
          } else if (subscription.scope === 'single_unit' && unitIds.includes(subscription.unit_id)) {
            uniqueContactIds.add(contact.id);
          }
        }
      });

      return {
        total: uniqueContactIds.size,
        byUnit: audienceByUnit,
      };
    },
  });
}

export function useSendCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_units (unit_id)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      const unitIds = campaign.campaign_units?.map((cu: any) => cu.unit_id) || [];

      // Get eligible contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          subscriptions (scope, unit_id)
        `)
        .eq('status', 'active');

      if (contactsError) throw contactsError;

      // Filter contacts based on campaign scope
      const eligibleContacts: { contactId: string; resolvedUnitId: string | null }[] = [];

      contacts.forEach((contact: any) => {
        const subscription = contact.subscriptions;
        if (!subscription) return;

        if (campaign.unit_scope === 'all_units') {
          if (subscription.scope === 'all_units') {
            eligibleContacts.push({ contactId: contact.id, resolvedUnitId: null });
          }
        } else if (campaign.unit_scope === 'single_unit' && unitIds.length === 1) {
          const targetUnitId = unitIds[0];
          if (subscription.scope === 'all_units' || 
              (subscription.scope === 'single_unit' && subscription.unit_id === targetUnitId)) {
            eligibleContacts.push({ contactId: contact.id, resolvedUnitId: targetUnitId });
          }
        } else if (campaign.unit_scope === 'selected_units' && unitIds.length > 0) {
          if (subscription.scope === 'all_units') {
            eligibleContacts.push({ contactId: contact.id, resolvedUnitId: null });
          } else if (subscription.scope === 'single_unit' && unitIds.includes(subscription.unit_id)) {
            eligibleContacts.push({ contactId: contact.id, resolvedUnitId: subscription.unit_id });
          }
        }
      });

      // Create message logs
      if (eligibleContacts.length > 0) {
        const messageLogs = eligibleContacts.map(({ contactId, resolvedUnitId }) => ({
          campaign_id: campaignId,
          contact_id: contactId,
          resolved_unit_id: resolvedUnitId,
          status: 'queued' as const,
        }));

        const { error: logsError } = await supabase
          .from('message_logs')
          .insert(messageLogs);

        if (logsError) throw logsError;
      }

      // Update campaign status
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      return { sentCount: eligibleContacts.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['message_logs'] });
      toast.success(`Campanha disparada com sucesso! ${data.sentCount} mensagens enfileiradas.`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao disparar campanha: ' + error.message);
    },
  });
}
