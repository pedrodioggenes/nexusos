/**
 * Dialog to create a production package (batch of demands).
 */
import { useState } from "react";
import { Package, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProductionPackage } from "@/hooks/useProductionPackages";

interface ProductionPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
}

export function ProductionPackageDialog({
  open,
  onOpenChange,
  campaignId,
}: ProductionPackageDialogProps) {
  const [name, setName] = useState("");
  const createPackage = useCreateProductionPackage();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createPackage.mutateAsync({
      name: name.trim(),
      campaignId,
    });
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-app-gestao" />
            Novo Pacote de Produção
          </DialogTitle>
          <DialogDescription>
            Cria automaticamente 5 demandas padrão (briefing, design, copy, vídeo, social) com prazos relativos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Nome do Pacote</Label>
            <Input
              placeholder="Ex: Campanha Verão 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Demandas que serão criadas:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>📋 Briefing e Referências <span className="text-[10px]">(+1 dia)</span></li>
              <li>🎨 Criação de Arte / Design <span className="text-[10px]">(+3 dias)</span></li>
              <li>✍️ Redação / Copywriting <span className="text-[10px]">(+3 dias)</span></li>
              <li>🎬 Produção de Vídeo <span className="text-[10px]">(+5 dias)</span></li>
              <li>📱 Publicação Social Media <span className="text-[10px]">(+7 dias)</span></li>
            </ul>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createPackage.isPending}
            className="w-full"
          >
            {createPackage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Pacote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
