import { useState, useMemo } from "react";
import { TeamTask, TaskStatus, TaskPriority } from "@/hooks/useTeamTasks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

interface TaskListViewProps {
  tasks: TeamTask[];
  onTaskClick?: (task: TeamTask) => void;
  onEditTask?: (task: TeamTask) => void;
  onDeleteTask?: (task: TeamTask) => void;
  isLoading?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  backlog: { label: "Backlog", className: "bg-muted text-muted-foreground" },
  todo: { label: "A Fazer", className: "bg-accent/10 text-accent border-accent/20" },
  in_progress: { label: "Em Produção", className: "bg-app-gestao/10 text-app-gestao border-app-gestao/20" },
  review: { label: "Revisão", className: "bg-warning/10 text-warning border-warning/20" },
  done: { label: "Concluído", className: "bg-success/10 text-success border-success/20" },
};

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  medium: { label: "Média", className: "bg-warning/10 text-warning" },
  high: { label: "Alta", className: "bg-destructive/10 text-destructive" },
  urgent: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
};

type SortField = "title" | "priority" | "status" | "deadline" | "assignee_name";
type SortOrder = "asc" | "desc";

export function TaskListView({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  isLoading,
}: TaskListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee_name?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "status":
          const statusOrder = { backlog: 0, todo: 1, in_progress: 2, review: 3, done: 4, cancelled: 5 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "deadline":
          const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case "assignee_name":
          comparison = (a.assignee_name || "").localeCompare(b.assignee_name || "");
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar demandas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(priorityConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort("title")}
                >
                  Título
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort("assignee_name")}
                >
                  Responsável
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort("priority")}
                >
                  Prioridade
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort("deadline")}
                >
                  Prazo
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-center">Tempo</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Nenhuma demanda encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTasks.map((task) => {
                const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== "done";
                const isDueToday = task.deadline && isToday(new Date(task.deadline));

                return (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                        {task.platforms && task.platforms.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.platforms.slice(0, 2).map((p) => (
                              <Badge key={p} variant="secondary" className="text-[9px] px-1 py-0">
                                {p}
                              </Badge>
                            ))}
                            {task.platforms.length > 2 && (
                              <span className="text-[9px] text-muted-foreground">+{task.platforms.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-secondary">
                            {getInitials(task.assignee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {task.assignee_name || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", priorityConfig[task.priority].className)}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", statusConfig[task.status].className)}>
                        {statusConfig[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            isOverdue && "text-destructive",
                            isDueToday && !isOverdue && "text-warning",
                            !isOverdue && !isDueToday && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.deadline), "dd/MM/yy", { locale: ptBR })}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {task.estimated_hours ? (
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                          {task.actual_hours && (
                            <span className="text-success">/{task.actual_hours}h</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTaskClick?.(task); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditTask?.(task); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filteredAndSortedTasks.length} de {tasks.length} demandas
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            {tasks.filter((t) => t.status === "done").length} concluídas
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-warning" />
            {tasks.filter((t) => t.status === "review").length} em revisão
          </span>
        </div>
      </div>
    </div>
  );
}
