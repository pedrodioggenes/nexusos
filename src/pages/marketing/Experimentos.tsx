import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical, Plus, Calendar, Target, CheckCircle2, Archive, Lightbulb, ArrowRight, Link2,
} from "lucide-react";
import { useExperiments, type Experiment } from "@/hooks/useExperiments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  planned: { label: "Planejado", color: "bg-muted text-muted-foreground", icon: Calendar },
  running: { label: "Em Execução", color: "bg-blue-500/10 text-blue-600", icon: Target },
  completed: { label: "Concluído", color: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
  archived: { label: "Arquivado", color: "bg-muted text-muted-foreground", icon: Archive },
};

export default function Experimentos() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const { data: experiments = [], isLoading } = useExperiments(tab);

  const counts = {
    all: experiments.length,
    planned: experiments.filter((e) => e.status === "planned").length,
    running: experiments.filter((e) => e.status === "running").length,
    completed: experiments.filter((e) => e.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-app-gestao" /> Experimentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Hipótese → Teste → Resultado → Decisão</p>
        </div>
        <Button onClick={() => navigate("/app/marketing/experimentos/novo")} className="bg-app-gestao hover:bg-app-gestao/90">
          <Plus className="h-4 w-4 mr-2" /> Novo Experimento
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
          <TabsTrigger value="planned">Planejados ({counts.planned})</TabsTrigger>
          <TabsTrigger value="running">Em Execução ({counts.running})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({counts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : experiments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">Nenhum experimento ainda</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">Crie seu primeiro experimento A/B.</p>
            <Button className="mt-4 bg-app-gestao hover:bg-app-gestao/90" onClick={() => navigate("/app/marketing/experimentos/novo")}>
              <Plus className="h-4 w-4 mr-2" /> Criar Experimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {experiments.map((exp) => {
            const sc = statusConfig[exp.status] || statusConfig.planned;
            const StatusIcon = sc.icon;
            return (
              <Card key={exp.id} className="cursor-pointer hover:border-app-gestao/40 transition-colors" onClick={() => navigate(`/app/marketing/experimentos/${exp.id}`)}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`p-2 rounded-lg ${sc.color}`}><StatusIcon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{exp.title}</h3>
                      <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                    </div>
                    {exp.hypothesis && (
                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0" /> {exp.hypothesis}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {exp.metric_key && <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {exp.metric_key}</span>}
                      {exp.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(exp.start_date), "dd MMM", { locale: ptBR })}
                          {exp.end_date && <><ArrowRight className="h-3 w-3" />{format(new Date(exp.end_date), "dd MMM", { locale: ptBR })}</>}
                        </span>
                      )}
                      {exp.campaign && <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {exp.campaign.name}</span>}
                      {exp.variants.length > 0 && <span>{exp.variants.length} variantes</span>}
                    </div>
                  </div>
                  {exp.decision && <Badge variant="secondary" className="shrink-0">Decisão registrada</Badge>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
