import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, status, created_at');

      if (contactsError) throw contactsError;

      const total = contacts.length;
      const active = contacts.filter(c => c.status === 'active').length;
      const optedOut = contacts.filter(c => c.status === 'opted_out').length;
      const blocked = contacts.filter(c => c.status === 'blocked').length;
      const newLast7Days = contacts.filter(c => new Date(c.created_at) >= sevenDaysAgo).length;
      const newLast30Days = contacts.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;

      return { total, active, optedOut, blocked, newLast7Days, newLast30Days };
    },
  });
}

export function useContactsByUnit() {
  return useQuery({
    queryKey: ['dashboard', 'contacts-by-unit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          scope,
          unit_id,
          units (name),
          contacts (status)
        `);

      if (error) throw error;

      const unitCounts: Record<string, number> = {};
      let allUnitsCount = 0;

      data.forEach((sub: any) => {
        if (sub.contacts?.status !== 'active') return;

        if (sub.scope === 'all_units') {
          allUnitsCount++;
        } else if (sub.units?.name) {
          unitCounts[sub.units.name] = (unitCounts[sub.units.name] || 0) + 1;
        }
      });

      // Add all_units count to "Todas"
      if (allUnitsCount > 0) {
        unitCounts['Todas as Unidades'] = allUnitsCount;
      }

      return Object.entries(unitCounts).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });
}

export function useContactsPerDay() {
  return useQuery({
    queryKey: ['dashboard', 'contacts-per-day'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('contacts')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by day
      const dayGroups: Record<string, number> = {};
      
      // Initialize all days
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        dayGroups[key] = 0;
      }

      data.forEach((contact: any) => {
        const key = contact.created_at.split('T')[0];
        if (dayGroups[key] !== undefined) {
          dayGroups[key]++;
        }
      });

      return Object.entries(dayGroups).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count,
      }));
    },
  });
}

export function useRecentCampaigns() {
  return useQuery({
    queryKey: ['dashboard', 'recent-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, status, scheduled_at, sent_at, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ['dashboard', 'campaign-stats'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('id, status, created_at, sent_at');

      if (error) throw error;

      const total = campaigns.length;
      const draft = campaigns.filter(c => c.status === 'draft').length;
      const scheduled = campaigns.filter(c => c.status === 'scheduled').length;
      const sent = campaigns.filter(c => c.status === 'sent').length;
      const canceled = campaigns.filter(c => c.status === 'canceled').length;

      return { total, draft, scheduled, sent, canceled };
    },
  });
}

export function useCampaignsPerMonth() {
  return useQuery({
    queryKey: ['dashboard', 'campaigns-per-month'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('campaigns')
        .select('created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by month
      const monthGroups: Record<string, { total: number; sent: number }> = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthGroups[key] = { total: 0, sent: 0 };
      }

      data.forEach((campaign: any) => {
        const date = new Date(campaign.created_at);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (monthGroups[key]) {
          monthGroups[key].total++;
          if (campaign.status === 'sent') {
            monthGroups[key].sent++;
          }
        }
      });

      return Object.entries(monthGroups).map(([month, data]) => ({
        month,
        total: data.total,
        enviadas: data.sent,
      }));
    },
  });
}

export function useContactGrowth() {
  return useQuery({
    queryKey: ['dashboard', 'contact-growth'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('contacts')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by month with cumulative count
      const monthGroups: Record<string, number> = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthGroups[key] = 0;
      }

      data.forEach((contact: any) => {
        const date = new Date(contact.created_at);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (monthGroups[key] !== undefined) {
          monthGroups[key]++;
        }
      });

      // Convert to cumulative
      let cumulative = 0;
      return Object.entries(monthGroups).map(([month, count]) => {
        cumulative += count;
        return {
          month,
          novos: count,
          total: cumulative,
        };
      });
    },
  });
}

export function useContactStatusDistribution() {
  return useQuery({
    queryKey: ['dashboard', 'contact-status-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('status');

      if (error) throw error;

      const statusCounts = {
        active: 0,
        opted_out: 0,
        blocked: 0,
      };

      data.forEach((contact: any) => {
        if (statusCounts[contact.status as keyof typeof statusCounts] !== undefined) {
          statusCounts[contact.status as keyof typeof statusCounts]++;
        }
      });

      return [
        { name: 'Ativos', value: statusCounts.active, fill: 'hsl(var(--success))' },
        { name: 'Opt-out', value: statusCounts.opted_out, fill: 'hsl(var(--primary))' },
        { name: 'Bloqueados', value: statusCounts.blocked, fill: 'hsl(var(--destructive))' },
      ];
    },
  });
}
