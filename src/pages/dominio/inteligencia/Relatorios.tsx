import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { ReportsLibrary } from "@/components/dominio/ReportsLibrary";
import { useGlobalFilters } from "@/hooks/useDominioData";

export default function InteligenciaRelatorios() {
  const { filters, updateFilter } = useGlobalFilters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Relatórios prontos da rede — gere a visualização e exporte quando precisar</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <ReportsLibrary />
    </div>
  );
}
