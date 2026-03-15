import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileCheck, Save } from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExecution, executionCategoryConfig, type ExecutionChannel } from "@/hooks/useMarketingExecutions";
import { useDemandById } from "@/hooks/useMarketingDemands";
import { getFormProfile } from "@/config/executionFormProfiles";
import { SocialPostFields } from "@/components/marketing/execution/SocialPostFields";
import { SocialVideoFields } from "@/components/marketing/execution/SocialVideoFields";
import { DigitalCommsFields } from "@/components/marketing/execution/DigitalCommsFields";
import { PointOfSaleFields } from "@/components/marketing/execution/PointOfSaleFields";
import { OperationalFields } from "@/components/marketing/execution/OperationalFields";
import { EXECUTION_CATEGORIES } from "@/config/demandRetailFields";

export default function NovaExecucao() {
  const { demandId } = useParams<{ demandId: string }>();
  const navigate = useNavigate();
  const { data: demand } = useDemandById(demandId);
  const createExecution = useCreateExecution();

  const [channel, setChannel] = useState<ExecutionChannel>("instagram");
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split("T")[0]);
  const [linkUrl, setLinkUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  const profile = getFormProfile(channel);
  const plannedChannels = demand?.channels || [];
  const availableChannels =
    plannedChannels.length > 0
      ? Object.entries(executionCategoryConfig).filter(([k]) => plannedChannels.includes(k))
      : Object.entries(executionCategoryConfig).filter(([k]) => !["offline", "tv", "outro"].includes(k));

  const handleSubmit = () => {
    if (!demandId) return;
    createExecution.mutate(
      { entity_type: "demand", entity_id: demandId, channel, execution_date: new Date(executionDate).toISOString(), link_url: linkUrl || undefined, notes: notes || undefined, metadata },
      { onSuccess: () => navigate(`/app/marketing/execucoes/${demandId}`) }
    );
  };

  const handleChannelChange = (v: string) => { setChannel(v as ExecutionChannel); setMetadata({}); setLinkUrl(""); };

  const renderProfileFields = () => {
    switch (profile) {
      case "social_post": return <SocialPostFields metadata={metadata} onChange={setMetadata} linkUrl={linkUrl} onLinkChange={setLinkUrl} />;
      case "social_video": return <SocialVideoFields metadata={metadata} onChange={setMetadata} linkUrl={linkUrl} onLinkChange={setLinkUrl} />;
      case "digital_comms": return <DigitalCommsFields metadata={metadata} onChange={setMetadata} linkUrl={linkUrl} onLinkChange={setLinkUrl} />;
      case "point_of_sale": return <PointOfSaleFields metadata={metadata} onChange={setMetadata} />;
      case "operational": return <OperationalFields metadata={metadata} onChange={setMetadata} />;
      default: return null;
    }
  };

  return (
    <PageWrapper
      title="Registrar Execução"
      subtitle={demand ? `Demanda: ${demand.title}` : ""}
      icon={<FileCheck className="h-6 w-6 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/marketing/execucoes/${demandId}`)} className="gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Button>
      }
    >
      <BlurFade delay={0.05}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Categoria</Label>
                <Select value={channel} onValueChange={handleChannelChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{availableChannels.map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Data da Execução</Label>
                <Input type="date" value={executionDate} onChange={(e) => setExecutionDate(e.target.value)} />
              </div>
            </div>
            <div className="border-t border-border" />
            <div>
              <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">Detalhes — {executionCategoryConfig[channel]?.label || channel}</p>
              {renderProfileFields()}
            </div>
            {(profile === "point_of_sale" || profile === "operational") && (
              <div className="space-y-1.5"><Label className="text-xs">Link (opcional)</Label><Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} /></div>
            )}
            <div className="border-t border-border" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Observações</Label>
              <Textarea placeholder="Detalhes adicionais sobre a execução..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/app/marketing/execucoes/${demandId}`)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createExecution.isPending} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> {createExecution.isPending ? "Registrando..." : "Registrar Execução"}
            </Button>
          </div>
        </div>
      </BlurFade>
    </PageWrapper>
  );
}