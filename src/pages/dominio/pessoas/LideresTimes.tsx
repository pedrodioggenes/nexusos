import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { LIDERES_TIMES } from "@/data/dominio/pessoas-mock";
import { UNITS } from "@/data/dominio/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users } from "lucide-react";

export default function PessoasLideresTimes() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [unitFilter, setUnitFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});

  const data = useMemo(() => {
    let items = [...LIDERES_TIMES];
    if (unitFilter !== "all") items = items.filter((l) => l.unit_id === unitFilter);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((l) => l.lider.toLowerCase().includes(s) || l.setor.toLowerCase().includes(s) || l.unit_name.toLowerCase().includes(s));
    }
    return items;
  }, [unitFilter, filters.search]);

  const totalLideres = new Set(LIDERES_TIMES.map((l) => l.lider)).size;
  const totalPessoas = LIDERES_TIMES.reduce((s, l) => s + l.tamanho_time, 0);

  const openPendencia = (lider: string, unidade: string, setor: string) => {
    setCreateDefaults({
      title: `Ação com líder: ${lider}`,
      description: `Pendência para ${lider}, ${setor} da unidade ${unidade}.`,
    });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Líderes & Times</h1>
        <p className="text-muted-foreground">Quem lidera cada setor em cada unidade da rede</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <div className="flex gap-3 items-center">
        <span className="text-xs text-muted-foreground">Unidade:</span>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {UNITS.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-3 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{totalLideres}</strong> líderes</span>
          <span><strong className="text-foreground">{totalPessoas}</strong> pessoas em times</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Líder</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-center">Tamanho do Time</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-semibold">{l.unit_name}</TableCell>
              <TableCell>{l.setor}</TableCell>
              <TableCell className="font-medium">{l.lider}</TableCell>
              <TableCell className="text-muted-foreground">{l.cargo}</TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" /> {l.tamanho_time}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openPendencia(l.lider, l.unit_name, l.setor)}>
                  <Plus className="h-3 w-3 mr-1" /> Pendência
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreatePendenciaModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={(p) => { addPendencia(p); setCreateOpen(false); }} defaults={createDefaults} />
    </div>
  );
}
