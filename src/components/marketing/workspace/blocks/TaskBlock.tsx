import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  User,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask, TaskType, TaskPriority } from '@/hooks/useTeamTasks';
import { useUsers } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';

export interface TaskBlockData {
  taskType: TaskType;
  title: string;
  assigneeId?: string;
  priority: TaskPriority;
  deadline?: string;
  taskId?: string;
  status?: string;
}

interface TaskBlockProps {
  data: TaskBlockData;
  onChange: (data: TaskBlockData) => void;
  pageId?: string;
  readOnly?: boolean;
}

const TASK_TYPES: { value: TaskType; label: string; color: string; route: string }[] = [
  { value: 'social', label: 'Social Media', color: 'bg-pink-500/10 text-pink-500', route: '/app/marketing/equipe/social' },
  { value: 'traffic', label: 'Tráfego', color: 'bg-blue-500/10 text-blue-500', route: '/app/marketing/equipe/trafego' },
  { value: 'design', label: 'Design', color: 'bg-purple-500/10 text-purple-500', route: '/app/marketing/equipe/design' },
  { value: 'copy', label: 'Copywriter', color: 'bg-amber-500/10 text-amber-500', route: '/app/marketing/equipe/copy' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground' },
  { value: 'medium', label: 'Média', color: 'text-yellow-500' },
  { value: 'high', label: 'Alta', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'text-destructive' },
];

export function TaskBlockComponent({ data, onChange, pageId, readOnly }: TaskBlockProps) {
  const navigate = useNavigate();
  const createTask = useCreateTask();
  const { data: users } = useUsers();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!data.title.trim()) return;

    setIsCreating(true);
    try {
      const newTask = await createTask.mutateAsync({
        title: data.title,
        task_type: data.taskType,
        priority: data.priority,
        assignee_id: data.assigneeId || undefined,
        deadline: data.deadline || undefined,
        source_page_id: pageId,
      });

      onChange({
        ...data,
        taskId: newTask.id,
        status: newTask.status,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const taskTypeConfig = TASK_TYPES.find(t => t.value === data.taskType) || TASK_TYPES[0];
  const priorityConfig = PRIORITIES.find(p => p.value === data.priority) || PRIORITIES[1];

  // If task already created, show readonly card
  if (data.taskId) {
    return (
      <div 
        className="border rounded-lg p-3 bg-muted/30 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => navigate(taskTypeConfig.route)}
      >
        <CheckSquare className="h-5 w-5 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{data.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={cn("text-[10px]", taskTypeConfig.color)}>
              {taskTypeConfig.label}
            </Badge>
            <span className={cn("text-xs", priorityConfig.color)}>
              {priorityConfig.label}
            </span>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  // Editable task block
  return (
    <div className="border rounded-lg p-4 bg-card space-y-3" contentEditable={false}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-app-gestao" />
        <span className="text-sm font-medium">Nova Tarefa</span>
      </div>

      {/* Title */}
      <Input
        placeholder="Título da tarefa..."
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        disabled={readOnly}
        className="h-9"
      />

      {/* Options row */}
      <div className="flex flex-wrap gap-2">
        {/* Task Type */}
        <Select
          value={data.taskType}
          onValueChange={(value) => onChange({ ...data, taskType: value as TaskType })}
          disabled={readOnly}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <Badge variant="secondary" className={cn("text-[10px]", type.color)}>
                  {type.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={data.priority}
          onValueChange={(value) => onChange({ ...data, priority: value as TaskPriority })}
          disabled={readOnly}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <AlertCircle className={cn("h-3 w-3 mr-1", priorityConfig.color)} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                <span className={priority.color}>{priority.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee */}
        <Select
          value={data.assigneeId || ''}
          onValueChange={(value) => onChange({ ...data, assigneeId: value || undefined })}
          disabled={readOnly}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <User className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id}>
                {user.profiles?.full_name || user.profiles?.email || 'Usuário'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Deadline */}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <Input
            type="date"
            value={data.deadline || ''}
            onChange={(e) => onChange({ ...data, deadline: e.target.value })}
            disabled={readOnly}
            className="w-[130px] h-8 text-xs"
          />
        </div>
      </div>

      {/* Create button */}
      {!readOnly && (
        <Button
          size="sm"
          onClick={handleCreateTask}
          disabled={!data.title.trim() || isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4 mr-2" />
              Criar Demanda
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Default data for new task blocks
export const defaultTaskBlockData: TaskBlockData = {
  taskType: 'social',
  title: '',
  priority: 'medium',
};
