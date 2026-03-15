import { useState } from "react";
import { Bookmark, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSavedViews, type SavedView } from "@/hooks/useSavedViews";
import type { DemandSortOption } from "@/hooks/useServerDemands";
import type { StatusQuickFilter } from "@/hooks/useDemandUrlState";

interface SavedViewsDropdownProps {
  currentFilters: SavedView["filters"];
  onApply: (filters: SavedView["filters"]) => void;
}

export function SavedViewsDropdown({ currentFilters, onApply }: SavedViewsDropdownProps) {
  const { views, addView, removeView } = useSavedViews();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");

  const handleSave = () => {
    if (!viewName.trim()) return;
    addView(viewName.trim(), currentFilters);
    toast.success(`Visão "${viewName}" salva!`);
    setViewName("");
    setSaveDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Visões</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs">Visões salvas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {views.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              Nenhuma visão salva
            </div>
          ) : (
            views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                className="flex items-center justify-between group"
                onClick={() => onApply(view.filters)}
              >
                <span className="truncate">{view.name}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeView(view.id);
                    toast.success("Visão removida");
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Salvar visão atual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Salvar Visão</DialogTitle>
            <DialogDescription>
              Dê um nome para salvar os filtros atuais.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Ex: Urgentes em revisão"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!viewName.trim()}>
              <Check className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
