import { useState } from "react";
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Trash2,
  Zap,
  FileText,
  Megaphone,
  Instagram,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useMarketingTemplatesHub,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  templateTypeLabels,
  type MarketingTemplate,
  type TemplateDefinition,
  type TemplateDemand,
  type TemplateCalendarEvent,
} from "@/hooks/useMarketingBriefingsHub";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ElementType> = {
  brief: FileText,
  campaign: Megaphone,
  channel: Instagram,
  objective: Target,
};

// ============================================================
// TEMPLATE FORM
// ============================================================

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template?: MarketingTemplate;
}) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isEdit = !!template;

  const [form, setForm] = useState({
    name: template?.name || "",
    description: template?.description || "",
    type: template?.type || "brief",
    category: template?.category || "",
    icon: template?.icon || "📋",
  });

  const [def, setDef] = useState<TemplateDefinition>(
    template?.definition || { demands: [], calendar_events: [], checklist: [], campaign: undefined }
  );

  const [showJson, setShowJson] = useState(false);

  const addDemand = () => {
    setDef(d => ({
      ...d,
      demands: [...(d.demands || []), { title: "", type: "general", priority: "medium", days_offset: 0 }],
    }));
  };

  const updateDemand = (idx: number, field: keyof TemplateDemand, value: any) => {
    setDef(d => ({
      ...d,
      demands: (d.demands || []).map((dem, i) => i === idx ? { ...dem, [field]: value } : dem),
    }));
  };

  const removeDemand = (idx: number) => {
    setDef(d => ({ ...d, demands: (d.demands || []).filter((_, i) => i !== idx) }));
  };

  const addCalendarEvent = () => {
    setDef(d => ({
      ...d,
      calendar_events: [...(d.calendar_events || []), { title: "", type: "task", days_offset: 0 }],
    }));
  };

  const updateCalEvent = (idx: number, field: keyof TemplateCalendarEvent, value: any) => {
    setDef(d => ({
      ...d,
      calendar_events: (d.calendar_events || []).map((evt, i) => i === idx ? { ...evt, [field]: value } : evt),
    }));
  };

  const removeCalEvent = (idx: number) => {
    setDef(d => ({ ...d, calendar_events: (d.calendar_events || []).filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      description: form.description || null,
      type: form.type as any,
      category: form.category || null,
      icon: form.icon,
      definition: def,
    };

    if (isEdit) {
      await updateTemplate.mutateAsync({ id: template.id, ...payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Template" : "Novo Template"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-[60px_1fr] gap-3">
              <div>
                <Label>Ícone</Label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="text-center text-xl" />
              </div>
              <div>
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Campanha Sazonal Completa" />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="campaign">Campanha</SelectItem>
                    <SelectItem value="channel">Canal</SelectItem>
                    <SelectItem value="objective">Objetivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Tráfego, Branding..." />
              </div>
            </div>

            <Separator />

            {/* Campaign defaults */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={!!def.campaign}
                  onChange={e => setDef(d => ({ ...d, campaign: e.target.checked ? { type: 'promotional', priority: 'medium' } : undefined }))}
                  className="rounded"
                />
                <Label>Criar campanha automaticamente</Label>
              </div>
              {def.campaign && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <Select value={def.campaign.type || 'promotional'} onValueChange={v => setDef(d => ({ ...d, campaign: { ...d.campaign!, type: v } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seasonal">Sazonal</SelectItem>
                        <SelectItem value="promotional">Promocional</SelectItem>
                        <SelectItem value="institutional">Institucional</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Prioridade</Label>
                    <Select value={def.campaign.priority || 'medium'} onValueChange={v => setDef(d => ({ ...d, campaign: { ...d.campaign!, priority: v } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Demands */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Demandas a criar</Label>
                <Button variant="ghost" size="sm" onClick={addDemand}><Plus className="w-3 h-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {(def.demands || []).map((dem, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_100px_80px_32px] gap-2 items-end">
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input value={dem.title} onChange={e => updateDemand(i, 'title', e.target.value)} placeholder="Ex: Arte Instagram" />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <Select value={dem.type} onValueChange={v => updateDemand(i, 'type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social_media">Social</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="copywriting">Copy</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Prioridade</Label>
                      <Select value={dem.priority} onValueChange={v => updateDemand(i, 'priority', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Dias antes</Label>
                      <Input type="number" value={dem.days_offset} onChange={e => updateDemand(i, 'days_offset', parseInt(e.target.value) || 0)} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeDemand(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Calendar events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Eventos no Calendário</Label>
                <Button variant="ghost" size="sm" onClick={addCalendarEvent}><Plus className="w-3 h-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {(def.calendar_events || []).map((evt, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-end">
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input value={evt.title} onChange={e => updateCalEvent(i, 'title', e.target.value)} placeholder="Ex: Publicação Feed" />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <Select value={evt.type} onValueChange={v => updateCalEvent(i, 'type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Tarefa</SelectItem>
                          <SelectItem value="campaign">Campanha</SelectItem>
                          <SelectItem value="deadline">Prazo</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Dias antes</Label>
                      <Input type="number" value={evt.days_offset} onChange={e => updateCalEvent(i, 'days_offset', parseInt(e.target.value) || 0)} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeCalEvent(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Checklist */}
            <div>
              <Label>Checklist de produção</Label>
              <Textarea
                value={(def.checklist || []).join("\n")}
                onChange={e => setDef(d => ({ ...d, checklist: e.target.value.split("\n").filter(Boolean) }))}
                placeholder="Um item por linha:&#10;Criar arte&#10;Revisar copy&#10;Aprovar vídeo"
                rows={3}
              />
            </div>

            {/* JSON preview */}
            <div>
              <Button variant="ghost" size="sm" onClick={() => setShowJson(!showJson)} className="text-xs text-muted-foreground">
                {showJson ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                JSON Preview
              </Button>
              {showJson && (
                <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-40 mt-1">
                  {JSON.stringify(def, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim() || createTemplate.isPending || updateTemplate.isPending}
            className="bg-app-gestao hover:bg-app-gestao/90"
          >
            {isEdit ? "Salvar" : "Criar Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function TemplatesHubPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const deleteTemplate = useDeleteTemplate();

  const { data: templates = [], isLoading } = useMarketingTemplatesHub(
    typeFilter === "all" ? undefined : { type: typeFilter }
  );

  const grouped = templates.reduce<Record<string, MarketingTemplate[]>>((acc, t) => {
    const key = t.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <PageWrapper
      title="Templates"
      subtitle="Modelos reutilizáveis para acelerar operações de marketing"
      icon={<LayoutTemplate className="w-6 h-6 text-app-gestao" />}
      actions={
        <Button onClick={() => setShowCreate(true)} className="bg-app-gestao hover:bg-app-gestao/90">
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </Button>
      }
    >
      {/* Filter */}
      <BlurFade delay={0.05}>
        <div className="flex gap-2 mb-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="brief">Brief</SelectItem>
              <SelectItem value="campaign">Campanha</SelectItem>
              <SelectItem value="channel">Canal</SelectItem>
              <SelectItem value="objective">Objetivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </BlurFade>

      {/* Gallery */}
      <BlurFade delay={0.1}>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : templates.length === 0 ? (
          <Empty
            icon={<LayoutTemplate className="w-10 h-10" />}
            title="Sem templates"
            description="Crie seu primeiro template de marketing."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => {
              const TypeIcon = TYPE_ICONS[type] || FileText;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <TypeIcon className="w-4 h-4 text-app-gestao" />
                    <h3 className="font-semibold text-sm">{templateTypeLabels[type] || type}</h3>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(t => {
                      const def = t.definition;
                      const counts = [
                        def.campaign ? "1 campanha" : null,
                        def.demands?.length ? `${def.demands.length} demanda(s)` : null,
                        def.calendar_events?.length ? `${def.calendar_events.length} evento(s)` : null,
                        def.checklist?.length ? `${def.checklist.length} checklist` : null,
                      ].filter(Boolean);

                      return (
                        <Card key={t.id} className="p-4 group hover:border-module-gestao/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{t.icon}</span>
                              <div>
                                <h4 className="font-medium text-sm">{t.name}</h4>
                                {t.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                                )}
                                {t.category && (
                                  <Badge variant="outline" className="text-[10px] mt-1">{t.category}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTemplate(t)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => deleteTemplate.mutate(t.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {counts.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {counts.map((c, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BlurFade>

      {/* Dialogs */}
      {showCreate && (
        <TemplateFormDialog open={showCreate} onOpenChange={setShowCreate} />
      )}
      {editingTemplate && (
        <TemplateFormDialog
          open={!!editingTemplate}
          onOpenChange={v => { if (!v) setEditingTemplate(null); }}
          template={editingTemplate}
        />
      )}
    </PageWrapper>
  );
}
