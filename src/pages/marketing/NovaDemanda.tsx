import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Target,
  Clock,
  Link2,
  Tags,
  Store,
  ClipboardList,
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
  useCreateDemand,
} from "@/hooks/useMarketingDemands";
import { useMarketingCampaigns } from "@/hooks/useMarketingCampaigns";
import { useWorkspacePages } from "@/hooks/useWorkspacePages";
import { DemandRichEditor } from "@/components/marketing/demands/DemandRichEditor";
import { RetailFieldsSection } from "@/components/marketing/demands/RetailFieldsSection";
import { TagInput } from "@/components/ui/tag-input";
import { useDraftPersistence } from "@/hooks/useDraftPersistence";

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

export default function NovaDemanda() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [deliverableKind, setDeliverableKind] = useState("none");
  const [destinationScope, setDestinationScope] = useState("none");
  const [channels, setChannels] = useState<string[]>([]);
  
  const createDemand = useCreateDemand();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: campaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: documents, isLoading: documentsLoading } = useWorkspacePages();

  const [draft, setDraft, clearDraft] = useDraftPersistence<{
    title: string;
    type: string;
    priority: string;
    assigned_to?: string;
    campaign_id?: string;
    document_id?: string;
    tags: string[];
    due_date?: string;
    descriptionContent: unknown[];
    deliverableKind: string;
    destinationScope: string;
    channels: string[];
  }>("draft_nova_demanda", {
    title: "",
    type: "general",
    priority: "medium",
    tags: [],
    descriptionContent: [],
    deliverableKind: "none",
    destinationScope: "none",
    channels: [],
  });

  const [descriptionContent, setDescriptionContent] = useState<unknown[]>(draft.descriptionContent || []);
  const [tags, setTags] = useState<string[]>(draft.tags || []);

  useEffect(() => {
    if (draft.deliverableKind && draft.deliverableKind !== "none") setDeliverableKind(draft.deliverableKind);
    if (draft.destinationScope && draft.destinationScope !== "none") setDestinationScope(draft.destinationScope);
    if (draft.channels && draft.channels.length > 0) setChannels(draft.channels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDescriptionChange = useCallback((content: unknown[]) => {
    setDescriptionContent(content);
    setDraft(prev => ({ ...prev, descriptionContent: content }));
  }, [setDraft]);

  const paramType = searchParams.get("type") as DemandType | null;
  const paramDueDate = searchParams.get("due_date");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: draft.title || "",
      description: undefined,
      type: (paramType || draft.type || "general") as DemandType,
      assigned_to: draft.assigned_to || undefined,
      priority: (draft.priority || "medium") as DemandPriority,
      campaign_id: draft.campaign_id || undefined,
      document_id: draft.document_id || undefined,
      tags: draft.tags || [],
      due_date: paramDueDate
        ? new Date(paramDueDate + "T12:00:00")
        : draft.due_date
        ? new Date(draft.due_date)
        : undefined,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setDraft(prev => ({
        ...prev,
        title: values.title || "",
        type: values.type || "general",
        priority: values.priority || "medium",
        assigned_to: values.assigned_to || undefined,
        campaign_id: values.campaign_id || undefined,
        document_id: values.document_id || undefined,
        due_date: values.due_date ? values.due_date.toISOString() : undefined,
      }));
    });
    return () => subscription.unsubscribe();
  }, [form, setDraft]);

  useEffect(() => {
    setDraft(prev => ({ ...prev, tags }));
  }, [tags, setDraft]);

  useEffect(() => {
    setDraft(prev => ({ ...prev, deliverableKind, destinationScope, channels }));
  }, [deliverableKind, destinationScope, channels, setDraft]);

  const onSubmit = async (data: FormData) => {
    const descriptionValue = descriptionContent.length > 0
      ? JSON.stringify(descriptionContent)
      : undefined;

    await createDemand.mutateAsync({
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
    });

    clearDraft();
    navigate('/app/marketing/demandas');
  };

  const handleCancel = () => {
    navigate('/app/marketing/demandas');
  };

  return (
    <PageWrapper
      title="Nova Demanda"
      subtitle="Crie uma nova demanda para a equipe de marketing"
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
            
            {/* Card 1: Diretrizes da Demanda */}
            <BlurFade delay={0.1}>
              <PremiumGlassCard className="p-6">
                {/* ── 📄 Identificação ── */}
                <div className="flex items-center gap-2 mb-5">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Diretrizes da Demanda</h3>
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

                {/* ── 🏪 Classificação & Destino ── */}
                <div className="border-t border-border/50 mt-6 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Classificação & Destino</h4>
                  </div>
                  <RetailFieldsSection
                    deliverableKind={deliverableKind}
                    onDeliverableKindChange={setDeliverableKind}
                    destinationScope={destinationScope}
                    onDestinationScopeChange={setDestinationScope}
                    channels={channels}
                    onChannelsChange={setChannels}
                  />
                </div>

                {/* ── ⏱ Atribuição & Prazos ── */}
                <div className="border-t border-border/50 mt-6 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Atribuição & Prazos</h4>
                  </div>
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
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── 🔗 Vínculos ── */}
                <div className="border-t border-border/50 mt-6 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Vínculos</h4>
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
                                      aria-expanded={campaignOpen}
                                      className={cn(
                                        "justify-between h-10",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {selectedCampaign ? (
                                        <span className="flex items-center gap-2">
                                          <Target className="h-4 w-4" />
                                          {selectedCampaign.name}
                                        </span>
                                      ) : (
                                        "Nenhuma campanha"
                                      )}
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
                                        <CommandItem
                                          value=""
                                          onSelect={() => {
                                            field.onChange(undefined);
                                            setCampaignOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              !field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className="text-muted-foreground">Nenhuma</span>
                                        </CommandItem>
                                        {campaigns?.map((campaign) => (
                                          <CommandItem
                                            key={campaign.id}
                                            value={campaign.name}
                                            onSelect={() => {
                                              field.onChange(campaign.id);
                                              setCampaignOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === campaign.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{campaign.name}</span>
                                          </CommandItem>
                                        ))}</CommandGroup>
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
                          const selectedDocument = documents?.find(d => d.id === field.value);
                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>Documento</FormLabel>
                              <Popover open={documentOpen} onOpenChange={setDocumentOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={documentOpen}
                                      className={cn(
                                        "justify-between h-10",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {selectedDocument ? (
                                        <span className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          {selectedDocument.title}
                                        </span>
                                      ) : (
                                        "Nenhum documento"
                                      )}
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
                                        <CommandItem
                                          value=""
                                          onSelect={() => {
                                            field.onChange(undefined);
                                            setDocumentOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              !field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className="text-muted-foreground">Nenhum</span>
                                        </CommandItem>
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
                                            <span className="mr-2">{doc.icon || "📄"}</span>
                                            <span>{doc.title}</span>
                                          </CommandItem>
                                        ))}</CommandGroup>
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

                    {/* Tags */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        <FormLabel>Tags</FormLabel>
                      </div>
                      <TagInput
                        value={tags}
                        onChange={setTags}
                        placeholder="Adicionar tag (pressione Enter)"
                        maxTags={10}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use tags para categorizar e facilitar buscas futuras
                      </p>
                    </div>
                  </div>
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Card 2: Detalhamento */}
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
                  <DemandRichEditor
                    onChange={handleDescriptionChange}
                    placeholder="Descreva os detalhes da demanda... Arraste imagens ou use / para comandos"
                    minHeight="350px"
                  />
                </div>
              </PremiumGlassCard>
            </BlurFade>

            {/* Actions */}
            <BlurFade delay={0.2}>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDemand.isPending} className="min-w-[140px]">
                  {createDemand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Demanda
                </Button>
              </div>
            </BlurFade>
          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}
