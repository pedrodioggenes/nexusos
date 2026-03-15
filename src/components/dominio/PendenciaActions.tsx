import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Link2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Pendencia } from "@/data/dominio/types";

interface PendenciaActionsProps {
  onCreatePendencia: (p: Omit<Pendencia, "id" | "created_at">) => void;
  relatedType?: string;
  relatedId?: string;
  compact?: boolean;
}

export function PendenciaActions({ onCreatePendencia, relatedType, relatedId, compact = false }: PendenciaActionsProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Pendencia["priority"]>("medium");

  const handleCreate = () => {
    if (!title || !responsible) {
      toast({ title: "Preencha título e responsável", variant: "destructive" });
      return;
    }
    onCreatePendencia({
      title,
      description,
      responsible,
      due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "open",
      priority,
      related_type: relatedType,
      related_id: relatedId,
      created_by: "Usuário atual",
    });
    toast({ title: "Pendência criada", description: title });
    setOpen(false);
    setTitle(""); setDescription(""); setResponsible(""); setDueDate(""); setPriority("medium");
  };

  if (compact) {
    return (
      <>
        <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setOpen(true)}>
          <Plus className="h-3 w-3 mr-1" /> Pendência
        </Button>
        <CreateDialog />
      </>
    );
  }

  function CreateDialog() {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Pendência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" placeholder="Ex: Investigar queda de vendas" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 text-sm" placeholder="Detalhes..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Responsável</Label>
                <Input value={responsible} onChange={e => setResponsible(e.target.value)} className="h-8 text-sm" placeholder="Nome" />
              </div>
              <div>
                <Label className="text-xs">Prazo</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Pendencia["priority"])}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Criar pendência
      </Button>
      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Vincular pendência", description: "Selecione uma pendência existente (placeholder)" })}>
        <Link2 className="h-3 w-3 mr-1" /> Vincular
      </Button>
      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Marcar resolvido (placeholder)" })}>
        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolvido
      </Button>
      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Adiar (placeholder)" })}>
        <Clock className="h-3 w-3 mr-1" /> Adiar
      </Button>
      <CreateDialog />
    </div>
  );
}
