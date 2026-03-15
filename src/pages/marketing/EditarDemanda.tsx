import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Check, 
  ChevronsUpDown, 
  Loader2, 
  User,
  FileText,
  Clock,
  Link2,
  Tags,
  CloudOff,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  DemandType,
  demandPriorityConfig,
  demandTypeConfig,
  useDemandById,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import { useMarketingCampaigns } from "@/hooks/useMarketingCampaigns";
import { useWorkspacePages } from "@/hooks/useWorkspacePages";
import { DemandRichEditor } from "@/components/marketing/demands/DemandRichEditor";
import { RetailFieldsSection } from "@/components/marketing/demands/RetailFieldsSection";
import { TagInput } from "@/components/ui/tag-input";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.any().optional(),
  type: z.enum(['social_media', 'design', 'copywriting', 'video', 'general'] as const),
  assigned_to: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low'] as const),
  due_date: z.date().optional(),
  campaign_id: z.string().optional(),
  document_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditarDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState<unknown[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deliverableKind, setDeliverableKind] = useState("none");
  const [destinationScope, setDestinationScope] = useState("none");
  const [channels, setChannels] = useState<string[]>([]);

  const { data: demand, isLoading: demandLoading } = useDemandById(id);
  const updateDemand = useUpdateDemand();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: campaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: documents, isLoading: documentsLoading } = useWorkspacePages();

  const parsedDescription = useMemo(() => {
    if (!demand?.description) return undefined;
    try {
      const parsed = JSON.parse(demand.description);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* not JSON */ }
    return undefined;
  }, [demand?.description]);

  const handleDescriptionChange = useCallback((content: unknown[]) => {
    setDescriptionContent(content);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "general",
      priority: "medium",
    },
  });

  // Initialize form when demand loads
  useEffect(() => {
    if (demand && !isInitialized) {
      form.reset({
        title: demand.title,
        type: demand.type,
        priority: demand.priority,
        assigned_to: demand.assigned_to || undefined,
        due_date: demand.due_date ? new Date(demand.due_date) : undefined,
        campaign_id: demand.campaign_id || undefined,
        document_id: demand.document_id || undefined,
      });
      setTags(demand.tags || []);
      if (parsedDescription) {
        setDescriptionContent(parsedDescription);
      }
      // Initialize retail fields
      const demandAny = demand as any;
      setDeliverableKind(demandAny.deliverable_kind || "none");
      const destScope = demandAny.destination_scope as any;
      setDestinationScope(destScope?.scope || "none");
      const ch = demandAny.channels as any;
      setChannels(Array.isArray(ch) ? ch : []);
      setIsInitialized(true);
    }
  }, [demand, isInitialized, form, parsedDescription]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    
    const descriptionValue = descriptionContent.length > 0
      ? JSON.stringify(descriptionContent)
      : demand?.description || undefined;

    await updateDemand.mutateAsync({
      id,
      title: data.title,
      description: descriptionValue,
      type: data.type,
      priority: data.priority,
      due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
      assigned_to: data.assigned_to,
      campaign_id: data.campaign_id,
      document_id: data.document_id,
      tags: tags,
      deliverable_kind: deliverableKind !== "none" ? deliverableKind : undefined,
      destination_scope: destinationScope !== "none" ? { scope: destinationScope } : undefined,
      channels: channels.length > 0 ? channels : undefined,
    } as any);

    navigate('/app/marketing/demandas');
  };

  // Auto-save: debounced 2s after any change
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isAutoSavingRef = useRef(false);

  const performAutoSave = useCallback(async () => {
    if (!id || !isInitialized || isAutoSavingRef.current) return;
    const data = form.getValues();
    if (!data.title || data.title.length < 3) return;

    isAutoSavingRef.current = true;
    setAutoSaveStatus('saving');
    try {
      const descriptionValue = descriptionContent.length > 0
        ? JSON.stringify(descriptionContent)
        : demand?.description || undefined;

      await updateDemand.mutateAsync({
        id,
        title: data.title,
        description: descriptionValue,
        type: data.type,
        priority: data.priority,
        due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
        assigned_to: data.assigned_to,
        campaign_id: data.campaign_id,
        document_id: data.document_id,
        tags: tags,
        deliverable_kind: deliverableKind !== "none" ? deliverableKind : undefined,
        destination_scope: destinationScope !== "none" ? { scope: destinationScope } : undefined,
        channels: channels.length > 0 ? channels : undefined,
      } as any);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    } finally {
      isAutoSavingRef.current = false;
    }
  }, [id, isInitialized, form, descriptionContent, demand, tags, deliverableKind, destinationScope, channels, updateDemand]);

  const triggerAutoSave = useCallback(() => {
    if (!isInitialized) return;
    setAutoSaveStatus('idle');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(performAutoSave, 2000);
  }, [isInitialized, performAutoSave]);

  // Watch form fields for changes
  useEffect(() => {
    if (!isInitialized) return;
    const subscription = form.watch(() => triggerAutoSave());
    return () => subscription.unsubscribe();
  }, [form, isInitialized, triggerAutoSave]);

  // Watch non-form state changes (tags, description, retail fields)
  useEffect(() => {
    if (isInitialized) triggerAutoSave();
  }, [tags, descriptionContent, deliverableKind, destinationScope, channels]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const handleCancel = () => {
    navigate('/app/marketing/demandas');
  };

  if (demandLoading) {
    return (
      <PageWrapper
        title="Editar Demanda"
        subtitle="Carregando..."
        icon={<FileText className="h-6 w-6 text-app-gestao" />}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (!demand) {
    return (
      <PageWrapper
        title="Demanda não encontrada"
        subtitle="A demanda solicitada não existe"
        icon={<FileText className="h-6 w-6 text-app-gestao" />}
        actions={
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        }
      >
        <div />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Editar Demanda"
      subtitle={`Editando: ${demand.title}`}
      icon={<FileText className="h-6 w-6 text-app-gestao" />}
      actions={
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section: Informações Básicas */}
            <BlurFade delay={0.1}>
              <PremiumGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Criar post para campanha de verão" 
                            {...field} 
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Demanda *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.entries(demandTypeConfig) as [DemandType, { label: string; icon: string }][]).map(
                                ([value, config]) => (
                                  <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                      <span>{config.icon}</span>
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

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
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
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Section: Detalhamento */}
            <BlurFade delay={0.15}>
              <PremiumGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Detalhamento</h3>
                </div>
                
                <div>
                  <FormLabel className="mb-2 block">
                    Descreva os detalhes da demanda
                  </FormLabel>
                  <FormDescription className="mb-3">
                    Use o editor abaixo para adicionar descrição, imagens e formatação. Digite / para comandos rápidos.
                  </FormDescription>
                  {isInitialized && (
                    <DemandRichEditor
                      initialContent={parsedDescription}
                      onChange={handleDescriptionChange}
                      placeholder="Descreva os detalhes da demanda..."
                      minHeight="350px"
                    />
                  )}
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Section: Varejo & Destino */}
            <BlurFade delay={0.17}>
              <RetailFieldsSection
                deliverableKind={deliverableKind}
                onDeliverableKindChange={setDeliverableKind}
                destinationScope={destinationScope}
                onDestinationScopeChange={setDestinationScope}
                channels={channels}
                onChannelsChange={setChannels}
              />
            </BlurFade>

            {/* Section: Atribuição e Prazos */}
            <BlurFade delay={0.2}>
              <PremiumGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Atribuição e Prazos</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                      "justify-between h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {selectedUser ? (
                                      <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {selectedUser.profiles?.full_name || selectedUser.profiles?.email}
                                      </span>
                                    ) : (
                                      "Selecione um responsável"
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
                      name="due_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Prazo</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal h-10",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Selecione uma data</span>
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Section: Vínculos */}
            <BlurFade delay={0.25}>
              <PremiumGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Vínculos (Opcional)</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="campaign_id"
                      render={({ field }) => {
                        const selectedCampaign = campaigns?.find(c => c.id === field.value);
                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel>Campanha</FormLabel>
                            <Popover open={campaignOpen} onOpenChange={setCampaignOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "justify-between h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {selectedCampaign?.name || "Vincular campanha"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar campanha..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      {campaignsLoading ? "Carregando..." : "Nenhuma campanha encontrada."}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {campaigns?.map((c) => (
                                        <CommandItem
                                          key={c.id}
                                          value={c.name}
                                          onSelect={() => {
                                            field.onChange(c.id);
                                            setCampaignOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === c.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {c.name}
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
                      name="document_id"
                      render={({ field }) => {
                        const selectedDoc = documents?.find(d => d.id === field.value);
                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel>Documento</FormLabel>
                            <Popover open={documentOpen} onOpenChange={setDocumentOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "justify-between h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {selectedDoc?.title || "Vincular documento"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar documento..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      {documentsLoading ? "Carregando..." : "Nenhum documento encontrado."}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {documents?.map((doc) => (
                                        <CommandItem
                                          key={doc.id}
                                          value={doc.title}
                                          onSelect={() => {
                                            field.onChange(doc.id);
                                            setDocumentOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === doc.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {doc.icon && <span className="mr-2">{doc.icon}</span>}
                                          {doc.title}
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
                  </div>
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Section: Tags */}
            <BlurFade delay={0.3}>
              <PremiumGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tags className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Tags (Opcional)</h3>
                </div>
                <TagInput
                  value={tags}
                  onChange={setTags}
                  placeholder="Adicione tags e pressione Enter"
                />
              </PremiumGlassCard>
            </BlurFade>

            {/* Submit */}
            <BlurFade delay={0.35}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {autoSaveStatus === 'saving' && (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Salvando...</>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Salvo automaticamente</>
                  )}
                  {autoSaveStatus === 'error' && (
                    <><CloudOff className="h-3.5 w-3.5 text-destructive" /> Erro ao salvar</>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateDemand.isPending}
                    className="bg-app-gestao hover:bg-app-gestao/90"
                  >
                    {updateDemand.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar e Voltar"
                    )}
                  </Button>
                </div>
              </div>
            </BlurFade>
          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}
