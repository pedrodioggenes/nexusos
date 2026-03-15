import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Plus,
  ArrowLeft,
  Save,
  Play,
  Trash2,
  GripVertical,
  Calendar,
  BarChart3,
  Target,
  Store,
  Inbox,
  Bell,
  FlaskConical,
  Wallet,
  FileText,
  Clock,
} from "lucide-react";
import {
  useReportDefinitions,
  useCreateReportDefinition,
  useDeleteReportDefinition,
  useCreateReportRun,
  AVAILABLE_BLOCKS,
  type ReportBlock,
  type ReportFilters,
  type ReportDefinition,
} from "@/hooks/useReportBuilder";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  budget_summary: Wallet,
  campaign_performance: BarChart3,
  kpi_cards: Target,
  store_ranking: Store,
  demand_status: Inbox,
  alert_summary: Bell,
  experiment_results: FlaskConical,
};

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { data: definitions = [], isLoading } = useReportDefinitions();
  const createDef = useCreateReportDefinition();
  const deleteDef = useDeleteReportDefinition();
  const createRun = useCreateReportRun();

  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingDef, setEditingDef] = useState<ReportDefinition | null>(null);

  // Builder state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<ReportBlock[]>(AVAILABLE_BLOCKS.map((b) => ({ ...b })));
  const [filters, setFilters] = useState<ReportFilters>({});

  const startNew = () => {
    setEditingDef(null);
    setName("");
    setDescription("");
    setBlocks(AVAILABLE_BLOCKS.map((b) => ({ ...b })));
    setFilters({});
    setMode("edit");
  };

  const openEdit = (def: ReportDefinition) => {
    setEditingDef(def);
    setName(def.name);
    setDescription(def.description || "");
    // Merge saved blocks with available blocks
    const merged = AVAILABLE_BLOCKS.map((ab) => {
      const saved = def.blocks.find((b: any) => b.type === ab.type);
      return saved ? { ...ab, enabled: saved.enabled } : { ...ab, enabled: false };
    });
    setBlocks(merged);
    setFilters(def.filters || {});
    setMode("edit");
  };

  const toggleBlock = (idx: number) => {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, enabled: !b.enabled } : b)));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      await createDef.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        blocks,
        filters,
      });
      toast.success("Relatório salvo!");
      setMode("list");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerate = async (defId: string) => {
    try {
      const enabledBlocks = blocks.filter((b) => b.enabled).map((b) => b.type);
      await createRun.mutateAsync({
        definition_id: defId,
        output_meta: {
          blocks_generated: enabledBlocks,
          filters,
          generated_at: new Date().toISOString(),
        },
      });
      toast.success("Relatório gerado com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDef.mutateAsync(id);
      toast.success("Relatório removido");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const enabledCount = blocks.filter((b) => b.enabled).length;

  if (mode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMode("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {editingDef ? "Editar Relatório" : "Novo Relatório"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Monte seu relatório escolhendo blocos e filtros
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* Main */}
          <div className="space-y-5">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div>
                  <Label>Nome do Relatório *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Relatório Executivo Semanal"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve descrição do objetivo..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Blocks */}
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Blocos do Relatório
                </h3>
                <div className="space-y-2">
                  {blocks.map((block, idx) => {
                    const Icon = blockIcons[block.type] || FileText;
                    return (
                      <div
                        key={block.type}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm font-medium">{block.label}</span>
                        <Switch
                          checked={block.enabled}
                          onCheckedChange={() => toggleBlock(idx)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Filters */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Filtros
                </h3>
                <div>
                  <Label className="text-xs">Período Início</Label>
                  <Input
                    type="date"
                    value={filters.period_start || ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, period_start: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Período Fim</Label>
                  <Input
                    type="date"
                    value={filters.period_end || ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, period_end: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold text-sm mb-2">Resumo</h3>
                <p className="text-sm text-muted-foreground">
                  {enabledCount} bloco{enabledCount !== 1 ? "s" : ""} selecionado
                  {enabledCount !== 1 ? "s" : ""}
                </p>
                <Separator className="my-3" />
                <Button
                  className="w-full bg-module-gestao hover:bg-module-gestao/90"
                  onClick={handleSave}
                  disabled={createDef.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createDef.isPending ? "Salvando..." : "Salvar Relatório"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/marketing/relatorios")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-module-gestao" />
              Report Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monte, versione e exporte relatórios personalizados
            </p>
          </div>
        </div>
        <Button onClick={startNew} className="bg-module-gestao hover:bg-module-gestao/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : definitions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutDashboard className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">Nenhum relatório personalizado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Crie seu primeiro relatório escolhendo blocos e filtros para gerar dados consistentes e repetíveis.
            </p>
            <Button className="mt-4 bg-module-gestao hover:bg-module-gestao/90" onClick={startNew}>
              <Plus className="h-4 w-4 mr-2" /> Criar Relatório
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {definitions.map((def) => (
            <Card
              key={def.id}
              className="cursor-pointer hover:border-module-gestao/40 transition-colors"
              onClick={() => openEdit(def)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="p-2 rounded-lg bg-module-gestao/10">
                  <FileText className="h-5 w-5 text-module-gestao" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{def.name}</h3>
                  {def.description && (
                    <p className="text-sm text-muted-foreground truncate">{def.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      {(def.blocks as any[]).filter((b: any) => b.enabled).length} blocos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(def.updated_at), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerate(def.id);
                    }}
                    disabled={createRun.isPending}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Gerar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(def.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
