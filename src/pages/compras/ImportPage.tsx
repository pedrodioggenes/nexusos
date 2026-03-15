import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleSeedDemo = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("seed-compras");
      if (error) throw error;
      if (data?.success) {
        setResult(data);
        // Invalidate all compras queries so pages reflect new data
        await queryClient.invalidateQueries({ queryKey: ["compras-suppliers"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-supplier-scores"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-purchase-orders"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-alerts"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-kpi-snapshots"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-trade-allowances"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-divergences"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-price-history"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-skus"] });
        await queryClient.invalidateQueries({ queryKey: ["compras-po-items"] });
        toast.success("Dados demo carregados com sucesso!");
      } else {
        throw new Error(data?.error || "Erro desconhecido");
      }
    } catch (err: any) {
      toast.error(`Erro ao carregar dados: ${err.message}`);
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Download className="h-6 w-6 text-app-compras" />Importar Dados
        </h1>
        <p className="text-sm text-muted-foreground">Carregue dados de demonstração ou importe via CSV</p>
      </div>

      {/* Demo Data Loader */}
      <Card className="border-app-compras/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-app-compras" />Carregar Dados de Demonstração
          </CardTitle>
          <CardDescription>
            Popula o Compras com dados calibrados para rede varejista demo: 11 fornecedores, ~53 SKUs,
            30 OCs, histórico de preços, verbas comerciais, divergências, negociações e 60 dias de KPIs.
            Os dados são otimizados para demonstrar semáforos em estado "amarelo".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSeedDemo}
            disabled={loading}
            className="bg-app-compras hover:bg-app-compras/90 text-white"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Carregando dados...</>
            ) : (
              <><Database className="h-4 w-4 mr-2" />Carregar Dados Demo</>
            )}
          </Button>

          {result?.success && (
            <div className="rounded-lg bg-success/5 border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Dados carregados com sucesso!</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                {Object.entries(result.counts || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between bg-background rounded px-2 py-1">
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="font-medium text-foreground">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && !result.success && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{result.error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Import placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importação via CSV</CardTitle>
          <CardDescription>
            Importe fornecedores, SKUs, preços e ordens de compra via arquivo CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl text-center">
            <Download className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Em breve — importação via CSV estará disponível.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
