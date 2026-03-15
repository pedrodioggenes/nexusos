import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Calendar, Store, Zap, FileText, Target, ShoppingBag,
  PackagePlus, CalendarPlus, ClipboardList, Play, ExternalLink, Trash2, Link2, Package, Loader2, FileDown, QrCode,
  Send, Handshake, Plus, ArrowRight,
} from "lucide-react";
import { useRetailActions, useRetailActionLinks, RETAIL_ACTION_STATUSES, RETAIL_ACTION_TYPES } from "@/hooks/useRetailActions";
import { useStoreKit } from "@/hooks/useStoreKit";
import { useTradeReferences, useTradeRequests, TRADE_REQUEST_STATUSES } from "@/hooks/useTradeBridge";
import { RetailActionImpactTab } from "@/components/marketing/retail/RetailActionImpactTab";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AcaoComercialDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { actions, isLoading } = useRetailActions();
  const action = actions.find(a => a.id === id) || null;
  const { links, addLink, removeLink } = useRetailActionLinks(action?.id || null);
  const { kit, generateKit } = useStoreKit(action?.id || null);
  const { refs, createRef } = useTradeReferences(action?.id || undefined);
  const { requests, createRequest } = useTradeRequests(action?.id || undefined);
  const { updateAction, deleteAction } = useRetailActions();
  const [tab, setTab] = useState("overview");
  const [showTradeRequestForm, setShowTradeRequestForm] = useState(false);
  const [tradeRequestTitle, setTradeRequestTitle] = useState("");
  const [tradeRequestMechanics, setTradeRequestMechanics] = useState("");

  if (isLoading) {
    return (
      <PageWrapper title="Carregando..." icon={<Zap className="h-5 w-5" />}>
        <Skeleton className="h-64 w-full" />
      </PageWrapper>
    );
  }

  if (!action) {
    return (
      <PageWrapper title="Ação não encontrada" icon={<Zap className="h-5 w-5" />}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ação comercial não encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/marketing/acoes-comerciais")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </PageWrapper>
    );
  }

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
    navigate("/app/marketing/acoes-comerciais");
  };

  const handleGenerateStoreKit = async () => {
    const pageId = await generateKit.mutateAsync(action);
    if (pageId) navigate(`/app/marketing/documentos/${pageId}`);
  };

  const handleOpenKit = () => {
    if (kit?.kit_document_page_id) navigate(`/app/marketing/documentos/${kit.kit_document_page_id}`);
  };

  const linksByType = (type: string) => links.filter(l => l.linked_type === type);

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

  return (
    <PageWrapper
      title={action.title}
      icon={<Zap className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/acoes-comerciais")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Select value={action.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RETAIL_ACTION_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Status badges */}
      <div className="flex items-center gap-2 mb-4">
        {si && <Badge variant="outline" className={cn("text-xs", si.color)}>{si.label}</Badge>}
        {ti && <Badge variant="secondary" className="text-xs">{ti.label}</Badge>}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate('/app/marketing/planejamento')}>
          <CalendarPlus className="h-3.5 w-3.5 mr-1" /> Calendário
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
          {generateKit.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Package className="h-3.5 w-3.5 mr-1" />}
          {kit ? 'Atualizar Kit' : 'Gerar Kit de Loja'}
        </Button>
        {kit?.kit_document_page_id && (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleOpenKit}>
            <FileDown className="h-3.5 w-3.5 mr-1" /> Abrir Kit
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/app/marketing/execucao/${action.id}`)}>
          <Play className="h-3.5 w-3.5 mr-1" /> Execução
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="production" className="text-xs">Produção</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendário</TabsTrigger>
          <TabsTrigger value="execution" className="text-xs">Execução</TabsTrigger>
          <TabsTrigger value="evidence" className="text-xs">Evidências</TabsTrigger>
          <TabsTrigger value="impact" className="text-xs">Impacto</TabsTrigger>
          <TabsTrigger value="trade" className="text-xs">Trade</TabsTrigger>
          <TabsTrigger value="kit" className="text-xs">Kit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard label="Período">
              {action.period_start ? (
                <span className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(action.period_start), "dd MMM yyyy", { locale: ptBR })}
                  {action.period_end && ` – ${format(new Date(action.period_end), "dd MMM yyyy", { locale: ptBR })}`}
                </span>
              ) : <span className="text-sm text-muted-foreground">Não definido</span>}
            </InfoCard>
            <InfoCard label="Mecânica">
              <span className="text-sm">{action.mechanics || '—'}</span>
            </InfoCard>
            <InfoCard label="Lojas">
              {stores.length > 0 ? (
                <span className="flex items-center gap-1 text-sm">
                  <Store className="h-3.5 w-3.5" /> {stores.length} unidade(s)
                </span>
              ) : <span className="text-sm text-muted-foreground">Todas</span>}
            </InfoCard>
            <InfoCard label="Canais">
              {channels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {channels.map(ch => (
                    <Badge key={ch} variant="secondary" className="text-xs px-2">{(ch as string).replace('_', ' ')}</Badge>
                  ))}
                </div>
              ) : <span className="text-sm text-muted-foreground">Nenhum</span>}
            </InfoCard>
          </div>
          {action.notes && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">{action.notes}</div>
          )}
        </TabsContent>

        <TabsContent value="production">
          <LinksSection links={linksByType('demand')} type="demand" labels={LINKED_TYPE_LABELS} navigate={navigate} removeLink={removeLink} />
          <LinksSection links={linksByType('campaign')} type="campaign" labels={LINKED_TYPE_LABELS} navigate={navigate} removeLink={removeLink} />
          {linksByType('demand').length === 0 && linksByType('campaign').length === 0 && (
            <EmptySection message="Nenhuma demanda ou campanha vinculada" />
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <LinksSection links={linksByType('plan')} type="plan" labels={LINKED_TYPE_LABELS} navigate={navigate} removeLink={removeLink} />
          {linksByType('plan').length === 0 && <EmptySection message="Nenhum evento de calendário vinculado" />}
        </TabsContent>

        <TabsContent value="execution">
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Gerencie checklists e evidências por loja</p>
            <Button variant="outline" onClick={() => navigate(`/app/marketing/execucao/${action.id}`)}>
              <Play className="h-4 w-4 mr-2" /> Abrir Execução em Loja
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <LinksSection links={linksByType('document')} type="document" labels={LINKED_TYPE_LABELS} navigate={navigate} removeLink={removeLink} />
          {linksByType('document').length === 0 && <EmptySection message="Nenhuma evidência vinculada" />}
        </TabsContent>

        <TabsContent value="impact">
          <RetailActionImpactTab actionId={action.id} />
        </TabsContent>

        <TabsContent value="trade">
          <div className="space-y-3">
            {refs.length > 0 && (
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Handshake className="h-3.5 w-3.5" /> Referências Trade ({refs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {refs.map(ref => {
                    const snap = ref.status_snapshot as any;
                    return (
                      <div key={ref.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                        <div className="min-w-0 flex-1">
                          {snap?.status && <Badge variant="outline" className="text-xs mr-1">{snap.status}</Badge>}
                          {snap?.value && <span className="text-xs text-muted-foreground">R$ {snap.value}</span>}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => navigate('/app/trade')}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {requests.length > 0 && (
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Pedidos de Trade ({requests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {requests.map(req => {
                    const si2 = TRADE_REQUEST_STATUSES.find(s => s.value === req.status);
                    return (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{req.title}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {si2 && <Badge variant="outline" className={cn("text-xs", si2.color)}>{si2.label}</Badge>}
                            {req.period && <span className="text-xs text-muted-foreground">{req.period}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <LinksSection links={linksByType('trade')} type="trade" labels={LINKED_TYPE_LABELS} navigate={navigate} removeLink={removeLink} />

            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowTradeRequestForm(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Pedido de Trade
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => navigate('/app/trade')}>
                <ArrowRight className="h-3.5 w-3.5 mr-1" /> Abrir Trade
              </Button>
            </div>

            {showTradeRequestForm && (
              <Card className="border-primary/30">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs">Novo Pedido de Trade</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <Input placeholder="Título do pedido" value={tradeRequestTitle} onChange={e => setTradeRequestTitle(e.target.value)} className="h-8 text-sm" />
                  <Textarea placeholder="Mecânica / suporte solicitado" value={tradeRequestMechanics} onChange={e => setTradeRequestMechanics(e.target.value)} className="text-sm min-h-[60px]" />
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowTradeRequestForm(false); setTradeRequestTitle(""); setTradeRequestMechanics(""); }}>Cancelar</Button>
                    <Button size="sm" className="h-7 text-xs" disabled={!tradeRequestTitle || createRequest.isPending}
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
                      {createRequest.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />} Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

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
                  <p className="text-xs text-muted-foreground">Gerado em: {format(new Date(kit.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleOpenKit}>
                      <FileDown className="h-3.5 w-3.5 mr-1" /> Abrir Documento
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
                      {generateKit.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Package className="h-3.5 w-3.5 mr-1" />} Atualizar Kit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => {
                      if (kit.kit_document_page_id) {
                        navigator.clipboard.writeText(`${window.location.origin}/app/marketing/documentos/${kit.kit_document_page_id}`);
                        toast.success('Link copiado!');
                      }
                    }}>
                      <QrCode className="h-3.5 w-3.5 mr-1" /> Copiar Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="py-8 text-center">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Nenhum kit gerado para esta ação</p>
                <Button variant="outline" onClick={handleGenerateStoreKit} disabled={generateKit.isPending}>
                  {generateKit.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Package className="h-4 w-4 mr-1" />} Gerar Kit de Loja
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-start pt-4 border-t border-border mt-6">
        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover Ação
        </Button>
      </div>
    </PageWrapper>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

function LinksSection({ links, type, labels, navigate, removeLink }: {
  links: any[]; type: string; labels: Record<string, any>; navigate: any; removeLink: any;
}) {
  const info = labels[type];
  if (!info || links.length === 0) return null;
  const Icon = info.icon;
  return (
    <Card className="mb-2">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" /> {info.label}s ({links.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1">
        {links.map((link: any) => (
          <div key={link.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
            <span className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-mono text-xs">{link.linked_id.slice(0, 8)}…</span>
            </span>
            <div className="flex items-center gap-1">
              {info.route && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(info.route)}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeLink.mutate(link.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptySection({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-muted-foreground">{message}</div>;
}
