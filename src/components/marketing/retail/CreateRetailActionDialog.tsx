import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRetailActions, RETAIL_ACTION_TYPES, CHANNEL_OPTIONS } from "@/hooks/useRetailActions";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRetailActionDialog({ open, onOpenChange }: Props) {
  const { createAction } = useRetailActions();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("encarte");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [mechanics, setMechanics] = useState("");
  const [notes, setNotes] = useState("");
  const [channels, setChannels] = useState<string[]>([]);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createAction.mutateAsync({
      title: title.trim(),
      type,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      mechanics: mechanics || undefined,
      channels,
      notes: notes || undefined,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle(""); setType("encarte"); setPeriodStart(""); setPeriodEnd("");
    setMechanics(""); setNotes(""); setChannels([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Ação Comercial</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Semana do Açougue" className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RETAIL_ACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Mecânica</Label>
              <Input value={mechanics} onChange={e => setMechanics(e.target.value)} placeholder="Leve 3 pague 2" className="h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Início</Label>
              <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Fim</Label>
              <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Canais</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CHANNEL_OPTIONS.map(ch => (
                <Badge
                  key={ch}
                  variant={channels.includes(ch) ? "default" : "outline"}
                  className={cn("cursor-pointer text-[10px] px-2 py-0.5 transition-colors", channels.includes(ch) && "bg-primary")}
                  onClick={() => toggleChannel(ch)}
                >
                  {ch.replace('_', ' ')}
                  {channels.includes(ch) && <X className="h-2.5 w-2.5 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || createAction.isPending}>
              {createAction.isPending ? "Criando..." : "Criar Ação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
