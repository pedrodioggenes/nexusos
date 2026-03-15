import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, FlaskConical } from "lucide-react";
import { useCreateExperiment, type ExperimentVariant } from "@/hooks/useExperiments";
import { useMetricsCatalog } from "@/hooks/useMetricsCatalog";
import { useMarketingCampaigns } from "@/hooks/useMarketingCampaigns";
import { toast } from "sonner";

export default function NovoExperimento() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [metricKey, setMetricKey] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [variants, setVariants] = useState<ExperimentVariant[]>([
    { name: "Variante A", description: "" },
    { name: "Variante B", description: "" },
  ]);

  const createMutation = useCreateExperiment();
  const { data: catalog = [] } = useMetricsCatalog();
  const { data: campaigns = [] } = useMarketingCampaigns();

  const addVariant = () => setVariants(v => [...v, { name: `Variante ${String.fromCharCode(65 + v.length)}`, description: "" }]);
  const removeVariant = (idx: number) => { if (variants.length > 2) setVariants(v => v.filter((_, i) => i !== idx)); };
  const updateVariant = (idx: number, field: keyof ExperimentVariant, value: string) => {
    setVariants(v => v.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Título é obrigatório"); return; }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        hypothesis: hypothesis.trim() || undefined,
        metric_key: metricKey || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        linked_campaign_id: campaignId || undefined,
        variants,
      });
      toast.success("Experimento criado!");
      navigate("/app/marketing/experimentos");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar experimento");
    }
  };

  return (
    <PageWrapper
      title="Novo Experimento"
      icon={<FlaskConical className="h-5 w-5 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/experimentos")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <Card>
        <CardContent className="p-6 space-y-5 max-w-lg">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Teste de CTA no Stories" />
          </div>

          <div className="space-y-1.5">
            <Label>Hipótese</Label>
            <Textarea value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="Se mudarmos X, esperamos que Y aumente em Z%..." rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Métrica Principal</Label>
              <Select value={metricKey} onValueChange={setMetricKey}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {catalog.filter(c => c.is_active).map(c => (
                    <SelectItem key={c.id} value={c.metric_key}>{c.display_name_pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Campanha vinculada</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  {campaigns.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Variantes</Label>
              <Button variant="ghost" size="sm" onClick={addVariant}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar</Button>
            </div>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input value={v.name} onChange={e => updateVariant(idx, "name", e.target.value)} placeholder="Nome da variante" />
                    <Input value={v.description} onChange={e => updateVariant(idx, "description", e.target.value)} placeholder="O que muda nesta variante?" />
                  </div>
                  {variants.length > 2 && (
                    <Button variant="ghost" size="icon" className="shrink-0 mt-1" onClick={() => removeVariant(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/app/marketing/experimentos")}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-module-gestao hover:bg-module-gestao/90">
              {createMutation.isPending ? "Criando..." : "Criar Experimento"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
