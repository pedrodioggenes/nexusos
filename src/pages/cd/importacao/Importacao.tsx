import { useState, useCallback, createElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2, AlertTriangle, Database, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ImportacaoPage() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; messages: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".csv")) setFile(f);
    else toast.error("Selecione um arquivo CSV válido");
  };

  const handleSeedDemo = useCallback(async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-cd");
      if (error) throw error;
      if (data?.success) {
        // Invalidate ALL cd-related queries to refresh the entire dashboard
        queryClient.invalidateQueries({ predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("cd-");
        }});
        toast.success("Dados de demonstração carregados com sucesso!", {
          description: `${data.summary.skus} SKUs, ${data.summary.locations} locações, ${data.summary.stock_lots} lotes, ${data.summary.consumption_history} registros de consumo`,
        });
      } else {
        throw new Error(data?.error || "Erro desconhecido");
      }
    } catch (e: any) {
      toast.error("Erro ao carregar dados demo: " + e.message);
    } finally {
      setSeeding(false);
    }
  }, []);

  const parseCSV = useCallback(async () => {
    if (!file || !tenant?.id) return;
    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { toast.error("Arquivo vazio ou sem dados"); setImporting(false); return; }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredCols = ["sku_code", "store_code", "consumption_date", "qty_sold"];
      const missing = requiredCols.filter((c) => !headers.includes(c));
      if (missing.length > 0) {
        toast.error(`Colunas obrigatórias ausentes: ${missing.join(", ")}`);
        setImporting(false);
        return;
      }

      const { data: skus } = await supabase.from("cd_skus").select("id, sku_code").eq("tenant_id", tenant.id);
      const { data: stores } = await supabase.from("cd_stores").select("id, code").eq("tenant_id", tenant.id);
      const skuMap = new Map((skus || []).map((s: any) => [s.sku_code, s.id]));
      const storeMap = new Map((stores || []).map((s: any) => [s.code, s.id]));

      let success = 0;
      let errors = 0;
      const messages: string[] = [];
      const batch: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

        const skuId = skuMap.get(row.sku_code);
        const storeId = storeMap.get(row.store_code);

        if (!skuId) { errors++; messages.push(`Linha ${i + 1}: SKU "${row.sku_code}" não encontrado`); continue; }
        if (!storeId) { errors++; messages.push(`Linha ${i + 1}: Loja "${row.store_code}" não encontrada`); continue; }

        batch.push({
          tenant_id: tenant.id,
          sku_id: skuId,
          store_id: storeId,
          consumption_date: row.consumption_date,
          qty_sold: parseInt(row.qty_sold) || 0,
          qty_transferred: parseInt(row.qty_transferred || "0") || 0,
          had_rupture: row.had_rupture === "true" || row.had_rupture === "1",
        });

        if (batch.length >= 100) {
          const { error } = await supabase.from("cd_consumption_history").insert(batch);
          if (error) { errors += batch.length; messages.push(`Erro no lote: ${error.message}`); }
          else success += batch.length;
          batch.length = 0;
        }
      }

      if (batch.length > 0) {
        const { error } = await supabase.from("cd_consumption_history").insert(batch);
        if (error) { errors += batch.length; messages.push(`Erro no lote: ${error.message}`); }
        else success += batch.length;
      }

      setResult({ success, errors, messages: messages.slice(0, 20) });
      if (success > 0) {
        queryClient.invalidateQueries({ predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("cd-");
        }});
        toast.success(`${success} registros importados com sucesso`);
      }
      if (errors > 0) toast.warning(`${errors} erros encontrados`);
    } catch (e: any) {
      toast.error("Erro ao processar: " + e.message);
    } finally {
      setImporting(false);
    }
  }, [file, tenant?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Importar Dados</h1>
        <p className="text-muted-foreground text-sm">Upload de consumo histórico via CSV ou carregamento de dados demo</p>
      </div>

      {/* Demo Data Card */}
      <Card className="border-module-cd/30 bg-module-cd/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-module-cd" /> Dados de Demonstração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Carregue uma base completa de dados demo calibrada para operação de rede varejista (~R$12.4M/mês).
            Inclui 40+ SKUs, 7 lojas, 200+ lotes, histórico de consumo, ordens de transferência, alertas e KPIs.
          </p>
          <p className="text-xs text-destructive font-medium">
            ⚠️ Esta ação substituirá todos os dados existentes do CD para o tenant atual.
          </p>
          <Button onClick={handleSeedDemo} disabled={seeding} variant="outline" className="border-module-cd/50 hover:bg-module-cd/10">
            {seeding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando...</> : <><Database className="h-4 w-4 mr-2" /> Carregar Dados Demo</>}
          </Button>
        </CardContent>
      </Card>

      {/* CSV Format Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formato Esperado (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">O arquivo deve conter as seguintes colunas obrigatórias:</p>
          <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
            sku_code, store_code, consumption_date, qty_sold, qty_transferred, had_rupture
          </div>
          <p className="text-xs text-muted-foreground">
            • <strong>sku_code</strong>: código do SKU cadastrado<br />
            • <strong>store_code</strong>: código da loja cadastrada<br />
            • <strong>consumption_date</strong>: data no formato YYYY-MM-DD<br />
            • <strong>qty_sold</strong>: quantidade vendida (obrigatório)<br />
            • <strong>qty_transferred</strong>: quantidade transferida (opcional, default 0)<br />
            • <strong>had_rupture</strong>: true/false ou 1/0 (opcional, default false)
          </p>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
            <Button onClick={parseCSV} disabled={!file || importing}>
              {importing ? "Importando..." : "Importar"}
            </Button>
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado da Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm"><strong>{result.success}</strong> importados</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-sm"><strong>{result.errors}</strong> erros</span>
              </div>
            </div>
            {result.messages.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg max-h-[200px] overflow-y-auto">
                {result.messages.map((m, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{m}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
