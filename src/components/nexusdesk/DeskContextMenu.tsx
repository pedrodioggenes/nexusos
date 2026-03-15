import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Trash2, ArrowUpToLine, LayoutGrid, RefreshCw, Lock, Unlock,
  MessageSquare, Clock, GraduationCap, Cake, TrendingUp, Zap,
} from "lucide-react";

/* ── Widget catalog for adding ────────────────────────────── */
interface WidgetOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ALL_WIDGETS: WidgetOption[] = [
  { id: 'kpis', label: 'Indicadores (KPIs)', description: 'Painel de indicadores do departamento', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'shortcuts', label: 'Atalhos', description: 'Acesso rápido a views e ações', icon: <Zap className="h-4 w-4" /> },
  { id: 'messages', label: 'Mensagens', description: 'Mensagens não lidas', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'shift', label: 'Meu Turno', description: 'Status do turno de trabalho', icon: <Clock className="h-4 w-4" /> },
  { id: 'trainings', label: 'Treinamentos', description: 'Treinamentos pendentes e vencidos', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'birthdays', label: 'Aniversários', description: 'Aniversários da equipe', icon: <Cake className="h-4 w-4" /> },
];

/* ── Add Widget Dialog ────────────────────────────────────── */
function AddWidgetDialog({ open, onOpenChange, currentWidgets, onAdd }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentWidgets: string[];
  onAdd: (widgetId: string) => void;
}) {
  const available = ALL_WIDGETS.filter(w => !currentWidgets.includes(w.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            <Plus className="inline h-4 w-4 mr-2" style={{ color: '#EA580C' }} />
            Adicionar Widget
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-64 mt-2">
          {available.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#52525B' }}>
              Todos os widgets já estão na mesa
            </p>
          ) : (
            <div className="space-y-1">
              {available.map(w => (
                <button
                  key={w.id}
                  onClick={() => { onAdd(w.id); onOpenChange(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-zinc-800"
                >
                  <span style={{ color: '#71717A' }}>{w.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: '#D4D4D8' }}>{w.label}</p>
                    <p className="text-[10px]" style={{ color: '#52525B' }}>{w.description}</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 shrink-0" style={{ color: '#52525B' }} />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ── Props ────────────────────────────────────────────────── */
interface DeskContextMenuProps {
  children: React.ReactNode;
  /** The widget id if right-clicking on a specific widget, null for background */
  targetWidgetId?: string | null;
  currentWidgets: string[];
  isLocked: boolean;
  onAddWidget: (widgetId: string) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveToTop?: (widgetId: string) => void;
  onAutoOrganize: () => void;
  onRefresh: () => void;
  onToggleLock: () => void;
}

export function DeskContextMenu({
  children,
  targetWidgetId,
  currentWidgets,
  isLocked,
  onAddWidget,
  onRemoveWidget,
  onMoveToTop,
  onAutoOrganize,
  onRefresh,
  onToggleLock,
}: DeskContextMenuProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent
          className="w-52"
          style={{ backgroundColor: '#1C1C1F', borderColor: '#2A2A2E' }}
        >
          {/* Widget-specific options */}
          {targetWidgetId && (
            <>
              <ContextMenuItem
                className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                style={{ color: '#D4D4D8' }}
                onClick={() => onMoveToTop?.(targetWidgetId)}
              >
                <ArrowUpToLine className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
                Mover para o início
              </ContextMenuItem>
              <ContextMenuItem
                className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                style={{ color: '#EF4444' }}
                onClick={() => onRemoveWidget?.(targetWidgetId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover da mesa
              </ContextMenuItem>
              <ContextMenuSeparator style={{ backgroundColor: '#27272A' }} />
            </>
          )}

          {/* Background options (always shown) */}
          <ContextMenuItem
            className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
            style={{ color: '#D4D4D8' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" style={{ color: '#EA580C' }} />
            Adicionar widget
          </ContextMenuItem>
          <ContextMenuSeparator style={{ backgroundColor: '#27272A' }} />
          <ContextMenuItem
            className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
            style={{ color: '#D4D4D8' }}
            onClick={onAutoOrganize}
          >
            <LayoutGrid className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
            Organizar automaticamente
          </ContextMenuItem>
          <ContextMenuItem
            className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
            style={{ color: '#D4D4D8' }}
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
            Atualizar mesa
          </ContextMenuItem>
          <ContextMenuSeparator style={{ backgroundColor: '#27272A' }} />
          <ContextMenuItem
            className="text-xs gap-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
            style={{ color: '#D4D4D8' }}
            onClick={onToggleLock}
          >
            {isLocked
              ? <><Unlock className="h-3.5 w-3.5" style={{ color: '#71717A' }} /> Desbloquear mesa</>
              : <><Lock className="h-3.5 w-3.5" style={{ color: '#71717A' }} /> Bloquear mesa</>
            }
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AddWidgetDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        currentWidgets={currentWidgets}
        onAdd={onAddWidget}
      />
    </>
  );
}
