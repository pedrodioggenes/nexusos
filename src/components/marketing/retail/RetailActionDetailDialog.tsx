import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, Store, Zap, FileText, Target, ShoppingBag,
  PackagePlus, CalendarPlus, ClipboardList, Play, ExternalLink, Trash2, Link2, Package, Loader2, FileDown, QrCode,
  Send, Handshake, Plus, ArrowRight
} from "lucide-react";
import { useRetailActions, useRetailActionLinks, RETAIL_ACTION_STATUSES, RETAIL_ACTION_TYPES, RetailAction } from "@/hooks/useRetailActions";
import { useStoreKit } from "@/hooks/useStoreKit";
import { useTradeReferences, useTradeRequests, TRADE_REQUEST_STATUSES } from "@/hooks/useTradeBridge";
import { RetailActionImpactTab } from "./RetailActionImpactTab";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog as SubDialog,
  DialogContent as SubDialogContent,
  DialogHeader as SubDialogHeader,
  DialogTitle as SubDialogTitle,
  DialogFooter as SubDialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  action: RetailAction | null;
  onClose: () => void;
}

const LINKED_TYPE_LABELS: Record<string, { label: string; icon: any; route?: string }> = {
  campaign: { label: 'Campanha', icon: Zap, route: '/app/marketing/campanhas' },
  demand: { label: 'Demanda', icon: FileText, route: '/app/marketing/demandas' },
  plan: { label: 'Calendário', icon: Calendar, route: '/app/marketing/planejamento' },
  document: { label: 'Documento', icon: FileText, route: '/app/marketing/documentos' },
  execution: { label: 'Execução', icon: ClipboardList },
  kpi: { label: 'KPI', icon: Target, route: '/app/marketing/kpis' },
  alert: { label: 'Alerta', icon: Zap, route: '/app/marketing/alertas' },
  trade: { label: 'Trade', icon: ShoppingBag, route: '/app/marketing/trade' },
};

