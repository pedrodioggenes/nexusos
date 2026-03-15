import { useState } from "react";
import { motion } from "framer-motion";
import {
  Handshake,
  Plus,
  Search,
  Building2,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Send,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoopFunds, useCoopFundsStats, useCreateCoopFund, useDeleteCoopFund, type CoopFund } from "@/hooks/useCoopFunds";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useTradeReferences, useTradeRequests, TRADE_REQUEST_STATUSES } from "@/hooks/useTradeBridge";
import { useRetailActions } from "@/hooks/useRetailActions";
import { cn } from "@/lib/utils";
import { EditCoopFundDialog } from "@/components/marketing/EditCoopFundDialog";
import { SupplierROIReport } from "@/components/marketing/SupplierROIReport";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Empty } from "@/components/ui/empty";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Trade() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<CoopFund | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bridge");
  const [newFund, setNewFund] = useState({
    supplier_id: "",
    year: new Date().getFullYear(),
    quarter: null as number | null,
    negotiated_amount: 0,
    status: "active" as const,
  });

  const currentYear = new Date().getFullYear();
  const { data: funds = [], isLoading } = useCoopFunds(currentYear);
  const { data: stats } = useCoopFundsStats(currentYear);
  const { data: suppliers = [] } = useSuppliers();
  const createFund = useCreateCoopFund();
  const deleteFund = useDeleteCoopFund();

  // Trade Bridge data
  const { refs } = useTradeReferences();
  const { requests } = useTradeRequests();
  const { actions } = useRetailActions();

  const filteredFunds = funds.filter((fund) => {
    if (statusFilter !== "all" && fund.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return fund.supplier?.name?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleCreateFund = async () => {
    await createFund.mutateAsync({
      ...newFund,
      tenant_id: null,
      executed_amount: 0,
      proven_amount: 0,
      contract_reference: null,
      notes: null,
      negotiated_by: null,
    });
    setIsCreateDialogOpen(false);
    setNewFund({
      supplier_id: "",
      year: currentYear,
      quarter: null,
      negotiated_amount: 0,
      status: "active",
    });
  };

  const handleEditFund = (fund: CoopFund) => {
    setSelectedFund(fund);
    setIsEditDialogOpen(true);
  };

  // Pending trade requests
  const pendingRequests = requests.filter((r) => r.status === "draft" || r.status === "sent");
  // Actions with trade references
  const linkedActions = refs.map((ref) => {
    const action = actions.find((a) => a.id === ref.retail_action_id);
    return { ref, action };
  });

  return (
    <PageWrapper
      title="Trade Marketing"
      subtitle="Visão interna de trade — Gestão completa no Trade"
      icon={<Handshake className="h-5 w-5 text-app-gestao" />}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/app/trade")}
          className="gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir Trade
        </Button>
      }
    >
      {/* Trade CTA Banner */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Trade é a fonte da verdade para Trade Marketing</p>
            <p className="text-[10px] text-muted-foreground">
              Negociações, contratos, fornecedores e comprovações formais ficam no Trade. Aqui você tem a visão resumida para orquestrar ações comerciais.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex-shrink-0 h-7 text-[11px]"
            onClick={() => navigate("/app/trade")}
          >
            <ArrowRight className="h-3 w-3 mr-1" /> Ir para Trade
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="bridge" className="text-xs h-7">
            <ShoppingBag className="h-3 w-3 mr-1" /> Ponte Trade
          </TabsTrigger>
          <TabsTrigger value="legacy" className="text-xs h-7">
            <Building2 className="h-3 w-3 mr-1" /> Verbas (Legacy)
          </TabsTrigger>
        </TabsList>

        {/* ===== BRIDGE TAB ===== */}
        <TabsContent value="bridge" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-lg font-bold">{refs.length}</p>
                <p className="text-[10px] text-muted-foreground">Ações com Trade</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-lg font-bold">{pendingRequests.length}</p>
                <p className="text-[10px] text-muted-foreground">Pedidos Pendentes</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3">
                <p className="text-lg font-bold text-amber-500">
                  {requests.filter((r) => r.status === "sent").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Aguardando Resposta</p>
              </CardContent>
            </Card>
            <Card className="border-green-600/30 bg-green-600/5">
              <CardContent className="p-3">
                <p className="text-lg font-bold text-green-600">
                  {requests.filter((r) => r.status === "accepted").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Aceitos</p>
              </CardContent>
            </Card>
          </div>

          {/* Pedidos Internos */}
          <Card>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Pedidos Internos de Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              {requests.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Nenhum pedido de trade. Crie a partir de uma Ação Comercial.
                </p>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => {
                    const si = TRADE_REQUEST_STATUSES.find((s) => s.value === req.status);
                    const linkedAction = actions.find((a) => a.id === req.retail_action_id);
                    return (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{req.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {si && <Badge variant="outline" className={cn("text-[10px]", si.color)}>{si.label}</Badge>}
                            {linkedAction && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                ← {linkedAction.title}
                              </span>
                            )}
                            {req.period && (
                              <span className="text-[10px] text-muted-foreground">{req.period}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {linkedAction && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => navigate(`/app/marketing/acoes-comerciais`)}
                            >
                              <FileText className="h-3 w-3 mr-1" /> Ação
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => navigate("/app/trade")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> Trade
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trade References (linked actions) */}
          <Card>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Handshake className="h-4 w-4" /> Ações Vinculadas ao Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              {linkedActions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Nenhuma ação comercial vinculada a trade. Vincule no detalhe da ação.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedActions.map(({ ref, action }) => {
                    const snapshot = ref.status_snapshot as any;
                    return (
                      <div key={ref.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {action?.title || "Ação removida"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {snapshot?.status && (
                              <Badge variant="outline" className="text-[10px]">{snapshot.status}</Badge>
                            )}
                            {snapshot?.value && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatCurrency(snapshot.value)}
                              </span>
                            )}
                            {ref.last_sync_at && (
                              <span className="text-[10px] text-muted-foreground">
                                Sync: {format(new Date(ref.last_sync_at), "dd/MM HH:mm", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => navigate("/app/trade")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> Trade
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== LEGACY TAB (VERBAS) ===== */}
        <TabsContent value="legacy" className="space-y-4">
          {/* Legacy notice */}
          <Card className="border-muted bg-muted/20">
            <CardContent className="p-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                <strong>Legacy:</strong> A gestão de verbas cooperadas está sendo centralizada no Trade. Use esta visão como referência histórica.
              </p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-app-gestao/30 bg-app-gestao/5">
              <CardContent className="p-3">
                <p className="text-lg md:text-xl font-bold text-app-gestao">
                  {formatCurrency(stats?.totalNegotiated || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Total Negociado</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-3">
                <p className="text-lg md:text-xl font-bold text-green-500">
                  {formatCurrency(stats?.totalExecuted || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Executado</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-3">
                <p className="text-lg md:text-xl font-bold text-yellow-500">
                  {formatCurrency(stats?.pendingProof || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">A Comprovar</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg md:text-xl font-bold">
                      {(stats?.utilizationRate || 0).toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Utilização</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supplier ROI Report */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <SupplierROIReport limit={5} showChart={true} className="md:col-span-1" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="negotiating">Negociando</SelectItem>
                <SelectItem value="closed">Encerrados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Funds List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
            </div>
          ) : filteredFunds.length === 0 ? (
            <Empty
              icon={<Handshake className="h-12 w-12" />}
              title="Nenhuma verba encontrada"
              description={searchQuery ? "Tente ajustar a busca" : "Cadastre sua primeira verba cooperada"}
              action={
                <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Nova Verba
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFunds.map((fund, index) => (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-module-gestao/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-module-gestao" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">
                              {fund.supplier?.name || "Fornecedor"}
                            </h3>
                            <span className="text-[10px] text-muted-foreground">
                              {fund.quarter ? `Q${fund.quarter}/${fund.year}` : fund.year}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditFund(fund)}>
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteFund.mutate(fund.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Negociado</span>
                          <span className="font-semibold text-sm">
                            {formatCurrency(fund.negotiated_amount)}
                          </span>
                        </div>
                        <Progress
                          value={fund.utilization_rate || 0}
                          className={cn(
                            "h-2",
                            (fund.utilization_rate || 0) >= 80 && "[&>div]:bg-green-500",
                            (fund.utilization_rate || 0) < 30 && "[&>div]:bg-yellow-500"
                          )}
                        />
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs font-medium">{formatCurrency(fund.executed_amount)}</p>
                            <p className="text-[10px] text-muted-foreground">Executado</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">{formatCurrency(fund.proven_amount)}</p>
                            <p className="text-[10px] text-muted-foreground">Comprovado</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-yellow-500">
                              {formatCurrency(fund.pending_proof_amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Pendente</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              fund.status === "active" && "border-green-500/50 text-green-500",
                              fund.status === "negotiating" && "border-yellow-500/50 text-yellow-500"
                            )}
                          >
                            {fund.status === "active" && "Ativo"}
                            {fund.status === "negotiating" && "Negociando"}
                            {fund.status === "closed" && "Encerrado"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {(fund.utilization_rate || 0).toFixed(0)}% utilizado
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Verba Cooperada</DialogTitle>
            <DialogDescription>Registre uma nova verba negociada com fornecedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={newFund.supplier_id} onValueChange={(value) => setNewFund({ ...newFund, supplier_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={newFund.year.toString()} onValueChange={(value) => setNewFund({ ...newFund, year: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                    <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                    <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trimestre (opcional)</Label>
                <Select
                  value={newFund.quarter?.toString() || "annual"}
                  onValueChange={(value) => setNewFund({ ...newFund, quarter: value === "annual" ? null : parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Anual</SelectItem>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Negociado (R$)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newFund.negotiated_amount || ""}
                onChange={(e) => setNewFund({ ...newFund, negotiated_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFund}
              disabled={!newFund.supplier_id || newFund.negotiated_amount <= 0}
              className="bg-module-gestao hover:bg-module-gestao/90"
            >
              Criar Verba
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditCoopFundDialog fund={selectedFund} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </PageWrapper>
  );
}
