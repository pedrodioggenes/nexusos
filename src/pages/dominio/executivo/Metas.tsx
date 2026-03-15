import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, type ColumnDef } from "@/components/dominio/DataTablePro";
import { ChartSection } from "@/components/dominio/ChartSection";
import { PendenciaActions } from "@/components/dominio/PendenciaActions";
import { useGlobalFilters, useGoals, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency } from "@/data/dominio/mock-data";
import { UNITS } from "@/data/dominio/mock-data";
import type { Goal, KPICardData } from "@/data/dominio/types";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function Metas() {
  const { filters, updateFilter } = useGlobalFilters();
  const goals = useGoals(filters);
  const { addPendencia } = usePendencias();

  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);
  const [editOpen, setEditOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Partial<Goal>>({});
  const [drawerGoal, setDrawerGoal] = useState<Goal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalTarget = localGoals.reduce((s, g) => s + g.target, 0);
  const totalActual = localGoals.reduce((s, g) => s + g.actual, 0);
  const avgPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  const totalGap = localGoals.reduce((s, g) => s + g.gap, 0);
  const totalProjection = localGoals.reduce((s, g) => s + g.projection, 0);
  const bestGoal = [...localGoals].sort((a, b) => b.pct - a.pct)[0];

  const kpis: KPICardData[] = [
    { label: "Atingimento Geral", value: avgPct, formatted_value: `${avgPct.toFixed(1)}%`, variation_type: avgPct >= 95 ? "positive" : avgPct >= 90 ? "neutral" : "negative" },
    { label: "Gap Total", value: totalGap, formatted_value: formatCurrency(Math.abs(totalGap)), variation_type: "negative", impact_label: "faltando para meta" },
    { label: "Projeção Fim Período", value: totalProjection, formatted_value: formatCurrency(totalProjection), variation_type: totalProjection >= totalTarget ? "positive" : "negative" },
    { label: "Melhor Atingimento", value: bestGoal?.unit_name ?? "", formatted_value: bestGoal?.unit_name ?? "--", impact_label: `${bestGoal?.pct.toFixed(1)}%` },
  ];

  const statusColor = (status: Goal["status"]) => {
    if (status === "green") return "bg-green-500";
    if (status === "yellow") return "bg-amber-500";
    return "bg-red-500";
  };

  const columns: ColumnDef<Goal>[] = [
    { key: "unit_name", label: "Unidade", getValue: r => r.unit_name },
    { key: "target", label: "Alvo R$", render: r => formatCurrency(r.target), getValue: r => r.target },
    { key: "actual", label: "Realizado R$", render: r => formatCurrency(r.actual), getValue: r => r.actual },
    { key: "pct", label: "% Ating.", render: r => (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${statusColor(r.status)}`} />
        <span>{r.pct.toFixed(1)}%</span>
      </div>
    ), getValue: r => r.pct },
    { key: "gap", label: "Gap R$", render: r => <span className={r.gap < 0 ? "text-red-500" : "text-green-500"}>{formatCurrency(Math.abs(r.gap))}</span>, getValue: r => r.gap },
    { key: "status", label: "Status", render: r => (
      <Badge variant={r.status === "green" ? "default" : r.status === "yellow" ? "secondary" : "destructive"} className="text-[10px]">
        {r.status === "green" ? "No alvo" : r.status === "yellow" ? "Atenção" : "Crítico"}
      </Badge>
    ), getValue: r => r.status, filterable: false },
  ];

  const handleSaveGoal = () => {
    if (!editGoal.unit_id || !editGoal.target) {
      toast({ title: "Preencha unidade e alvo", variant: "destructive" });
      return;
    }
    const unit = UNITS.find(u => u.id === editGoal.unit_id);
    const existing = localGoals.find(g => g.unit_id === editGoal.unit_id);
    if (existing) {
      setLocalGoals(prev => prev.map(g => g.unit_id === editGoal.unit_id ? {
        ...g,
        target: editGoal.target!,
        gap: g.actual - editGoal.target!,
        pct: (g.actual / editGoal.target!) * 100,
        status: (g.actual / editGoal.target!) >= 0.95 ? "green" : (g.actual / editGoal.target!) >= 0.90 ? "yellow" : "red",
        history: [...g.history, { date: new Date().toISOString().split("T")[0], changed_by: "Usuário atual", old_value: g.target, new_value: editGoal.target!, reason: editGoal.period || "Ajuste manual" }]
      } : g));
    }
    toast({ title: "Meta atualizada", description: `${unit?.name ?? ""} → ${formatCurrency(editGoal.target!)}` });
    setEditOpen(false);
    setEditGoal({});
  };

  return (
    <div className="space-y-4">
      <BlurFade delay={0}>
        <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      </BlurFade>

      <BlurFade delay={0.05}>
        <KPIGrid items={kpis} columns={4} />
      </BlurFade>

      <BlurFade delay={0.1}>
        <ChartSection title="Metas por Unidade">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditOpen(true)}>Editar Meta</Button>
          </div>
          <DataTablePro<any>
            data={localGoals}
            columns={columns as any}
            actions={[
              { label: "Detalhe", onClick: (row: any) => { setDrawerGoal(row as Goal); setDrawerOpen(true); } },
              { label: "Pendência", onClick: (row: any) => { const g = row as Goal; if (g.status === "red") toast({ title: "Crie uma pendência para esta unidade" }); }, show: (row: any) => (row as Goal).status === "red" },
            ]}
          />
        </ChartSection>
      </BlurFade>

      {/* Edit Goal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar / Editar Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Unidade</Label>
              <Select value={editGoal.unit_id || ""} onValueChange={v => setEditGoal(p => ({ ...p, unit_id: v, unit_name: UNITS.find(u => u.id === v)?.name }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={editGoal.type || "venda"} onValueChange={v => setEditGoal(p => ({ ...p, type: v as Goal["type"] }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="margem">Margem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Alvo R$</Label>
              <Input type="number" value={editGoal.target || ""} onChange={e => setEditGoal(p => ({ ...p, target: Number(e.target.value) }))} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Motivo da alteração</Label>
              <Input value={editGoal.period || ""} onChange={e => setEditGoal(p => ({ ...p, period: e.target.value }))} className="h-8 text-sm" placeholder="Ex: Ajuste sazonal" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSaveGoal}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawerGoal && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerGoal.unit_name}</SheetTitle>
                <SheetDescription>Meta {drawerGoal.type} • {drawerGoal.period}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Alvo</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(drawerGoal.target)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Realizado</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(drawerGoal.actual)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Atingimento</p>
                    <p className="text-sm font-semibold text-foreground">{drawerGoal.pct.toFixed(1)}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Projeção</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(drawerGoal.projection)}</p>
                  </div>
                </div>

                {drawerGoal.history.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">Histórico de Alterações</p>
                    <div className="space-y-1.5">
                      {drawerGoal.history.map((h, i) => (
                        <div key={i} className="p-2 rounded-lg bg-secondary/30 text-xs">
                          <p className="text-foreground">{h.changed_by} • {h.date}</p>
                          <p className="text-muted-foreground">{formatCurrency(h.old_value)} → {formatCurrency(h.new_value)} — {h.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <PendenciaActions onCreatePendencia={addPendencia} relatedType="goal" relatedId={drawerGoal.id} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
