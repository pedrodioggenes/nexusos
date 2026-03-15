import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactsByUnitReport {
  phone: string;
  name: string;
  status: string;
  scope: string;
  unit_name: string;
  city: string;
}

export interface GeneralContactsReport {
  phone: string;
  name: string;
  status: string;
  scope: string;
  unit_name: string;
  created_at: string;
  last_interaction_at: string;
}

export interface CampaignVolumeReport {
  title: string;
  message_type: string;
  unit_scope: string;
  status: string;
  sent_at: string;
  total_messages: number;
  queued: number;
  sent: number;
  failed: number;
}

export interface OptOutReport {
  phone: string;
  name: string;
  unit_name: string;
  updated_at: string;
}

export function useContactsByUnitReport(unitId?: string) {
  return useQuery({
    queryKey: ['reports', 'contacts-by-unit', unitId],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select(`
          phone_e164,
          name,
          status,
          subscriptions (
            scope,
            units (name, city)
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let result = (data as any[]).map(contact => ({
        phone: contact.phone_e164,
        name: contact.name || '',
        status: contact.status,
        scope: contact.subscriptions?.scope || 'N/A',
        unit_name: contact.subscriptions?.units?.name || 'Todas',
        city: contact.subscriptions?.units?.city || 'N/A',
      }));

      if (unitId) {
        result = result.filter(c => 
          c.scope === 'all_units' || 
          (data as any[]).find(d => 
            d.phone_e164 === c.phone && 
            d.subscriptions?.units?.id === unitId
          )
        );
      }

      return result as ContactsByUnitReport[];
    },
  });
}

export function useGeneralContactsReport() {
  return useQuery({
    queryKey: ['reports', 'general-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          phone_e164,
          name,
          status,
          created_at,
          last_interaction_at,
          subscriptions (
            scope,
            units (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as any[]).map(contact => ({
        phone: contact.phone_e164,
        name: contact.name || '',
        status: contact.status,
        scope: contact.subscriptions?.scope || 'N/A',
        unit_name: contact.subscriptions?.units?.name || 'Todas',
        created_at: contact.created_at,
        last_interaction_at: contact.last_interaction_at || '',
      })) as GeneralContactsReport[];
    },
  });
}

export function useCampaignVolumeReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'campaign-volume', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: campaigns, error: campaignsError } = await query;
      if (campaignsError) throw campaignsError;

      const result: CampaignVolumeReport[] = [];

      for (const campaign of campaigns) {
        const { data: logs, error: logsError } = await supabase
          .from('message_logs')
          .select('status')
          .eq('campaign_id', campaign.id);

        if (logsError) throw logsError;

        const total = logs?.length || 0;
        const queued = logs?.filter(l => l.status === 'queued').length || 0;
        const sent = logs?.filter(l => l.status === 'sent').length || 0;
        const failed = logs?.filter(l => l.status === 'failed').length || 0;

        result.push({
          title: campaign.title,
          message_type: campaign.message_type,
          unit_scope: campaign.unit_scope,
          status: campaign.status,
          sent_at: campaign.sent_at || '',
          total_messages: total,
          queued,
          sent,
          failed,
        });
      }

      return result;
    },
  });
}

export function useOptOutReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'opt-outs', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select(`
          phone_e164,
          name,
          updated_at,
          subscriptions (
            units (name)
          )
        `)
        .eq('status', 'opted_out')
        .order('updated_at', { ascending: false });

      if (startDate) {
        query = query.gte('updated_at', startDate);
      }
      if (endDate) {
        query = query.lte('updated_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[]).map(contact => ({
        phone: contact.phone_e164,
        name: contact.name || '',
        unit_name: contact.subscriptions?.units?.name || 'Todas',
        updated_at: contact.updated_at,
      })) as OptOutReport[];
    },
  });
}
