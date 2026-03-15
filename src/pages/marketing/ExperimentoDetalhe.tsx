import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Lightbulb, Target, Calendar, Link2, CheckCircle2, Play, Archive, FlaskConical, Save,
} from "lucide-react";
import { useExperiments, useUpdateExperiment, type Experiment, type ExperimentResults } from "@/hooks/useExperiments";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusActions: Record<string, { next: string; label: string; icon: any }[]> = {
  planned: [{ next: "running", label: "Iniciar Teste", icon: Play }],
  running: [{ next: "completed", label: "Concluir", icon: CheckCircle2 }],
  completed: [{ next: "archived", label: "Arquivar", icon: Archive }],
  archived: [],
};

const statusColors: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  archived: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  planned: "Planejado",
  running: "Em Execução",
  completed: "Concluído",
  archived: "Arquivado",
};

export default function ExperimentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: experiments = [], isLoading } = useExperiments();
  const experiment = useMemo(() => experiments.find(e => e.id === id), [experiments, id]);
  const updateMutation = useUpdateExperiment();

  const [decision, setDecision] = useState("");
  const [winner, setWinner] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [variantValues, setVariantValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize form from experiment data
  if (experiment && !initialized) {
    setDecision(experiment.decision || "");
    setWinner(experiment.results?.winner || "");
    setResultNotes(experiment.results?.notes || "");
    const vals: Record<string, string> = {};
    experiment.variants.forEach(v => {
      const existing = (experiment.results as any)?.[`variant_${v.name}`];
      vals[v.name] = existing?.value?.toString() || "";
    });
    setVariantValues(vals);
    setInitialized(true);
  }

  if (isLoading) {
    return <PageWrapper title="Carregando..." icon={<FlaskConical className="h-5 w-5" />}><Skeleton className="h-64 w-full" /></PageWrapper>;
  }

  if (!experiment) {
    return (
      <PageWrapper title="Experimento não encontrado" icon={<FlaskConical className="h-5 w-5" />}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Experimento não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/marketing/experimentos")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: experiment.id, status: newStatus as any });
      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveResults = async () => {
    const results: ExperimentResults = { ...experiment.results, winner: winner || undefined, notes: resultNotes || undefined };
    experiment.variants.forEach(v => {
      const val = variantValues[v.name];
      if (val) (results as any)[`variant_${v.name}`] = { value: parseFloat(val) };
    });
    try {
      await updateMutation.mutateAsync({ id: experiment.id, results, decision: decision || undefined });
      toast.success("Resultados salvos!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const actions = statusActions[experiment.status] || [];

  return (
    <PageWrapper
      title={experiment.title}
      icon={<FlaskConical className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/experimentos")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Badge className={statusColors[experiment.status]}>{statusLabels[experiment.status]}</Badge>
        </div>
      }
    >
      <div className="max-w-2xl space-y-6">
        {experiment.hypothesis && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Hipótese
            </div>
            <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {experiment.metric_key && <span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> Métrica: <strong>{experiment.metric_key}</strong></span>}
          {experiment.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(experiment.start_date), "dd/MM/yyyy", { locale: ptBR })}
              {experiment.end_date && ` → ${format(new Date(experiment.end_date), "dd/MM/yyyy", { locale: ptBR })}`}
            </span>
          )}
          {experiment.campaign && <span className="flex items-center gap-1.5"><Link2 className="h-4 w-4" /> {experiment.campaign.name}</span>}
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Variantes</h4>
          <div className="grid gap-2">
            {experiment.variants.map((v, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{v.name}</span>
                  {winner === v.name && <Badge className="bg-green-500/10 text-green-600">🏆 Vencedor</Badge>}
                </div>
                {v.description && <p className="text-xs text-muted-foreground mt-1">{v.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Resultados</h4>
          <div className="space-y-3">
            {experiment.variants.map(v => (
              <div key={v.name} className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2 sm:gap-3 sm:items-center">
                <Label className="text-sm">{v.name} — valor da métrica</Label>
                <Input type="number" step="any" value={variantValues[v.name] || ""} onChange={e => setVariantValues(prev => ({ ...prev, [v.name]: e.target.value }))} placeholder="0" />
              </div>
            ))}
            <div>
              <Label className="text-sm">Vencedor</Label>
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger><SelectValue placeholder="Selecionar vencedor..." /></SelectTrigger>
                <SelectContent>
                  {experiment.variants.map(v => <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>)}
                  <SelectItem value="inconclusive">Inconclusivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Notas sobre resultado</Label>
              <Textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)} placeholder="Observações sobre os resultados..." rows={2} />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-2">Decisão Final</h4>
          <Textarea value={decision} onChange={e => setDecision(e.target.value)} placeholder="O que aprendemos e o que faremos a partir disso..." rows={3} />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
          <div className="flex gap-2">
            {actions.map(action => {
              const Icon = action.icon;
              return (
                <Button key={action.next} variant="outline" size="sm" onClick={() => handleStatusChange(action.next)} disabled={updateMutation.isPending}>
                  <Icon className="h-4 w-4 mr-1.5" /> {action.label}
                </Button>
              );
            })}
          </div>
          <Button onClick={handleSaveResults} disabled={updateMutation.isPending} className="bg-app-gestao hover:bg-app-gestao/90">
            <Save className="h-4 w-4 mr-1.5" /> Salvar Resultados
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
