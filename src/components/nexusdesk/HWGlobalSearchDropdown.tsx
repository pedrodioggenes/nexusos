import { useState, useRef, useEffect } from "react";
import { Search, User, FileText, MessageSquare, Megaphone, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useHWGlobalSearch, type GlobalSearchResult } from "@/hooks/useHWGlobalSearch";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof User }> = {
  pessoa: { label: "Pessoas", icon: User },
  post: { label: "Comunicados", icon: Megaphone },
  document: { label: "Documentos", icon: FileText },
  message: { label: "Mensagens", icon: MessageSquare },
};

interface Props {
  onNavigate?: (entityType: string, entityId: string) => void;
}

export function HWGlobalSearchDropdown({ onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { grouped, isLoading } = useHWGlobalSearch(query);
  const hasResults = Object.keys(grouped).length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#52525B' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Buscar..."
          className="h-8 w-40 lg:w-56 rounded-lg pl-8 pr-7 text-xs border-0 outline-none focus:ring-1"
          style={{
            backgroundColor: '#27272A',
            color: '#FAFAFA',
            '--tw-ring-color': '#3F3F46',
          } as React.CSSProperties}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: '#52525B' }}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div
          className="absolute top-full mt-1 right-0 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl z-50"
          style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
        >
          {isLoading && (
            <p className="p-4 text-xs text-center" style={{ color: '#71717A' }}>Buscando...</p>
          )}

          {!isLoading && !hasResults && (
            <p className="p-4 text-xs text-center" style={{ color: '#71717A' }}>Nenhum resultado encontrado</p>
          )}

          {!isLoading && hasResults && Object.entries(grouped).map(([type, items]) => {
            const cfg = TYPE_CONFIG[type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div key={type}>
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>
                  {cfg.label}
                </p>
                {items.map((item) => (
                  <button
                    key={item.entity_id}
                    onClick={() => {
                      onNavigate?.(item.entity_type, item.entity_id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#71717A' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" style={{ color: '#FAFAFA' }}>
                        {item.title}
                      </p>
                      {item.preview && (
                        <p className="text-[11px] truncate mt-0.5" style={{ color: '#52525B' }}>
                          {item.preview}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
