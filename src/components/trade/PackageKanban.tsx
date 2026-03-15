import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, PlayCircle, CheckCircle2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PackageCard } from "./PackageCard";
import { useUpdateTradePackage } from "@/hooks/useTradePackages";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

type PackageStatus = "draft" | "active" | "completed";

interface PackageData {
  id: string;
  name: string;
  status: string;
  supplier_name?: string | null;
  period_start: string;
  period_end: string;
  total_value: number | null;
  totalItems: number;
  completedItems: number;
}

interface PackageKanbanProps {
  packages: PackageData[];
  onPackageClick?: (pkg: PackageData) => void;
  isLoading?: boolean;
}

interface KanbanColumn {
  id: PackageStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "draft", label: "Rascunho", icon: <Inbox className="h-4 w-4" />, color: "text-muted-foreground" },
  { id: "active", label: "Ativo", icon: <PlayCircle className="h-4 w-4" />, color: "text-success" },
  { id: "completed", label: "Concluído", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-primary" },
];

export function PackageKanban({ packages, onPackageClick, isLoading }: PackageKanbanProps) {
  const updatePackage = useUpdateTradePackage();
  const [draggedPackage, setDraggedPackage] = useState<PackageData | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PackageStatus | null>(null);

  const getPackagesByStatus = (status: PackageStatus) => {
    return packages.filter((pkg) => pkg.status === status);
  };

  const handleDragStart = (e: React.DragEvent, pkg: PackageData) => {
    setDraggedPackage(pkg);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", pkg.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: PackageStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: PackageStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedPackage && draggedPackage.status !== newStatus) {
      await updatePackage.mutateAsync({
        id: draggedPackage.id,
        data: { status: newStatus },
      });
    }
    setDraggedPackage(null);
  };

  const handleDragEnd = () => {
    setDraggedPackage(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 flex-1 min-w-[200px]">
            <div className="h-8 bg-muted/50 rounded-lg mb-3 animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="kanban-packages"
        className="min-h-[400px] pb-4"
      >
        {columns.map((column, index) => {
          const columnPackages = getPackagesByStatus(column.id);
          const isDropTarget = dragOverColumn === column.id;

          return (
            <div key={column.id} className="contents">
              <ResizablePanel
                defaultSize={33.33}
                minSize={20}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-xl p-3 mx-1 animate-safe text-render-fix",
                    "bg-muted/20 border border-border/50",
                    isDropTarget && "border-app-trade/50 bg-app-trade/5"
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  animate={{
                    y: isDropTarget ? -2 : 0,
                    borderColor: isDropTarget ? "hsl(var(--app-trade))" : undefined,
                  }}
                  transition={{ duration: 0.15 }}
                  style={{ willChange: "transform" }}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={column.color}>{column.icon}</span>
                      <h3 className="text-sm font-medium">{column.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {columnPackages.length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {columnPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, pkg)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <PackageCard
                            package_={pkg}
                            onClick={() => onPackageClick?.(pkg)}
                            isDragging={draggedPackage?.id === pkg.id}
                            onUpdate={(id, data) => {
                              updatePackage.mutate({
                                id,
                                data: {
                                  name: data.name,
                                  total_value: data.total_value,
                                },
                              });
                            }}
                          />
                        </div>
                      ))}
                    </AnimatePresence>

                    {columnPackages.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        Arraste pacotes aqui
                      </div>
                    )}
                  </div>
                </motion.div>
              </ResizablePanel>
              {index < columns.length - 1 && (
                <ResizableHandle withHandle />
              )}
            </div>
          );
        })}
      </ResizablePanelGroup>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
