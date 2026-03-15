import { useState } from "react";
import { TeamTask, TaskStatus, useUpdateTaskStatus } from "@/hooks/useTeamTasks";
import { TaskCard } from "./TaskCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  ListTodo, 
  PlayCircle, 
  Eye, 
  CheckCircle2
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface TaskKanbanProps {
  tasks: TeamTask[];
  onTaskClick?: (task: TeamTask) => void;
  isLoading?: boolean;
}

interface KanbanColumn {
  id: TaskStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "backlog", label: "Backlog", icon: <Inbox className="h-4 w-4" />, color: "text-muted-foreground" },
  { id: "todo", label: "A Fazer", icon: <ListTodo className="h-4 w-4" />, color: "text-accent" },
  { id: "in_progress", label: "Em Produção", icon: <PlayCircle className="h-4 w-4" />, color: "text-app-gestao" },
  { id: "review", label: "Revisão", icon: <Eye className="h-4 w-4" />, color: "text-warning" },
  { id: "done", label: "Concluído", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-success" },
];

export function TaskKanban({ tasks, onTaskClick, isLoading }: TaskKanbanProps) {
  const updateStatus = useUpdateTaskStatus();
  const [draggedTask, setDraggedTask] = useState<TeamTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, task: TeamTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== newStatus) {
      await updateStatus.mutateAsync({
        id: draggedTask.id,
        status: newStatus,
      });
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 flex-1 min-w-[150px]">
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
        autoSaveId="kanban-tasks"
        className="min-h-[400px] pb-4"
      >
        {columns.map((column, index) => {
          const columnTasks = getTasksByStatus(column.id);
          const isDropTarget = dragOverColumn === column.id;

          return (
            <div key={column.id} className="contents">
              <ResizablePanel
                defaultSize={20}
                minSize={12}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-xl p-3 mx-1 animate-safe text-render-fix",
                    "bg-muted/20 border border-border/50",
                    isDropTarget && "border-primary/50 bg-primary/5"
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  animate={{
                    y: isDropTarget ? -2 : 0,
                    borderColor: isDropTarget ? "hsl(var(--primary))" : undefined,
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
                      {columnTasks.length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <TaskCard
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                            isDragging={draggedTask?.id === task.id}
                          />
                        </div>
                      ))}
                    </AnimatePresence>

                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        Arraste tarefas aqui
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