export function RetailActionDetailDialog({ action, onClose }: Props) {
  const navigate = useNavigate();
  const { updateAction, deleteAction } = useRetailActions();
  const { links, addLink, removeLink } = useRetailActionLinks(action?.id || null);
  const { kit, generateKit } = useStoreKit(action?.id || null);
  const { refs, createRef } = useTradeReferences(action?.id || undefined);
  const { requests, createRequest } = useTradeRequests(action?.id || undefined);
  const [tab, setTab] = useState("overview");
  const [showTradeRequestForm, setShowTradeRequestForm] = useState(false);
  const [tradeRequestTitle, setTradeRequestTitle] = useState("");
  const [tradeRequestMechanics, setTradeRequestMechanics] = useState("");

  if (!action) return null;

  const si = RETAIL_ACTION_STATUSES.find(s => s.value === action.status);
  const ti = RETAIL_ACTION_TYPES.find(t => t.value === action.type);
  const channels = Array.isArray(action.channels) ? action.channels as string[] : [];
  const stores = Array.isArray(action.stores_scope) ? action.stores_scope : [];

  const handleStatusChange = (newStatus: string) => {
    updateAction.mutate({ id: action.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (!confirm('Remover esta ação comercial?')) return;
    await deleteAction.mutateAsync(action.id);
    onClose();
  };

  const handleCreateProductionPackage = () => {
    toast.info('Funcionalidade de pacote de produção será implementada no próximo ciclo.');
  };

  const handleAddToCalendar = () => {
    navigate('/app/marketing/planejamento');
    onClose();
  };

  const handleOpenExecution = () => {
    navigate(`/app/marketing/execucao/${action.id}`);
    onClose();
  };

  const handleGenerateStoreKit = async () => {
    if (!action) return;
    const pageId = await generateKit.mutateAsync(action);
    if (pageId) {
      navigate(`/app/marketing/documentos/${pageId}`);
      onClose();
    }
  };

  const handleOpenKit = () => {
    if (kit?.kit_document_page_id) {
      navigate(`/app/marketing/documentos/${kit.kit_document_page_id}`);
      onClose();
    }
  };

  const linksByType = (type: string) => links.filter(l => l.linked_type === type);

  return (
    <Dialog open={!!action} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="text-base truncate">{action.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {si && <Badge variant="outline" className={cn("text-[10px]", si.color)}>{si.label}</Badge>}
                {ti && <Badge variant="secondary" className="text-[10px]">{ti.label}</Badge>}
              </div>
            </div>
            <Select value={action.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-7 w-[130px] text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RETAIL_ACTION_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5 py-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleCreateProductionPackage}>
            <PackagePlus className="h-3 w-3 mr-1" /> Pacote de Produção
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleAddToCalendar}>
            <CalendarPlus className="h-3 w-3 mr-1" /> Calendário
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
            {generateKit.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Package className="h-3 w-3 mr-1" />}
            {kit ? 'Atualizar Kit' : 'Gerar Kit de Loja'}
          </Button>
          {kit?.kit_document_page_id && (
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleOpenKit}>
              <FileDown className="h-3 w-3 mr-1" /> Abrir Kit
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleOpenExecution}>
            <Play className="h-3 w-3 mr-1" /> Execução
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs h-7">Visão Geral</TabsTrigger>
            <TabsTrigger value="production" className="text-xs h-7">Produção</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs h-7">Calendário</TabsTrigger>
            <TabsTrigger value="execution" className="text-xs h-7">Execução</TabsTrigger>
            <TabsTrigger value="evidence" className="text-xs h-7">Evidências</TabsTrigger>
            <TabsTrigger value="impact" className="text-xs h-7">Impacto</TabsTrigger>
            <TabsTrigger value="trade" className="text-xs h-7">Trade</TabsTrigger>
            <TabsTrigger value="kit" className="text-xs h-7">Kit</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Período">
                {action.period_start ? (
                  <span className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(action.period_start), "dd MMM yyyy", { locale: ptBR })}
                    {action.period_end && ` – ${format(new Date(action.period_end), "dd MMM yyyy", { locale: ptBR })}`}
                  </span>
                ) : <span className="text-xs text-muted-foreground">Não definido</span>}
              </InfoCard>
              <InfoCard label="Mecânica">
                <span className="text-xs">{action.mechanics || '—'}</span>
              </InfoCard>
              <InfoCard label="Lojas">
                {stores.length > 0 ? (
                  <span className="flex items-center gap-1 text-xs">
                    <Store className="h-3 w-3" /> {stores.length} unidade(s)
                  </span>
                ) : <span className="text-xs text-muted-foreground">Todas</span>}
              </InfoCard>
              <InfoCard label="Canais">
                {channels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {channels.map(ch => (
                      <Badge key={ch} variant="secondary" className="text-[10px] px-1.5 py-0">{ch.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                ) : <span className="text-xs text-muted-foreground">Nenhum</span>}
              </InfoCard>
            </div>
            {action.notes && (
              <div className="mt-3 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">{action.notes}</div>
            )}
          </TabsContent>

          {/* Production */}
          <TabsContent value="production">
            <LinksSection links={linksByType('demand')} type="demand" navigate={navigate} onClose={onClose} removeLink={removeLink} />
            <LinksSection links={linksByType('campaign')} type="campaign" navigate={navigate} onClose={onClose} removeLink={removeLink} />
            {linksByType('demand').length === 0 && linksByType('campaign').length === 0 && (
              <EmptySection message="Nenhuma demanda ou campanha vinculada" />
            )}
          </TabsContent>

          {/* Calendar */}
          <TabsContent value="calendar">
            <LinksSection links={linksByType('plan')} type="plan" navigate={navigate} onClose={onClose} removeLink={removeLink} />
            {linksByType('plan').length === 0 && <EmptySection message="Nenhum evento de calendário vinculado" />}
          </TabsContent>

          {/* Execution */}
          <TabsContent value="execution">
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Gerencie checklists e evidências por loja</p>
              <Button size="sm" variant="outline" onClick={handleOpenExecution}>
                <Play className="h-3 w-3 mr-1" /> Abrir Execução em Loja
              </Button>
            </div>
          </TabsContent>

          {/* Evidence placeholder */}
          <TabsContent value="evidence">
            <LinksSection links={linksByType('document')} type="document" navigate={navigate} onClose={onClose} removeLink={removeLink} />
            {linksByType('document').length === 0 && <EmptySection message="Nenhuma evidência vinculada" />}
          </TabsContent>

          {/* Impact Analysis */}
          <TabsContent value="impact">
            <RetailActionImpactTab actionId={action.id} />
          </TabsContent>

          {/* Trade Bridge */}
          <TabsContent value="trade">
            <div className="space-y-3">
              {/* Trade References */}
              {refs.length > 0 && (
                <Card>
                  <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Handshake className="h-3.5 w-3.5" /> Referências Trade ({refs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 space-y-1">
                    {refs.map(ref => {
                      const snap = ref.status_snapshot as any;
                      return (
                        <div key={ref.id} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs">
                          <div className="min-w-0 flex-1">
                            {snap?.status && <Badge variant="outline" className="text-[10px] mr-1">{snap.status}</Badge>}
                            {snap?.value && <span className="text-[10px] text-muted-foreground">R$ {snap.value}</span>}
                            {snap?.pending && <span className="text-[10px] text-amber-500 ml-1">⚠ {snap.pending}</span>}
                          </div>
                          <Button variant="ghost" size="sm" className="h-5 px-1.5" onClick={() => navigate('/app/trade')}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Trade Requests */}
              {requests.length > 0 && (
                <Card>
                  <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Pedidos de Trade ({requests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 space-y-1">
                    {requests.map(req => {
                      const si2 = TRADE_REQUEST_STATUSES.find(s => s.value === req.status);
                      return (
                        <div key={req.id} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-medium truncate block">{req.title}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {si2 && <Badge variant="outline" className={cn("text-[10px]", si2.color)}>{si2.label}</Badge>}
                              {req.period && <span className="text-[10px] text-muted-foreground">{req.period}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Legacy links */}
              <LinksSection links={linksByType('trade')} type="trade" navigate={navigate} onClose={onClose} removeLink={removeLink} />

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowTradeRequestForm(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Pedido de Trade
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { navigate('/app/trade'); onClose(); }}>
                  <ArrowRight className="h-3 w-3 mr-1" /> Abrir Trade
                </Button>
              </div>

              {refs.length === 0 && requests.length === 0 && linksByType('trade').length === 0 && (
                <EmptySection message="Sem trade vinculado. Crie um pedido de trade ou vincule no Trade." />
              )}
            </div>

            {/* Trade Request Inline Form */}
            {showTradeRequestForm && (
              <Card className="mt-3 border-primary/30">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs">Novo Pedido de Trade</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0 space-y-2">
                  <Input
                    placeholder="Título do pedido"
                    value={tradeRequestTitle}
                    onChange={e => setTradeRequestTitle(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Textarea
                    placeholder="Mecânica / suporte solicitado"
                    value={tradeRequestMechanics}
                    onChange={e => setTradeRequestMechanics(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => {
                      setShowTradeRequestForm(false);
                      setTradeRequestTitle("");
                      setTradeRequestMechanics("");
                    }}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-[10px]"
                      disabled={!tradeRequestTitle || createRequest.isPending}
                      onClick={async () => {
                        await createRequest.mutateAsync({
                          retail_action_id: action.id,
                          title: tradeRequestTitle,
                          mechanics: tradeRequestMechanics || undefined,
                          period: action.period_start && action.period_end
                            ? `${format(new Date(action.period_start), "dd/MM/yy")} - ${format(new Date(action.period_end), "dd/MM/yy")}`
                            : undefined,
                          stores: action.stores_scope || [],
                        });
                        setShowTradeRequestForm(false);
                        setTradeRequestTitle("");
                        setTradeRequestMechanics("");
                      }}
                    >
                      {createRequest.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Kit de Loja */}
          <TabsContent value="kit">
            <div className="space-y-3">
              {kit ? (
                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" /> Kit de Loja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1 space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Gerado em: {format(new Date(kit.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleOpenKit}>
                        <FileDown className="h-3 w-3 mr-1" /> Abrir Documento
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
                        {generateKit.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Package className="h-3 w-3 mr-1" />}
                        Atualizar Kit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => {
                        if (kit.kit_document_page_id) {
                          const url = `${window.location.origin}/app/marketing/documentos/${kit.kit_document_page_id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Link copiado!');
                        }
                      }}>
                        <QrCode className="h-3 w-3 mr-1" /> Copiar Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="py-6 text-center">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground mb-3">Nenhum kit gerado para esta ação</p>
                  <Button size="sm" variant="outline" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
                    {generateKit.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Package className="h-3 w-3 mr-1" />}
                    Gerar Kit de Loja
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-2 border-t border-border">
          <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={handleDelete}>
            <Trash2 className="h-3 w-3 mr-1" /> Remover
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

function LinksSection({ links, type, navigate, onClose, removeLink }: {
  links: any[];
  type: string;
  navigate: any;
  onClose: () => void;
  removeLink: any;
}) {
  const info = LINKED_TYPE_LABELS[type];
  if (!info || links.length === 0) return null;
  const Icon = info.icon;

  return (
    <Card className="mb-2">
      <CardHeader className="p-2 pb-1">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" /> {info.label}s ({links.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-1">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs">
            <span className="flex items-center gap-1.5">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground font-mono text-[10px]">{link.linked_id.slice(0, 8)}…</span>
            </span>
            <div className="flex items-center gap-1">
              {info.route && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { navigate(info.route); onClose(); }}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => removeLink.mutate(link.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-xs text-muted-foreground">{message}</div>
  );
}
