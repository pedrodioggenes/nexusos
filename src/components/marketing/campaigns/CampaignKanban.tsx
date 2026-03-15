import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Cog, 
  PlayCircle, 
  Trophy 
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CampaignCard } from "./CampaignCard";
import { useUpdateCampaign, MarketingCampaign } from "@/hooks/useMarketingCampaigns";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

type CampaignStatus = MarketingCampaign['status'];

interface CampaignKanbanProps {
  campaigns: MarketingCampaign[];
  onCampaignClick?: (campaign: MarketingCampaign) => void;
  isLoading?: boolean;
}

interface KanbanColumn {
  id: CampaignStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "draft", label: "Rascunho", icon: <FileText className="h-4 w-4" />, color: "text-muted-foreground" },
  { id: "pending_approval", label: "Aprovação", icon: <AlertCircle className="h-4 w-4" />, color: "text-warning" },
  { id: "approved", label: "Aprovada", icon: <CheckCircle className="h-4 w-4" />, color: "text-success" },
  { id: "in_production", label: "Produção", icon: <Cog className="h-4 w-4" />, color: "text-blue-500" },
  { id: "active", label: "Ativa", icon: <PlayCircle className="h-4 w-4" />, color: "text-green-500" },
  { id: "completed", label: "Concluída", icon: <Trophy className="h-4 w-4" />, color: "text-app-gestao" },
];

// Define valid transitions for campaigns
const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["pending_approval", "cancelled"],
  pending_approval: ["approved", "draft", "cancelled"],
  approved: ["in_production", "active", "cancelled"],
  in_production: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: ["draft"],
};

export function CampaignKanban({ campaigns, onCampaignClick, isLoading }: CampaignKanbanProps) {
  const updateCampaign = useUpdateCampaign();
  const [draggedCampaign, setDraggedCampaign] = useState<MarketingCampaign | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<CampaignStatus | null>(null);

  const getCampaignsByStatus = (status: CampaignStatus) => {
    return campaigns.filter((c) => c.status === status);
  };

  const canTransition = (from: CampaignStatus, to: CampaignStatus): boolean => {
    return validTransitions[from]?.includes(to) || false;
  };

  const handleDragStart = (e: React.DragEvent, campaign: MarketingCampaign) => {
    setDraggedCampaign(campaign);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", campaign.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: CampaignStatus) => {
    e.preventDefault();
    if (draggedCampaign && canTransition(draggedCampaign.status, columnId)) {
      e.dataTransfer.dropEffect = "move";
      setDragOverColumn(columnId);
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: CampaignStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedCampaign && draggedCampaign.status !== newStatus) {
      if (canTransition(draggedCampaign.status, newStatus)) {
        const updateData: Partial<MarketingCampaign> & { id: string } = {
          id: draggedCampaign.id,
          status: newStatus,
        };

        // Set approved_at when transitioning to approved
        if (newStatus === "approved") {
          updateData.approved_at = new Date().toISOString();
        }

        await updateCampaign.mutateAsync(updateData);
      }
    }
    setDraggedCampaign(null);
  };

  const handleDragEnd = () => {
    setDraggedCampaign(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.slice(0, 5).map((col) => (
          <div key={col.id} className="flex-shrink-0 flex-1 min-w-[120px]">
            <div className="h-8 bg-muted/50 rounded-lg mb-3 animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-muted/30 rounded-lg animate-pulse" />
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
        autoSaveId="kanban-campaigns"
        className="min-h-[400px] pb-4"
      >
        {columns.map((column, index) => {
          const columnCampaigns = getCampaignsByStatus(column.id);
          const isDropTarget = dragOverColumn === column.id;
          const isValidDrop = draggedCampaign && canTransition(draggedCampaign.status, column.id);

          return (
            <div key={column.id} className="contents">
              <ResizablePanel
                defaultSize={16.66}
                minSize={10}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-xl p-3 mx-1",
                    "bg-muted/20 border border-border/50",
                    isDropTarget && isValidDrop && "border-app-gestao/50 bg-app-gestao/5",
                    draggedCampaign && !isValidDrop && column.id !== draggedCampaign.status && "opacity-50"
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  animate={{
                    scale: isDropTarget && isValidDrop ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={column.color}>{column.icon}</span>
                      <h3 className="text-xs font-medium">{column.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {columnCampaigns.length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {columnCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, campaign)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <CampaignCard
                            campaign={campaign}
                            onClick={() => onCampaignClick?.(campaign)}
                            isDragging={draggedCampaign?.id === campaign.id}
                            onUpdate={(id, data) => {
                              updateCampaign.mutate({
                                id,
                                name: data.name,
                                planned_budget: data.planned_budget,
                                expected_reach: data.expected_reach,
                              });
                            }}
                          />
                        </div>
                      ))}
                    </AnimatePresence>

                    {columnCampaigns.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        {column.id === "draft" ? "Crie uma campanha" : "Arraste aqui"}
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
