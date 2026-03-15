import { useMemo } from "react";
import { Milestone, Calendar, Users, Clock, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { usePMOWeeklyReports, usePMODecisions, usePMOQuarterlyReviews } from "@/hooks/usePMO";
import { format, addDays, nextMonday, startOfMonth, addMonths, startOfQuarter, addQuarters } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RitoConfig {
  key: string;
  title: string;
  frequency: string;
  icon: React.ReactNode;
  color: string;
  participants: string[];
  agenda: string[];
  outputs: string[];
}

const ritosConfig: RitoConfig[] = [
  {
    key: "wbr",
    title: "WBR — Weekly Business Review",
    frequency: "Semanal",
    icon: <Calendar className="h-5 w-5" />,
    color: "text-blue-500",
    participants: ["Fractional CTO", "BPOs", "Responsável TI/Gestão"],
    agenda: ["Destravar bloqueios", "Ajustar prioridades", "Validar entregas rápidas"],
    outputs: ["Backlog repriorizado", "Decisões registradas"],
  },
  {
    key: "msr",
    title: "MSR — Monthly Strategic Review",
    frequency: "Mensal",
    icon: <FileText className="h-5 w-5" />,
    color: "text-app-pmo",
    participants: ["Diretoria/Gestão", "BPOs-chave", "Fractional CTO"],
    agenda: ["Prestação de contas", "Indicadores de adoção", "Releases do mês", "Revisão de horizonte"],
    outputs: ["Release notes", "Próximos marcos"],
  },
  {
    key: "gate",
    title: "Executive Gate",
    frequency: "Trimestral",
    icon: <Milestone className="h-5 w-5" />,
    color: "text-amber-500",
    participants: ["Diretoria (mínimo)", "Fractional CTO"],
    agenda: ["Validar marcos de valor", "Decisões estruturais", "Reorientar horizonte"],
    outputs: ["Decisões executivas", "Revisões de horizonte"],
  },
];

function getNextDate(key: string): Date {
  const now = new Date();
  switch (key) {
    case "wbr":
      return nextMonday(now);
    case "msr":
      return startOfMonth(addMonths(now, 1));
    case "gate":
      return startOfQuarter(addQuarters(now, 1));
    default:
      return addDays(now, 7);
  }
}

export default function PMORitos() {
  const { data: reports = [] } = usePMOWeeklyReports();
  const { data: decisions = [] } = usePMODecisions();
  const { data: reviews = [] } = usePMOQuarterlyReviews();

  const stats = useMemo(() => ({
    wbr: { count: reports.length, last: reports[0] },
    msr: { count: Math.floor(reports.length / 4), last: null },
    gate: { count: reviews.length, last: reviews[0] },
  }), [reports, reviews]);

  const recentDecisions = decisions.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ritos de Governança"
        description="WBR (semanal) · MSR (mensal) · Executive Gate (trimestral)"
      />

      {/* Rito Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ritosConfig.map(rito => {
          const nextDate = getNextDate(rito.key);
          const s = stats[rito.key as keyof typeof stats];
          return (
            <Card key={rito.key} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={rito.color}>{rito.icon}</div>
                    <div>
                      <CardTitle className="text-sm">{rito.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px] mt-1">{rito.frequency}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Next date */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Próximo</p>
                    <p className="text-sm font-semibold capitalize">
                      {format(nextDate, "EEEE, dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Participantes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rito.participants.map(p => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Pauta modelo</p>
                  <ul className="space-y-1">
                    {rito.agenda.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-app-pmo mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Saídas esperadas</p>
                  <div className="flex flex-wrap gap-1">
                    {rito.outputs.map(o => (
                      <Badge key={o} className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> {o}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    {s.count} realizad{s.count === 1 ? "o" : "os"}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Últimas Decisões Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDecisions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma decisão registrada ainda. Decisões são criadas durante os ritos via Dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              {recentDecisions.map((d: any) => (
                <div key={d.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <Milestone className="h-4 w-4 text-app-pmo mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{d.title}</p>
                    {d.justification && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{d.justification}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {d.status === "approved" ? "Aprovada" : d.status === "rejected" ? "Rejeitada" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
