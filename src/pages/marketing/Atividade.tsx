import { useState, useMemo } from "react";
import { History, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Wallet,
  FileText,
  Edit,
  Bell,
  CheckCircle,
  ClipboardList,
  ArrowRight,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivityFeed, getActivityCategory, type ActivityEvent } from "@/hooks/useActivityFeed";

type EventType = ActivityEvent["type"];

const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; icon: React.ElementType; color: string; bg: string; category: string }
> = {
  demand_created: { label: "Demanda criada", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-500/10", category: "demanda" },
  demand_updated: { label: "Demanda atualizada", icon: Edit, color: "text-blue-400", bg: "bg-blue-400/10", category: "demanda" },
  campaign_created: { label: "Campanha criada", icon: Megaphone, color: "text-violet-500", bg: "bg-violet-500/10", category: "campanha" },
  campaign_updated: { label: "Campanha atualizada", icon: Megaphone, color: "text-violet-400", bg: "bg-violet-400/10", category: "campanha" },
  alert_created: { label: "Alerta registrado", icon: Bell, color: "text-destructive", bg: "bg-destructive/10", category: "alerta" },
  alert_resolved: { label: "Alerta resolvido", icon: CheckCircle, color: "text-success", bg: "bg-success/10", category: "alerta" },
  transaction_created: { label: "Transação registrada", icon: Wallet, color: "text-app-gestao", bg: "bg-app-gestao/10", category: "financeiro" },
  document_created: { label: "Documento criado", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", category: "documento" },
  document_updated: { label: "Documento editado", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10", category: "documento" },
  plan_created: { label: "Plano criado", icon: LayoutList, color: "text-amber-500", bg: "bg-amber-500/10", category: "planejamento" },
  plan_updated: { label: "Plano atualizado", icon: LayoutList, color: "text-amber-400", bg: "bg-amber-400/10", category: "planejamento" },
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "demanda", label: "Demandas" },
  { value: "campanha", label: "Campanhas" },
  { value: "alerta", label: "Alertas" },
  { value: "financeiro", label: "Financeiro" },
  { value: "documento", label: "Documentos" },
  { value: "planejamento", label: "Planejamento" },
];

function groupByDate(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const key = format(event.timestamp, "dd 'de' MMMM, yyyy", { locale: ptBR });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries()).map(([label, evts]) => ({ label, events: evts }));
}

export default function Atividade() {
  const navigate = useNavigate();
  const { period, setPeriod, getDateRange, customRange, setCustomRange } = usePeriodFilter("30d");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: allEvents = [], isLoading } = useActivityFeed();

  const filteredEvents = useMemo(() => {
    const { start, end } = getDateRange();
    return allEvents
      .filter((e) => isWithinInterval(e.timestamp, { start, end }))
      .filter((e) => categoryFilter === "all" || getActivityCategory(e.type) === categoryFilter);
    // already sorted desc from hook
  }, [allEvents, period, categoryFilter, customRange]);

  const grouped = useMemo(() => groupByDate(filteredEvents), [filteredEvents]);

  return (
    <PageWrapper
      title="Histórico de Atividade"
      subtitle="Timeline consolidada de eventos do aplicativo"
      icon={<History className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-7 text-[11px] w-[130px] border-border">
              <Filter className="h-3 w-3 mr-1 opacity-50" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            options={["7d", "30d", "90d", "month", "quarter", "year", "custom"]}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>
      }
    >
      {isLoading ? (
        <BlurFade delay={0.05}>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-app-gestao" />
            <p className="text-sm text-muted-foreground">Carregando atividades…</p>
          </div>
        </BlurFade>
      ) : filteredEvents.length === 0 ? (
        <BlurFade delay={0.05}>
          <Empty
            icon={<History className="h-12 w-12" />}
            title="Nenhum evento encontrado"
            description="Ajuste o período ou filtro para ver o histórico"
          />
        </BlurFade>
      ) : (
        <div className="space-y-6">
          {grouped.map((group, gi) => (
            <BlurFade key={group.label} delay={0.03 * gi}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-1">
                  {group.events.map((event, ei) => {
                    const config = EVENT_TYPE_CONFIG[event.type];
                    if (!config) return null;
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ei * 0.02 }}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          "hover:bg-muted/50 transition-colors cursor-pointer group"
                        )}
                        onClick={() => event.link && navigate(event.link)}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[8px] h-4 px-1.5">
                              {config.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        {event.link && (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </BlurFade>
          ))}

          <BlurFade delay={0.1}>
            <div className="text-center py-4">
              <Badge variant="secondary" className="text-[10px]">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""} no período
              </Badge>
            </div>
          </BlurFade>
        </div>
      )}
    </PageWrapper>
  );
}
