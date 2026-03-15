import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, X, Zap } from "lucide-react";
import { useRetailActions, RETAIL_ACTION_TYPES, CHANNEL_OPTIONS } from "@/hooks/useRetailActions";
import { cn } from "@/lib/utils";

export default function NovaAcaoComercial() {
  const navigate = useNavigate();
  const { createAction } = useRetailActions();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("encarte");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [mechanics, setMechanics] = useState("");
  const [notes, setNotes] = useState("");
  const [channels, setChannels] = useState<string[]>([]);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createAction.mutateAsync({
      title: title.trim(), type,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      mechanics: mechanics || undefined,
      channels, notes: notes || undefined,
    });
    navigate("/app/marketing/acoes-comerciais");
  };

  return (
    <PageWrapper
      title="Nova Ação Comercial"
      icon={<Zap className="h-5 w-5 text-app-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/acoes-comerciais")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <Card>
        <CardContent className="p-6 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Semana do Açougue" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RETAIL_ACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mecânica</Label>
              <Input value={mechanics} onChange={e => setMechanics(e.target.value)} placeholder="Leve 3 pague 2" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Canais</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CHANNEL_OPTIONS.map(ch => (
                <Badge
                  key={ch}
                  variant={channels.includes(ch) ? "default" : "outline"}
                  className={cn("cursor-pointer text-xs px-2 py-0.5 transition-colors", channels.includes(ch) && "bg-primary")}
                  onClick={() => toggleChannel(ch)}
                >
                  {ch.replace('_', ' ')}
                  {channels.includes(ch) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/app/marketing/acoes-comerciais")}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || createAction.isPending} className="bg-app-gestao hover:bg-app-gestao/90">
              {createAction.isPending ? "Criando..." : "Criar Ação"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}