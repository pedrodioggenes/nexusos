import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ContactStatus = Database['public']['Enums']['contact_status'];
type SubscriptionScope = Database['public']['Enums']['subscription_scope'];

export interface Contact {
  id: string;
  phone_e164: string;
  name: string | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
  last_interaction_at: string | null;
}

export interface ContactWithSubscription extends Contact {
  subscriptions: {
    id: string;
    scope: SubscriptionScope;
    unit_id: string | null;
    units: { id: string; name: string; city: string } | null;
  } | null;
}

export interface CreateContactData {
  phone_e164: string;
  name?: string;
  status?: ContactStatus;
  subscription?: {
    scope: SubscriptionScope;
    unit_id?: string;
  };
}

export function useContacts(filters?: { status?: ContactStatus; unitId?: string; search?: string }) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          subscriptions (
            id,
            scope,
            unit_id,
            units (id, name, city)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        // Escape ILIKE special characters: %, _, and \
        const sanitized = filters.search.replace(/[%_\\]/g, '\\$&');
        const searchPattern = `%${sanitized}%`;
        query = query.or(`phone_e164.ilike.${searchPattern},name.ilike.${searchPattern}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as unknown as ContactWithSubscription[];

      // Filter by unit if specified
      if (filters?.unitId) {
        result = result.filter(contact => 
          contact.subscriptions?.unit_id === filters.unitId ||
          contact.subscriptions?.scope === 'all_units'
        );
      }

      return result;
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          subscriptions (
            id,
            scope,
            unit_id,
            units (id, name, city)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as ContactWithSubscription;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContactData) => {
      // Create contact
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          phone_e164: data.phone_e164,
          name: data.name,
          status: data.status || 'active',
        })
        .select()
        .single();
      
      if (contactError) throw contactError;

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          contact_id: contact.id,
          scope: data.subscription?.scope || 'all_units',
          unit_id: data.subscription?.unit_id || null,
        });

      if (subscriptionError) throw subscriptionError;

      return contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Contato criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar contato: ' + error.message);
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      status, 
      subscription 
    }: { 
      id: string; 
      name?: string; 
      status?: ContactStatus;
      subscription?: { scope: SubscriptionScope; unit_id?: string | null };
    }) => {
      // Update contact
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ name, status })
        .eq('id', id);
      
      if (contactError) throw contactError;

      // Update subscription if provided
      if (subscription) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            scope: subscription.scope,
            unit_id: subscription.scope === 'single_unit' ? subscription.unit_id : null,
          })
          .eq('contact_id', id);

        if (subscriptionError) throw subscriptionError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Contato atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar contato: ' + error.message);
    },
  });
}

export function useContactsStats() {
  return useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: allContacts, error } = await supabase
        .from('contacts')
        .select('id, status, created_at');

      if (error) throw error;

      const total = allContacts.length;
      const active = allContacts.filter(c => c.status === 'active').length;
      const optedOut = allContacts.filter(c => c.status === 'opted_out').length;
      const blocked = allContacts.filter(c => c.status === 'blocked').length;
      const newLast7Days = allContacts.filter(c => new Date(c.created_at) >= sevenDaysAgo).length;
      const newLast30Days = allContacts.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;

      return { total, active, optedOut, blocked, newLast7Days, newLast30Days };
    },
  });
}
