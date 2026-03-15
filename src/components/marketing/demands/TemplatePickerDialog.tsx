/**
 * Template picker dialog — shown before creating a new demand.
 * Lets user pick a template or start from scratch.
 */
import { useState } from "react";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDemandTemplates, useCreateDemandTemplate, useDeleteDemandTemplate, type DemandTemplate } from "@/hooks/useDemandTemplates";
import { demandTypeConfig, demandPriorityConfig, type DemandType, type DemandPriority } from "@/hooks/useMarketingDemands";
import { useUserDepartmentRole, isGestor } from "@/hooks/useUserDepartmentRole";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: DemandTemplate) => void;
  onStartBlank: () => void;
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  onStartBlank,
}: TemplatePickerDialogProps) {
  const { data: templates, isLoading } = useDemandTemplates();
  const createTemplate = useCreateDemandTemplate();
  const deleteTemplate = useDeleteDemandTemplate();
  const { data: role } = useUserDepartmentRole();
  const canManage = isGestor(role);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<DemandType>("general");
  const [newPriority, setNewPriority] = useState<DemandPriority>("medium");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createTemplate.mutateAsync({
      name: newName.trim(),
      default_type: newType,
      default_priority: newPriority,
    });
    setNewName("");
    setShowCreate(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-app-gestao" />
            Nova Demanda
          </DialogTitle>
          <DialogDescription>
            Escolha um template ou comece do zero.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Start blank */}
          <button
            onClick={() => {
              onOpenChange(false);
              onStartBlank();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-app-gestao/50 hover:bg-app-gestao/5 transition-all text-left"
          >
            <div className="p-2 rounded-md bg-muted">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Começar do zero</p>
              <p className="text-xs text-muted-foreground">Formulário em branco</p>
            </div>
          </button>

          {/* Templates list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                Templates
              </p>
              {templates.map((t) => {
                const typeConfig = demandTypeConfig[t.default_type as DemandType];
                const priorityConfig = demandPriorityConfig[t.default_priority as DemandPriority];
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-all group"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => {
                        onOpenChange(false);
                        onSelectTemplate(t);
                      }}
                    >
                      <p className="text-sm font-medium">{t.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {typeConfig && (
                          <Badge variant="outline" className="text-[9px]">
                            {typeConfig.icon} {typeConfig.label}
                          </Badge>
                        )}
                        {priorityConfig && (
                          <Badge variant="outline" className={cn("text-[9px]", priorityConfig.color)}>
                            {priorityConfig.label}
                          </Badge>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                    </button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={() => deleteTemplate.mutate(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-3">
              Nenhum template criado ainda.
            </p>
          )}

          {/* Create template (managers only) */}
          {canManage && (
            <>
              <Separator />
              {showCreate ? (
                <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
                  <Label className="text-xs">Novo Template</Label>
                  <Input
                    placeholder="Nome do template"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newType} onValueChange={(v) => setNewType(v as DemandType)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(demandTypeConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            {v.icon} {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newPriority} onValueChange={(v) => setNewPriority(v as DemandPriority)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(demandPriorityConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs flex-1" onClick={handleCreate} disabled={createTemplate.isPending}>
                      {createTemplate.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowCreate(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="h-3 w-3" />
                  Criar Template
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
