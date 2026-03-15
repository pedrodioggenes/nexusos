import { isToday, isYesterday, isWithinInterval, subDays, startOfDay } from 'date-fns';
import type { Conversation } from '@/hooks/useNexusIA';

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  older: Conversation[];
}

/**
 * Group conversations by date: Today, Yesterday, Last 7 days, Older
 */
export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations {
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const lastWeek: Conversation[] = [];
  const older: Conversation[] = [];

  const now = new Date();
  const weekStart = startOfDay(subDays(now, 7));
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));

  conversations.forEach((conv) => {
    const date = new Date(conv.updated_at);

    if (isToday(date)) {
      today.push(conv);
    } else if (isYesterday(date)) {
      yesterday.push(conv);
    } else if (isWithinInterval(date, { start: weekStart, end: yesterdayStart })) {
      lastWeek.push(conv);
    } else {
      older.push(conv);
    }
  });

  return { today, yesterday, lastWeek, older };
}

/**
 * Get label for group
 */
export function getGroupLabel(key: keyof GroupedConversations): string {
  const labels: Record<keyof GroupedConversations, string> = {
    today: 'Hoje',
    yesterday: 'Ontem',
    lastWeek: 'Últimos 7 dias',
    older: 'Anteriores',
  };
  return labels[key];
}
