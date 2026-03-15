import { useEffect, useState } from "react";
import { Users, FileText, Trophy, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { PageHeader } from "@/components/ui/page-header";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Metrics {
  totalParticipants: number;
  validatedCoupons: number;
  winners: number;
  prizesRemaining: number;
}

interface DailyData {
  date: string;
  count: number;
}

export default function SorteiosDashboard() {
  const { data: tenantId } = useHWTenantId();
  const [metrics, setMetrics] = useState<Metrics>({ totalParticipants: 0, validatedCoupons: 0, winners: 0, prizesRemaining: 0 });
  const [cpfDaily, setCpfDaily] = useState<DailyData[]>([]);
  const [couponDaily, setCouponDaily] = useState<DailyData[]>([]);
  const [winnerDaily, setWinnerDaily] = useState<DailyData[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    const groupByDay = (items: { created_at: string }[]) => {
      const grouped: Record<string, number> = {};
      items.forEach((item) => {
        const day = new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        grouped[day] = (grouped[day] || 0) + 1;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    };

    const fetchAll = async () => {
      const [participants, coupons, winners, prizes] = await Promise.all([
        supabase.from("sorteios_participants").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("sorteios_coupons").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "validado"),
        supabase.from("sorteios_sweepstakes").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).not("winner_id", "is", null),
        supabase.from("sorteios_prizes").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      ]);
      setMetrics({
        totalParticipants: participants.count ?? 0,
        validatedCoupons: coupons.count ?? 0,
        winners: winners.count ?? 0,
        prizesRemaining: prizes.count ?? 0,
      });
    };

    const fetchCharts = async () => {
      const [pData, cData, wData] = await Promise.all([
        supabase.from("sorteios_participants").select("created_at").eq("tenant_id", tenantId).order("created_at", { ascending: true }),
        supabase.from("sorteios_coupons").select("created_at").eq("tenant_id", tenantId).order("created_at", { ascending: true }),
        supabase.from("sorteios_sweepstakes").select("created_at").eq("tenant_id", tenantId).not("winner_id", "is", null).order("created_at", { ascending: true }),
      ]);
      setCpfDaily(groupByDay(pData.data ?? []));
      setCouponDaily(groupByDay(cData.data ?? []));
      setWinnerDaily(groupByDay(wData.data ?? []));
    };

    fetchAll();
    fetchCharts();
  }, [tenantId]);

  const cards = [
    { label: "CPFs cadastrados", value: metrics.totalParticipants, icon: Users, color: "text-app-sorteios" },
    { label: "Notas cadastradas", value: metrics.validatedCoupons, icon: FileText, color: "text-app-sorteios" },
    { label: "Ganhadores", value: metrics.winners, icon: Trophy, color: "text-accent" },
    { label: "Prêmios restantes", value: metrics.prizesRemaining, icon: Gift, color: "text-app-sorteios" },
  ];

  const charts = [
    { title: "Evolução de CPFs", data: cpfDaily },
    { title: "Evolução de notas fiscais", data: couponDaily },
    { title: "Evolução de ganhadores", data: winnerDaily },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Métricas da promoção" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-1.5">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {charts.map((chart) => (
          <div key={chart.title} className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">{chart.title}</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <defs>
                    <linearGradient id={`g-${chart.title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--app-sorteios))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--app-sorteios))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--app-sorteios))" strokeWidth={2} fill={`url(#g-${chart.title})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
