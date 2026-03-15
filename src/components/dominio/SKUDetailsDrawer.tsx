import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkToContext } from "./LinkToContext";
import { CreatePendenciaModal } from "./CreatePendenciaModal";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { ExternalLink, AlertCircle } from "lucide-react";
import type { ProductDim, ProductMetrics } from "@/data/dominio/types";

interface SKUDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku: (ProductDim & ProductMetrics) | null;
}

export function SKUDetailsDrawer({ open, onOpenChange, sku }: SKUDetailsDrawerProps) {
  const [showPendenciaModal, setShowPendenciaModal] = useState(false);
  const { addPendencia } = usePendenciasStore();

  if (!sku) return null;

  const capitalParado = sku.stock * sku.cost;
  const rotacaoAnual = (365 / sku.giro).toFixed(1);

  const handleCreatePendencia = (p: any) => {
    addPendencia({
      title: p.title,
      description: p.description,
      responsible: p.responsible,
      due_date: p.due_date,
      status: "open",
      priority: p.priority,
      created_by: "Sistema",
    });
    setShowPendenciaModal(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg">{sku.name}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* SKU Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SKU</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{sku.sku}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Marca</span>
                <span className="text-sm font-medium">{sku.brand}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categoria</span>
                <Badge variant="outline">{sku.category}</Badge>
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Financeiro</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Preço</p>
                  <p className="font-semibold">R$ {sku.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Custo</p>
                  <p className="font-semibold">R$ {sku.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margem %</p>
                  <p className="font-semibold text-green-600">{sku.margin_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margem R$</p>
                  <p className="font-semibold">R$ {sku.margin_value.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Estoque */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Estoque</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Unidades</p>
                  <p className="font-semibold">{sku.stock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giro (dias)</p>
                  <p className="font-semibold">{sku.giro}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cobertura (dias)</p>
                  <p className="font-semibold">{sku.cobertura}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rotação/ano</p>
                  <p className="font-semibold">{rotacaoAnual}x</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Capital parado</p>
                  <p className="font-semibold">R$ {(capitalParado / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </div>

            {/* Problemas */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Indicadores
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Perdas (R$)</p>
                  <p className="font-semibold text-red-600">R$ {sku.perdas.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ruptura (dias)</p>
                  <p className="font-semibold text-orange-600">{sku.ruptura_dias || 0} dias</p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Ações</h4>
              <div className="space-y-2">
                <LinkToContext
                  label="Ver em Problemas > Preço & Margem"
                  to="/app/dominio/problemas/preco-margem"
                  state={{ selectedSKU: sku.sku }}
                  className="w-full justify-start text-xs"
                />
                <LinkToContext
                  label="Ver em Problemas > Perdas"
                  to="/app/dominio/problemas/perdas"
                  state={{ selectedSKU: sku.sku }}
                  className="w-full justify-start text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setShowPendenciaModal(true)}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Criar Pendência
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreatePendenciaModal
        open={showPendenciaModal}
        onOpenChange={setShowPendenciaModal}
        onSubmit={handleCreatePendencia}
        defaults={{
          title: `Revisar ${sku.name} (${sku.sku})`,
        }}
      />
    </>
  );
}
