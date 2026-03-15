import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, TrendingUp, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface InsightsDashboardProps {
  conversations: Conversation[];
  isDarkMode?: boolean;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Estoque': ['estoque', 'ruptura', 'inventário', 'produto'],
  'Campanhas': ['campanha', 'marketing', 'whatsapp', 'mensagem'],
  'Orçamento': ['orçamento', 'budget', 'verba', 'custo'],
  'Trade': ['trade', 'fornecedor', 'pacote', 'comprovação'],
  'Análise': ['análise', 'previsão', 'tendência', 'relatório'],
  'Geral': [],
};

export function InsightsDashboard({ conversations }: InsightsDashboardProps) {
  const stats = useMemo(() => {
    const allMessages = conversations.flatMap((c) => c.messages);
    const userMessages = allMessages.filter((m) => m.role === 'user');
    const assistantMessages = allMessages.filter((m) => m.role === 'assistant');

    const topicCounts: Record<string, number> = {};
    Object.keys(TOPIC_KEYWORDS).forEach((topic) => {
      topicCounts[topic] = 0;
    });

    userMessages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      let matched = false;
      
      for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (topic === 'Geral') continue;
        if (keywords.some((kw) => content.includes(kw))) {
          topicCounts[topic]++;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        topicCounts['Geral']++;
      }
    });

    const topicsData = Object.entries(topicCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((t) => t.value > 0)
      .sort((a, b) => b.value - a.value);

    const hourlyUsage: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourlyUsage[i] = 0;

    conversations.forEach((conv) => {
      const hour = new Date(conv.created_at).getHours();
      hourlyUsage[hour]++;
    });

    const hourlyData = Object.entries(hourlyUsage).map(([hour, count]) => ({
      hour: `${hour}h`,
      count,
    }));

    const avgMessagesPerConv = conversations.length > 0
      ? Math.round(allMessages.length / conversations.length)
      : 0;

    const avgResponseLength = assistantMessages.length > 0
      ? Math.round(
          assistantMessages.reduce((acc, m) => acc + m.content.length, 0) /
            assistantMessages.length
        )
      : 0;

    return {
      totalConversations: conversations.length,
      totalMessages: allMessages.length,
      topicsData,
      hourlyData,
      avgMessagesPerConv,
      avgResponseLength,
    };
  }, [conversations]);

  const cardClass = "border bg-card/50 border-border";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalConversations}
                </p>
                <p className="text-xs text-muted-foreground">Conversas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Hash className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalMessages}
                </p>
                <p className="text-xs text-muted-foreground">Mensagens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgMessagesPerConv}
                </p>
                <p className="text-xs text-muted-foreground">Média/conversa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ~{Math.round(stats.avgResponseLength / 4)}
                </p>
                <p className="text-xs text-muted-foreground">Tokens/resposta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Tópicos mais consultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topicsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.topicsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {stats.topicsData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Uso por horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.hourlyData}>
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
