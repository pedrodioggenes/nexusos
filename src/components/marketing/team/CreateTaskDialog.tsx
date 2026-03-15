import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TaskType, TaskPriority, useCreateTask, CreateTaskInput } from "@/hooks/useTeamTasks";
import { useUsers } from "@/hooks/useUsers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  assignee_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  deadline: z.date().optional(),
  estimated_hours: z.number().min(0).optional(),
  platforms: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: TaskType;
  defaultPlatforms?: string[];
}

const platformOptions: Record<TaskType, string[]> = {
  social: ["Instagram", "Facebook", "YouTube", "TikTok", "LinkedIn", "X/Twitter", "WhatsApp"],
  traffic: ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Display", "Programática"],
  design: ["Banner", "Post", "Stories", "Carrossel", "Vídeo", "PDV", "E-mail", "Landing Page"],
  copy: ["Campanha", "E-mail", "Social Media", "Landing Page", "Blog", "Roteiro", "Anúncio"],
  video: ["Reels", "Stories", "YouTube", "Institucional", "Tutorial", "Depoimento", "Evento"],
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const typeLabels: Record<TaskType, string> = {
  social: "Social Media",
  traffic: "Tráfego Pago",
  design: "Design",
  copy: "Copywriting",
  video: "Videomaker",
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  taskType,
  defaultPlatforms = [],
}: CreateTaskDialogProps) {
  const { data: users, isLoading: usersLoading } = useUsers();
  const createTask = useCreateTask();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(defaultPlatforms);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      platforms: defaultPlatforms,
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    const input: CreateTaskInput = {
      title: values.title,
      description: values.description,
      task_type: taskType,
      priority: values.priority,
      assignee_id: values.assignee_id,
      deadline: values.deadline?.toISOString(),
      estimated_hours: values.estimated_hours,
      platforms: selectedPlatforms,
    };

    await createTask.mutateAsync(input);
    form.reset();
    setSelectedPlatforms([]);
    onOpenChange(false);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova Demanda - {typeLabels[taskType]}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banner Promoção Janeiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da demanda..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignee + Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersLoading ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : (
                          users?.map((user) => (
                            <SelectItem key={user.user_id} value={user.user_id}>
                              {user.profiles?.full_name || user.profiles?.email || "Usuário"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deadline + Estimated Hours Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              : "Selecionar data"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (horas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Ex: 4"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Platforms */}
            <div>
              <FormLabel>Plataformas / Tipos</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {platformOptions[taskType].map((platform) => (
                  <Badge
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedPlatforms.includes(platform) && "bg-primary hover:bg-primary/80"
                    )}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                    {selectedPlatforms.includes(platform) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Demanda
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
