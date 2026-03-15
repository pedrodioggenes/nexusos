import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Clock,
  BarChart3,
  Save,
} from "lucide-react";
import { useComprasSuppliers, useComprasSkus, formatBRL, formatPct } from "@/hooks/useComprasData";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface POLineItem {
  id: string;
  skuId: string;
  skuName: string;
  skuCode: string;
  qty: number;
  unitPrice: number;
  referencePrice: number;
  avgDailyDemand: number;
  currentStock: number;
  avgCta: number;
  coverageMinDays: number;
  coverageMaxDays: number;
}

// PPV = (Preço Negociado - Preço Referência) × Qty
function calcPPV(item: POLineItem) {
  return (item.unitPrice - item.referencePrice) * item.qty;
}

// Cobertura pós-compra = (Estoque Atual + Qty) / ADD
function calcCoveragePostDays(item: POLineItem) {
  if (!item.avgDailyDemand || item.avgDailyDemand <= 0) return null;
  return (item.currentStock + item.qty) / item.avgDailyDemand;
}

// CTA Estimado = Preço Unit + (Frete% estimado) — simplified as unit price * 1.03
function calcCTAEstimated(item: POLineItem) {
  return item.unitPrice * 1.03; // 3% freight estimate
}

// GMROI Projetado = Margem Bruta / Investimento Médio Estoque
function calcGMROI(item: POLineItem) {
  const cta = calcCTAEstimated(item);
  const sellingPrice = cta * 1.35; // assume 35% markup
  const margin = (sellingPrice - cta) / sellingPrice;
  const investmentAvg = (item.qty * item.unitPrice) / 2;
  if (investmentAvg <= 0) return null;
  const grossProfit = margin * item.qty * sellingPrice;
  return grossProfit / investmentAvg;
}

