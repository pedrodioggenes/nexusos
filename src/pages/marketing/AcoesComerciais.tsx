import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Store, Calendar, Tag, Zap, Filter } from "lucide-react";
import { useRetailActions, RETAIL_ACTION_TYPES, RETAIL_ACTION_STATUSES } from "@/hooks/useRetailActions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AcoesComerciais() {
  const navigate = useNavigate();
  const { actions, isLoading } = useRetailActions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return actions.filter(a => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      return true;
    });
  }, [actions, search, statusFilter, typeFilter]);

  const statusInfo = (status: string) => RETAIL_ACTION_STATUSES.find(s => s.value === status);
  const typeInfo = (type: string) => RETAIL_ACTION_TYPES.find(t => t.value === type);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ações Comerciais"
        description="Centro de planejamento e execução de ações de varejo"
        actions={
          <Button size="sm" onClick={() => navigate("/app/marketing/acoes-comerciais/nova")}>
            <Plus className="h-4 w-4 mr-1" /> Nova Ação
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar ação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {RETAIL_ACTION_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><Tag className="h-3 w-3 mr-1" /><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            {RETAIL_ACTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground py-8 text-center">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma ação comercial encontrada</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/app/marketing/acoes-comerciais/nova")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Criar primeira ação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map(action => {
            const si = statusInfo(action.status);
            const ti = typeInfo(action.type);
            const channels = Array.isArray(action.channels) ? action.channels : [];
            const stores = Array.isArray(action.stores_scope) ? action.stores_scope : [];
            return (
              <Card key={action.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/app/marketing/acoes-comerciais/${action.id}`)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{action.title}</span>
                      {si && <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", si.color)}>{si.label}</Badge>}
                      {ti && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{ti.label}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {action.period_start && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(action.period_start), "dd MMM", { locale: ptBR })}
                          {action.period_end && ` – ${format(new Date(action.period_end), "dd MMM", { locale: ptBR })}`}
                        </span>
                      )}
                      {stores.length > 0 && <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {stores.length} {stores.length === 1 ? 'loja' : 'lojas'}</span>}
                      {channels.length > 0 && <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {channels.length} {channels.length === 1 ? 'canal' : 'canais'}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}