import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { UNITS } from "@/data/dominio/mock-data";
import type { Pendencia } from "@/data/dominio/types";

interface CreatePendenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (p: Omit<Pendencia, "id" | "created_at">) => void;
  defaults?: {
    title?: string;
    description?: string;
    related_type?: string;
    related_id?: string;
    priority?: Pendencia["priority"];
  };
}

export function CreatePendenciaModal({ open, onOpenChange, onSubmit, defaults }: CreatePendenciaModalProps) {
  const [title, setTitle] = useState(defaults?.title || "");
  const [description, setDescription] = useState(defaults?.description || "");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Pendencia["priority"]>(defaults?.priority || "medium");
  const [unitId, setUnitId] = useState("all");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [impactValue, setImpactValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!title || !responsible) {
      toast({ title: "Preencha título e responsável", variant: "destructive" });
      return;
    }
    onSubmit({
      title,
      description: `${description}${category ? ` | Cat: ${category}` : ""}${sku ? ` | SKU: ${sku}` : ""}${impactValue ? ` | Impacto: R$ ${impactValue}` : ""}${notes ? ` | Notas: ${notes}` : ""}`,
      responsible,
      due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "open",
      priority,
      related_type: defaults?.related_type,
      related_id: defaults?.related_id,
      created_by: "Usuário atual",
    });
    toast({ title: "Pendência criada", description: title });
    onOpenChange(false);
    // Reset
    setTitle(""); setDescription(""); setResponsible(""); setDueDate("");
    setPriority("medium"); setUnitId("all"); setCategory(""); setSku("");
    setImpactValue(""); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Pendência</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" placeholder="Ex: Investigar queda de margem" />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[60px]" placeholder="Detalhes..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Responsável *</Label>
              <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} className="h-8 text-sm" placeholder="Nome" />
            </div>
            <div>
              <Label className="text-xs">Prazo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Pendencia["priority"])}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Unidade</Label>
              <Select value={unitId} onValueChange={setUnitId}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Rede</SelectItem>
                  {UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Categoria</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 text-sm" placeholder="Opcional" />
            </div>
            <div>
              <Label className="text-xs">SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} className="h-8 text-sm" placeholder="Opcional" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Impacto (R$)</Label>
            <Input value={impactValue} onChange={(e) => setImpactValue(e.target.value)} className="h-8 text-sm" placeholder="Ex: 15000" type="number" />
          </div>
          <div>
            <Label className="text-xs">Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-sm min-h-[40px]" placeholder="Observações adicionais..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
