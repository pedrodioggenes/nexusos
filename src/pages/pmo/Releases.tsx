import { useState } from "react";
import { Rocket, Plus, Package } from "lucide-react";
import { ReportButton } from "@/components/pmo/ReportGeneratorDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOReleases, useCreateRelease, useCreateReleaseItem } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Release = Record<string, any>;

const statusColors: Record<string, string> = { draft: "bg-amber-500/20 text-amber-700", published: "bg-emerald-500/20 text-emerald-700", closed: "bg-app-pmo/20 text-app-pmo" };

const PMOReleases = () => {
  const { data: releases = [] } = usePMOReleases();
  const createRelease = useCreateRelease();
  const createItem = useCreateReleaseItem();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewRelease, setViewRelease] = useState<Release | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [form, setForm] = useState({ version: "", release_date: "", summary: "" });
  const [itemForm, setItemForm] = useState({ description: "", modules_impacted: "" });

  const handleCreate = async () => {
    if (!form.version) return;
    await createRelease.mutateAsync({ ...form, status: "draft" });
    setCreateOpen(false);
    setForm({ version: "", release_date: "", summary: "" });
  };

  const handleAddItem = async () => {
    if (!viewRelease || !itemForm.description) return;
    const modules = itemForm.modules_impacted ? itemForm.modules_impacted.split(",").map(s => s.trim()) : [];
    await createItem.mutateAsync({ release_id: viewRelease.id, description: itemForm.description, modules_impacted: modules });
    setAddItemOpen(false);
    setItemForm({ description: "", modules_impacted: "" });
  };

  const grouped = releases.reduce<Record<string, Release[]>>((acc, r) => {
    const month = r.release_date ? r.release_date.slice(0, 7) : "Sem data";
    if (!acc[month]) acc[month] = [];
    acc[month].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Releases</h1>
            <p className="text-sm text-muted-foreground">Versões em produção e itens entregues</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ReportButton reportType="releases" label="Relatório" />
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nova Release
          </Button>
        </div>
      </div>

      {releases.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhuma release registrada. Documente as entregas em produção.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([month, rels]) => (
          <div key={month} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{month}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rels.map(r => (
                <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setViewRelease(r)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-app-pmo" />
                        <p className="text-sm font-semibold text-foreground">{r.version}</p>
                      </div>
                      <Badge className={cn("text-[10px]", statusColors[r.status || "draft"])}>{r.status === "published" ? "Publicada" : r.status === "closed" ? "Fechada" : "Rascunho"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.release_date || "Sem data"}</p>
                    {r.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.summary}</p>}
                    <p className="text-xs text-app-pmo mt-1">{(r.pmo_release_items || []).length} item(ns)</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Release</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Versão *</Label><Input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} placeholder="v1.0.0" /></div>
            <div><Label>Data</Label><Input type="date" value={form.release_date} onChange={e => setForm(p => ({ ...p, release_date: e.target.value }))} /></div>
            <div><Label>Resumo</Label><Textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={3} /></div>
            <Button onClick={handleCreate} disabled={!form.version || createRelease.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Criar Release</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewRelease} onOpenChange={() => setViewRelease(null)}>
        <SheetContent className="overflow-y-auto">
          {viewRelease && (
            <>
              <SheetHeader>
                <SheetTitle>{viewRelease.version}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <p className="text-xs text-muted-foreground">{viewRelease.release_date || "Sem data"}</p>
                {viewRelease.summary && <p className="text-sm text-foreground">{viewRelease.summary}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Itens Entregues</p>
                  <Button size="sm" variant="outline" onClick={() => setAddItemOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Item</Button>
                </div>
                {(viewRelease.pmo_release_items || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
                ) : (
                  <div className="space-y-2">
                    {(viewRelease.pmo_release_items || []).map((item: any) => (
                      <div key={item.id} className="p-3 rounded-lg border border-border bg-muted/20">
                        <p className="text-sm text-foreground">{item.description}</p>
                        {item.modules_impacted?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {item.modules_impacted.map((m: string) => <Badge key={m} variant="outline" className="text-[9px]">{m}</Badge>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Item à Release</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição *</Label><Textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div><Label>Aplicativos Impactados (separar por vírgula)</Label><Input value={itemForm.modules_impacted} onChange={e => setItemForm(p => ({ ...p, modules_impacted: e.target.value }))} placeholder="Trade, RH" /></div>
            <Button onClick={handleAddItem} disabled={!itemForm.description || createItem.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOReleases;