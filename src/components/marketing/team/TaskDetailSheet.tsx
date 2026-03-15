import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TeamTask, useApproveTask, useUpdateTaskStatus } from "@/hooks/useTeamTasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  History,
  FileText,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

interface TaskDetailSheetProps {
  task: TeamTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: TeamTask) => void;
}

const statusConfig = {
  backlog: { label: "Backlog", className: "bg-muted text-muted-foreground" },
  todo: { label: "A Fazer", className: "bg-accent/10 text-accent" },
  in_progress: { label: "Em Produção", className: "bg-app-gestao/10 text-app-gestao" },
  review: { label: "Revisão", className: "bg-warning/10 text-warning" },
  done: { label: "Concluído", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
};

const priorityConfig = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  medium: { label: "Média", className: "bg-warning/10 text-warning" },
  high: { label: "Alta", className: "bg-destructive/10 text-destructive" },
  urgent: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
};

const typeLabels = {
  social: "Social Media",
  traffic: "Tráfego Pago",
  design: "Design",
  copy: "Copywriting",
};

export function TaskDetailSheet({ task, open, onOpenChange, onEdit }: TaskDetailSheetProps) {
  const [revisionNotes, setRevisionNotes] = useState("");
  const approveTask = useApproveTask();
  const updateStatus = useUpdateTaskStatus();

  if (!task) return null;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleApprove = async () => {
    await approveTask.mutateAsync({
      id: task.id,
      approved: true,
    });
    await updateStatus.mutateAsync({
      id: task.id,
      status: "done",
    });
    onOpenChange(false);
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) return;
    await approveTask.mutateAsync({
      id: task.id,
      approved: false,
      notes: revisionNotes,
    });
    await updateStatus.mutateAsync({
      id: task.id,
      status: "in_progress",
    });
    setRevisionNotes("");
    onOpenChange(false);
  };

  const isInReview = task.status === "review";
  const isPending = approveTask.isPending || updateStatus.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          {/* Header badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px]", statusConfig[task.status]?.className)}>
              {statusConfig[task.status]?.label}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px]", priorityConfig[task.priority]?.className)}>
              {priorityConfig[task.priority]?.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {typeLabels[task.task_type]}
            </Badge>
          </div>

          <SheetTitle className="text-left text-lg">{task.title}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              <FileText className="h-4 w-4 mr-1" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Notas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  Responsável
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-secondary">
                      {getInitials(task.assignee_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee_name || "Não atribuído"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Prazo
                </div>
                <span className="text-sm">
                  {task.deadline
                    ? format(new Date(task.deadline), "dd/MM/yyyy", { locale: ptBR })
                    : "Sem prazo"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Tempo Estimado
                </div>
                <span className="text-sm">
                  {task.estimated_hours ? `${task.estimated_hours}h` : "—"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Tempo Real
                </div>
                <span className="text-sm">
                  {task.actual_hours ? `${task.actual_hours}h` : "—"}
                </span>
              </div>
            </div>

            {/* Platforms */}
            {task.platforms && task.platforms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Plataformas / Tipos</h4>
                <div className="flex flex-wrap gap-1">
                  {task.platforms.map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anexos ({task.attachments.length})
                </h4>
                <div className="space-y-2">
                  {task.attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border"
                    >
                      <span className="text-sm truncate">{attachment}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revision notes from last review */}
            {task.revision_notes && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-2 text-warning">
                  <AlertCircle className="h-4 w-4" />
                  Notas de Revisão
                </h4>
                <p className="text-sm text-muted-foreground">{task.revision_notes}</p>
              </div>
            )}

            <Separator />

            {/* Approval Section */}
            {isInReview && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Aprovação</h4>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Aprovar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Descreva o que precisa ser revisado..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleRequestRevision}
                    disabled={isPending || !revisionNotes.trim()}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Solicitar Revisão
                  </Button>
                </div>
              </div>
            )}

            {/* Edit button */}
            <Button variant="outline" className="w-full" onClick={() => onEdit?.(task)}>
              Editar Demanda
            </Button>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              {/* Placeholder for history - would need a separate table */}
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Criado em {format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                {task.updated_at !== task.created_at && (
                  <p className="text-xs mt-1">
                    Última atualização: {format(new Date(task.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {/* Placeholder for comments - would need a separate table */}
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma nota adicionada</p>
              </div>
              
              <div className="space-y-2">
                <Textarea placeholder="Adicionar uma nota..." rows={2} />
                <Button className="w-full" variant="secondary" disabled>
                  Adicionar Nota
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
