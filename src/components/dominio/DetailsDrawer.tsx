import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SparklineChart } from "./SparklineChart";
import { PendenciaActions } from "./PendenciaActions";
import { formatCurrency, formatPercent, ALERTS } from "@/data/dominio/mock-data";
import type { UnitSummary, Alert, Pendencia, SalesByCategory } from "@/data/dominio/types";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnitDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitSummary | null;
  onCreatePendencia: (p: Omit<Pendencia, "id" | "created_at">) => void;
}

export function UnitDetailsDrawer({ open, onOpenChange, unit, onCreatePendencia }: UnitDrawerProps) {
  const navigate = useNavigate();
  if (!unit) return null;

  const unitAlerts = ALERTS.filter(a => a.unit_id === unit.id && a.status === "active").slice(0, 5);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{unit.name}</SheetTitle>
          <SheetDescription>{unit.city} • {unit.alerts_count} alertas ativos</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <MiniKPI label="Venda" value={formatCurrency(unit.sales)} />
            <MiniKPI label="Margem" value={formatPercent(unit.margin_pct)} />
            <MiniKPI label="Ticket Médio" value={`R$ ${unit.avg_ticket}`} />
            <MiniKPI label="Ruptura" value={`${unit.rupture_count} itens`} />
            <MiniKPI label="Perdas" value={formatCurrency(unit.losses_value)} />
            <MiniKPI label="Pendências" value={String(unit.pendencias_count)} />
          </div>

          <Card className="p-3 bg-card border-border">
            <p className="text-xs text-muted-foreground mb-2">Tendência de Vendas</p>
            <SparklineChart data={unit.trend} width={280} height={40} />
          </Card>

          {unitAlerts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Alertas ({unitAlerts.length})</p>
              <div className="space-y-1.5">
                {unitAlerts.map(a => (
                  <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                    <Badge variant={a.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] shrink-0 mt-0.5">
                      {a.severity === "critical" ? "Crítico" : "Atenção"}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-xs text-foreground truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">Impacto: {formatCurrency(a.impact_value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { onOpenChange(false); navigate(`/app/dominio/unidades/visao-geral`); }}>
              <ExternalLink className="h-3 w-3 mr-1" /> Abrir em Unidades
            </Button>
            <PendenciaActions
              onCreatePendencia={onCreatePendencia}
              relatedType="unit"
              relatedId={unit.id}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

interface AlertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onCreatePendencia: (p: Omit<Pendencia, "id" | "created_at">) => void;
  onResolve?: (id: string) => void;
  onIgnore?: (id: string, reason: string) => void;
}

export function AlertDetailsDrawer({ open, onOpenChange, alert, onCreatePendencia, onResolve, onIgnore }: AlertDrawerProps) {
  if (!alert) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
              {alert.severity === "critical" ? "Crítico" : "Atenção"}
            </Badge>
            <span className="truncate">{alert.title}</span>
          </SheetTitle>
          <SheetDescription>{alert.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <MiniKPI label="Impacto Estimado" value={formatCurrency(alert.impact_value)} />
            <MiniKPI label="Domínio" value={alert.domain} />
            <MiniKPI label="Unidade" value={alert.unit_name} />
            <MiniKPI label="Regra" value={alert.rule_name} />
            {alert.category && <MiniKPI label="Categoria" value={alert.category} />}
            <MiniKPI label="Limiar" value={alert.rule_threshold} />
          </div>

          <div className="text-xs text-muted-foreground">
            Criado em: {new Date(alert.created_at).toLocaleDateString("pt-BR")}
            {alert.resolved_at && ` • Resolvido em: ${new Date(alert.resolved_at).toLocaleDateString("pt-BR")}`}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            {alert.status === "active" && onResolve && (
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { onResolve(alert.id); onOpenChange(false); }}>
                Marcar como Resolvido
              </Button>
            )}
            <PendenciaActions
              onCreatePendencia={onCreatePendencia}
              relatedType="alert"
              relatedId={alert.id}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ===== CATEGORY DETAILS DRAWER =====

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: SalesByCategory | null;
  onCreatePendencia: (p: Omit<Pendencia, "id" | "created_at">) => void;
}

export function CategoryDetailsDrawer({ open, onOpenChange, category, onCreatePendencia }: CategoryDrawerProps) {
  const navigate = useNavigate();
  if (!category) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{category.name}</SheetTitle>
          <SheetDescription>Detalhamento da categoria</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <MiniKPI label="Venda" value={formatCurrency(category.sales)} />
            <MiniKPI label="Margem" value={formatPercent(category.margin_pct)} />
            <MiniKPI label="Participação" value={formatPercent(category.share_pct)} />
            <MiniKPI label="Crescimento" value={`${category.growth_pct > 0 ? "+" : ""}${category.growth_pct.toFixed(1)}%`} />
          </div>

          <div>
            <p className="text-xs font-medium text-foreground mb-2">Subcategorias</p>
            <div className="space-y-1.5">
              {category.subcategories.map(sub => (
                <div key={sub.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <span className="text-xs text-foreground">{sub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatCurrency(sub.sales)}</span>
                    <span className="text-xs text-muted-foreground">{sub.share_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { onOpenChange(false); navigate(`/app/dominio/produtos/catalogo`); }}>
              <ExternalLink className="h-3 w-3 mr-1" /> Abrir em Produtos &gt; Catálogo
            </Button>
            <PendenciaActions
              onCreatePendencia={onCreatePendencia}
              relatedType="category"
              relatedId={category.name}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