export default function POCalculator() {
  const navigate = useNavigate();
  const { data: suppliers = [] } = useComprasSuppliers();
  const { data: skus = [] } = useComprasSkus();

  const [supplierId, setSupplierId] = useState<string>("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POLineItem[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState("");

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const supplierSkus = useMemo(
    () => (supplierId ? skus.filter((s) => s.primary_supplier_id === supplierId) : skus),
    [skus, supplierId]
  );

  const addItem = useCallback(() => {
    const sku = skus.find((s) => s.id === selectedSkuId);
    if (!sku || items.some((i) => i.skuId === selectedSkuId)) return;

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        skuId: sku.id,
        skuName: sku.name,
        skuCode: sku.code,
        qty: 1,
        unitPrice: sku.last_price || 0,
        referencePrice: sku.last_price || 0,
        avgDailyDemand: sku.avg_daily_demand || 0,
        currentStock: 0,
        avgCta: sku.avg_cta || 0,
        coverageMinDays: sku.coverage_min_days || 7,
        coverageMaxDays: sku.coverage_max_days || 30,
      },
    ]);
    setSelectedSkuId("");
  }, [selectedSkuId, skus, items]);

  const updateItem = useCallback((id: string, field: keyof POLineItem, value: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Aggregated KPIs
  const totals = useMemo(() => {
    let totalValue = 0;
    let totalPPV = 0;
    let alertCount = 0;

    items.forEach((item) => {
      totalValue += item.unitPrice * item.qty;
      totalPPV += calcPPV(item);
      const cov = calcCoveragePostDays(item);
      if (cov && cov > item.coverageMaxDays) alertCount++;
      if (calcPPV(item) > 0) alertCount++;
    });

    // CCC Impact estimate: DPO assumed from supplier payment_terms
    const paymentDays = selectedSupplier?.payment_terms
      ? parseInt(selectedSupplier.payment_terms) || 30
      : 30;
    const cccImpact = paymentDays > 0 ? totalValue / paymentDays : 0;

    return { totalValue, totalPPV, alertCount, cccImpactDays: paymentDays, itemCount: items.length };
  }, [items, selectedSupplier]);

  // Approval threshold
  const approvalLevel = totals.totalValue >= 50000 ? "Diretoria" : totals.totalValue >= 10000 ? "Gerência" : "Automática";
  const approvalColor = totals.totalValue >= 50000 ? "text-destructive" : totals.totalValue >= 10000 ? "text-warning" : "text-success";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/compras/ordens")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-app-compras" />
            Calculadora de OC
          </h1>
          <p className="text-sm text-muted-foreground">Cálculo automático de PPV, CTA, cobertura e GMROI</p>
        </div>
      </div>

      {/* Real-time KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-app-compras/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-app-compras" />
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Valor Total</span>
            </div>
            <span className="text-lg font-bold text-foreground">{formatBRL(totals.totalValue)}</span>
          </CardContent>
        </Card>
        <Card className={totals.totalPPV > 0 ? "border-destructive/30" : "border-success/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {totals.totalPPV > 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
              <span className="text-[10px] uppercase font-medium text-muted-foreground">PPV Total</span>
            </div>
            <span className={`text-lg font-bold ${totals.totalPPV > 0 ? "text-destructive" : "text-success"}`}>
              {totals.totalPPV > 0 ? "+" : ""}{formatBRL(totals.totalPPV)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Itens</span>
            </div>
            <span className="text-lg font-bold text-foreground">{totals.itemCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Impacto CCC</span>
            </div>
            <span className="text-lg font-bold text-foreground">{totals.cccImpactDays}d</span>
          </CardContent>
        </Card>
        <Card className={totals.alertCount > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${totals.alertCount > 0 ? "text-warning" : "text-muted-foreground"}`} />
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Alertas</span>
            </div>
            <span className={`text-lg font-bold ${totals.alertCount > 0 ? "text-warning" : "text-foreground"}`}>{totals.alertCount}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: OC config */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuração da OC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Fornecedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.cnpj ? `(${s.cnpj})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Previsão de Entrega</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Observações</Label>
              <Textarea
                placeholder="Notas ou condições especiais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <Separator />

            {/* Approval threshold info */}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Nível de Aprovação</span>
                <span className={`text-sm font-semibold ${approvalColor}`}>{approvalLevel}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {totals.totalValue >= 50000
                  ? "Acima de R$ 50.000 — requer aprovação da Diretoria"
                  : totals.totalValue >= 10000
                  ? "De R$ 10.000 a R$ 50.000 — requer aprovação da Gerência"
                  : "Abaixo de R$ 10.000 — aprovação automática"}
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button className="flex-1 bg-app-compras hover:bg-app-compras/90 text-white" disabled={items.length === 0}>
                <Save className="h-4 w-4 mr-1" />
                Salvar OC
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Items table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Itens da OC</CardTitle>
                <CardDescription className="text-xs mt-0.5">Adicione SKUs e veja os cálculos em tempo real</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um SKU para adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {supplierSkus
                    .filter((s) => !items.some((i) => i.skuId === s.id))
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={addItem} disabled={!selectedSkuId} size="default">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Selecione um fornecedor e adicione SKUs acima</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent text-[11px]">
                      <TableHead className="w-36">SKU</TableHead>
                      <TableHead className="w-20 text-center">Qty</TableHead>
                      <TableHead className="w-24 text-right">Preço Unit.</TableHead>
                      <TableHead className="w-24 text-right">Preço Ref.</TableHead>
                      <TableHead className="w-24 text-right">PPV</TableHead>
                      <TableHead className="w-20 text-right">CTA Est.</TableHead>
                      <TableHead className="w-20 text-center">Cobertura</TableHead>
                      <TableHead className="w-20 text-right">GMROI</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const ppv = calcPPV(item);
                      const coverage = calcCoveragePostDays(item);
                      const cta = calcCTAEstimated(item);
                      const gmroi = calcGMROI(item);
                      const coverageAlert = coverage != null && coverage > item.coverageMaxDays;
                      const ppvNeg = ppv > 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <span className="text-xs font-medium text-foreground">{item.skuName}</span>
                              <span className="block text-[10px] text-muted-foreground font-mono">{item.skuCode}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-16 h-7 text-center text-xs mx-auto"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-20 h-7 text-right text-xs ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatBRL(item.referencePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {ppvNeg && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              <span className={`text-xs font-medium ${ppv > 0 ? "text-destructive" : ppv < 0 ? "text-success" : "text-muted-foreground"}`}>
                                {ppv > 0 ? "+" : ""}{formatBRL(ppv)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">{formatBRL(cta)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {coverageAlert && <AlertTriangle className="h-3 w-3 text-warning" />}
                              <span className={`text-xs font-medium ${coverageAlert ? "text-warning" : "text-foreground"}`}>
                                {coverage != null ? `${Math.round(coverage)}d` : "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`text-xs font-medium ${gmroi != null && gmroi < 1 ? "text-destructive" : "text-foreground"}`}>
                              {gmroi != null ? gmroi.toFixed(1) : "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend / Alerts */}
      {items.length > 0 && totals.alertCount > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {totals.alertCount} alerta{totals.alertCount > 1 ? "s" : ""} detectado{totals.alertCount > 1 ? "s" : ""}
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {items.some((i) => calcPPV(i) > 0) && (
                    <li>• PPV positivo: preço negociado acima da referência em alguns itens</li>
                  )}
                  {items.some((i) => {
                    const c = calcCoveragePostDays(i);
                    return c != null && c > i.coverageMaxDays;
                  }) && <li>• Cobertura excessiva: estoque pós-compra acima do máximo recomendado</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
