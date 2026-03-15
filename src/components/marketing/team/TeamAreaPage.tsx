import { useState, ReactNode } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamTasks, TeamTask, TaskType } from "@/hooks/useTeamTasks";
import {
  TaskKanban,
  TaskListView,
  CreateTaskDialog,
  TaskDetailSheet,
  ApprovalPanel,
  TeamProductivityCard,
} from "@/components/marketing/team";
import { BlurFade } from "@/components/ui/blur-fade";
import { StatCardWithSparkline } from "@/components/marketing/StatCardWithSparkline";
import { PageWrapper } from "@/components/marketing/PageWrapper";

export interface TeamAreaConfig {
  taskType: TaskType;
  title: string;
  subtitle: string;
  createButtonLabel?: string;
  defaultPlatforms?: string[];
  /** Stats card icons — 4 icons in order: total, inProgress, review, done */
  statIcons: [ReactNode, ReactNode, ReactNode, ReactNode];
  /** Optional stat labels override */
  statLabels?: [string, string, string, string];
  /** Custom section rendered between stats and main content */
  extraSection?: (tasks: TeamTask[], isLoading: boolean) => ReactNode;
  /** Custom section rendered after main content */
  bottomSection?: (tasks: TeamTask[], isLoading: boolean) => ReactNode;
}

export function TeamAreaPage({ config }: { config: TeamAreaConfig }) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TeamTask | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const { data: tasks = [], isLoading } = useTeamTasks(config.taskType);

  const handleTaskClick = (task: TeamTask) => {
    setSelectedTask(task);
    setDetailSheetOpen(true);
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const labels = config.statLabels || [
    "Total Demandas",
    "Em Produção",
    "Aguardando Aprovação",
    "Concluídas",
  ];

  return (
    <PageWrapper
      title={config.title}
      subtitle={config.subtitle}
      actions={
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "list")}>
            <TabsList className="h-9">
              <TabsTrigger value="kanban" className="px-3">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-app-gestao hover:bg-app-gestao/90">
            <Plus className="h-4 w-4 mr-1" />
            {config.createButtonLabel || "Nova Demanda"}
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCardWithSparkline
            title={labels[0]}
            value={stats.total}
            icon={config.statIcons[0]}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title={labels[1]}
            value={stats.inProgress}
            icon={config.statIcons[1]}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title={labels[2]}
            value={stats.review}
            changeType={stats.review > 0 ? "negative" : "neutral"}
            icon={config.statIcons[2]}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title={labels[3]}
            value={stats.done}
            changeType="positive"
            icon={config.statIcons[3]}
            isLoading={isLoading}
          />
        </div>
      </BlurFade>

      {/* Custom Extra Section */}
      {config.extraSection && (
        <BlurFade delay={0.1}>
          {config.extraSection(tasks, isLoading)}
        </BlurFade>
      )}

      {/* Main Content Area */}
      <BlurFade delay={0.15}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold">Gestão de Demandas</h3>
              </div>
              <div className="p-4">
                {viewMode === "kanban" ? (
                  <TaskKanban
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                    isLoading={isLoading}
                  />
                ) : (
                  <TaskListView
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ApprovalPanel tasks={tasks} onViewTask={handleTaskClick} isLoading={isLoading} />
            <TeamProductivityCard tasks={tasks} taskType={config.taskType} isLoading={isLoading} />
          </div>
        </div>
      </BlurFade>

      {/* Custom Bottom Section */}
      {config.bottomSection && (
        <BlurFade delay={0.2}>
          {config.bottomSection(tasks, isLoading)}
        </BlurFade>
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        taskType={config.taskType}
        defaultPlatforms={config.defaultPlatforms || []}
      />

      <TaskDetailSheet
        task={selectedTask}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </PageWrapper>
  );
}
