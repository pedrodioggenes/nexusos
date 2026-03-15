import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DemandPriority,
  DemandStatus,
  demandPriorityConfig,
  useCreateDemand,
} from "@/hooks/useMarketingDemands";
import { DemandRichEditor } from "./DemandRichEditor";
import { Json } from "@/integrations/supabase/types";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.any().optional(),
  assigned_to: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low'] as const),
  due_date: z.date().optional(),
  estimated_hours: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateDemandaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: DemandStatus;
  campaignId?: string;
}

export function CreateDemandaDialog({
  open,
  onOpenChange,
  defaultStatus = 'open',
  campaignId,
}: CreateDemandaDialogProps) {
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState<unknown[]>([]);
  const createDemand = useCreateDemand();
  const { data: users, isLoading: usersLoading } = useUsers();
  
  const handleDescriptionChange = useCallback((content: unknown[]) => {
    setDescriptionContent(content);
  }, []);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: undefined,
      assigned_to: undefined,
      priority: "medium",
      estimated_hours: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    // Store description content as JSON string for the database
    const descriptionValue = descriptionContent.length > 0 
      ? JSON.stringify(descriptionContent) 
      : undefined;

    await createDemand.mutateAsync({
      title: data.title,
      description: descriptionValue,
      type: 'general',
      priority: data.priority,
      due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
      estimated_hours: data.estimated_hours,
      assigned_to: data.assigned_to,
      campaign_id: campaignId,
    });

    form.reset();
    setDescriptionContent([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Demanda</DialogTitle>
          <DialogDescription>
            Crie uma nova demanda para a equipe de marketing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Criar post para campanha de verão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-2 block">Descrição</FormLabel>
              <DemandRichEditor
                onChange={handleDescriptionChange}
                placeholder="Descreva os detalhes da demanda... Arraste imagens ou use / para comandos"
                minHeight="150px"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => {
                  const selectedUser = users?.find(u => u.user_id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Responsável</FormLabel>
                      <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={assigneeOpen}
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedUser ? (
                                <span className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {selectedUser.profiles?.full_name || selectedUser.profiles?.email}
                                </span>
                              ) : (
                                "Selecione"
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar responsável..." />
                            <CommandList>
                              <CommandEmpty>
                                {usersLoading ? "Carregando..." : "Nenhum usuário encontrado."}
                              </CommandEmpty>
                              <CommandGroup>
                                {users?.map((user) => (
                                  <CommandItem
                                    key={user.user_id}
                                    value={user.profiles?.full_name || user.profiles?.email || user.user_id}
                                    onSelect={() => {
                                      field.onChange(user.user_id);
                                      setAssigneeOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === user.user_id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{user.profiles?.full_name || user.profiles?.email}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(demandPriorityConfig) as [DemandPriority, { label: string; color: string }][]).map(
                          ([value, config]) => (
                            <SelectItem key={value} value={value}>
                              <span className={cn("font-medium", config.color)}>
                                {config.label}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prazo</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
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
                    <FormLabel>Horas estimadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Ex: 4"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createDemand.isPending}>
                {createDemand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Demanda
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
