import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Loader2, CheckCircle2, XCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocations, useCreateLocation, useToggleLocationActive } from "@/hooks/cd/useStorageData";

const zoneColors: Record<string, string> = {
  "Seco": "bg-amber-500/15 text-amber-600 border-amber-500/20",
  "Frio": "bg-blue-500/15 text-blue-600 border-blue-500/20",
  "Congelado": "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
  "FLV": "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  "Químico": "bg-red-500/15 text-red-600 border-red-500/20",
  "Cross-Dock": "bg-violet-500/15 text-violet-600 border-violet-500/20",
};

const typeLabels: Record<string, string> = {
  shelf: "Prateleira",
  pallet: "Pallet",
  floor: "Piso",
  cross_dock: "Cross-Dock",
  cold_room: "Câmara Fria",
  staging: "Staging",
};

export default function MapaArmazem() {
  const { data: locations = [], isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const toggleActive = useToggleLocationActive();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");

  // Form state
  const [form, setForm] = useState({
    code: "", zone: "Seco", location_type: "shelf",
    aisle: "", module: "", level: "", position: "",
  });

  const zones = useMemo(() => {
    const z = new Set(locations.map((l: any) => l.zone));
    return Array.from(z).sort();
  }, [locations]);

  const filtered = useMemo(() => {
    return locations.filter((l: any) => {
      const matchSearch = !search || l.code.toLowerCase().includes(search.toLowerCase()) || l.zone.toLowerCase().includes(search.toLowerCase());
      const matchZone = zoneFilter === "all" || l.zone === zoneFilter;
      return matchSearch && matchZone;
    });
  }, [locations, search, zoneFilter]);

  // Stats per zone
  const zoneStats = useMemo(() => {
    const stats: Record<string, { total: number; occupied: number; inactive: number }> = {};
    locations.forEach((l: any) => {
      if (!stats[l.zone]) stats[l.zone] = { total: 0, occupied: 0, inactive: 0 };
      stats[l.zone].total++;
      if (l.is_occupied) stats[l.zone].occupied++;
      if (!l.is_active) stats[l.zone].inactive++;
    });
    return stats;
  }, [locations]);

  const handleCreate = () => {
    if (!form.code || !form.zone) return;
    createLocation.mutate(form, {
      onSuccess: () => {
        setCreateOpen(false);
        setForm({ code: "", zone: "Seco", location_type: "shelf", aisle: "", module: "", level: "", position: "" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa do Armazém"
        description="Visualização de zonas, endereços e ocupação"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Endereço</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Endereço</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Código *</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A-01-03-02" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Zona *</Label>
                  <Select value={form.zone} onValueChange={(v) => setForm({ ...form, zone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Seco", "Frio", "Congelado", "FLV", "Químico", "Cross-Dock"].map((z) => (
                        <SelectItem key={z} value={z}>{z}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.location_type} onValueChange={(v) => setForm({ ...form, location_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Corredor</Label>
                  <Input value={form.aisle} onChange={(e) => setForm({ ...form, aisle: e.target.value })} placeholder="A" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Módulo</Label>
                  <Input value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} placeholder="01" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nível</Label>
                  <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="03" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createLocation.isPending || !form.code}>
                  {createLocation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Criar Endereço
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Zone Overview Cards */}
      {Object.keys(zoneStats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(zoneStats).map(([zone, s]) => {
            const pct = s.total > 0 ? Math.round((s.occupied / s.total) * 100) : 0;
            const color = zoneColors[zone] || "bg-muted text-muted-foreground border-border";
            return (
              <button
                key={zone}
                onClick={() => setZoneFilter(zoneFilter === zone ? "all" : zone)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all hover:scale-[1.02]",
                  zoneFilter === zone ? "ring-2 ring-primary" : "",
                  color
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">{zone}</p>
                <p className="text-xl font-bold mt-1">{s.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 flex-1 rounded-full bg-background/30">
                    <div
                      className="h-1.5 rounded-full bg-current opacity-60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar código ou zona..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhum endereço cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
          {filtered.map((loc: any) => {
            const zc = zoneColors[loc.zone] || "bg-muted text-muted-foreground border-border";
            return (
              <button
                key={loc.id}
                onClick={() => toggleActive.mutate({ id: loc.id, is_active: !loc.is_active })}
                className={cn(
                  "relative rounded-lg border p-2 text-center text-[11px] font-mono transition-all hover:scale-105",
                  !loc.is_active && "opacity-30 line-through",
                  loc.is_occupied ? zc : "bg-card border-border text-muted-foreground"
                )}
                title={`${loc.code} · ${loc.zone} · ${typeLabels[loc.location_type] || loc.location_type}${!loc.is_active ? " (Inativo)" : ""}`}
              >
                <span className="block truncate">{loc.code}</span>
                {loc.is_occupied && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-current opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {filtered.length} endereço(s) · Clique para ativar/desativar
      </p>
    </div>
  );
}
