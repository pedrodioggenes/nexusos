import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Headphones,
  FileText,
  Loader2,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────
interface ModuleConfig {
  moduleName: string;
  moduleColor: string; // tailwind token e.g. "module-gestao"
}

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";

interface MockTicket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastUpdate: string;
  category: string;
}

// ─── Mock data ─────────────────────────────────────────────────────
const mockTickets: MockTicket[] = [
  {
    id: "TK-001",
    title: "Erro ao exportar relatório em PDF",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-03-01",
    lastUpdate: "2026-03-03",
    category: "Bug",
  },
  {
    id: "TK-002",
    title: "Dúvida sobre configuração de alertas",
    status: "resolved",
    priority: "low",
    createdAt: "2026-02-28",
    lastUpdate: "2026-03-02",
    category: "Dúvida",
  },
  {
    id: "TK-003",
    title: "Solicitar acesso ao aplicativo financeiro",
    status: "open",
    priority: "medium",
    createdAt: "2026-03-04",
    lastUpdate: "2026-03-04",
    category: "Solicitação",
  },
];

const faqItems = [
  {
    question: "Como redefinir minha senha?",
    answer:
      "Acesse a tela de login e clique em 'Esqueci minha senha'. Você receberá um e-mail com instruções para redefinir.",
  },
  {
    question: "Onde encontro os relatórios exportados?",
    answer:
      "Os relatórios exportados ficam disponíveis na seção de Relatórios do aplicativo correspondente. Clique no ícone de download para baixar o arquivo.",
  },
  {
    question: "Como adicionar um novo usuário ao sistema?",
    answer:
      "Apenas administradores podem adicionar novos usuários. Acesse Configurações > Usuários > Novo Usuário e preencha os dados necessários.",
  },
  {
    question: "O que significam os indicadores do dashboard?",
    answer:
      "Consulte o Glossário de Siglas e Indicadores disponível em Suporte > Manuais de Uso para uma explicação detalhada de cada KPI.",
  },
  {
    question: "Como entrar em contato com o suporte técnico?",
    answer:
      "Você pode abrir um chamado nesta página, usar o chat ao vivo ou enviar um e-mail para suporte@araripe.me.",
  },
  {
    question: "Posso personalizar os alertas que recebo?",
    answer:
      "Sim. Acesse Configurações > Notificações e selecione quais tipos de alerta deseja receber por e-mail ou dentro do sistema.",
  },
];

// ─── Helper components ─────────────────────────────────────────────
const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  open: { label: "Aberto", variant: "destructive", icon: AlertCircle },
  in_progress: { label: "Em Andamento", variant: "default", icon: Clock },
  resolved: { label: "Resolvido", variant: "secondary", icon: CheckCircle2 },
  closed: { label: "Fechado", variant: "outline", icon: CheckCircle2 },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "text-muted-foreground" },
  medium: { label: "Média", className: "text-amber-500" },
  high: { label: "Alta", className: "text-orange-500" },
  critical: { label: "Crítica", className: "text-destructive" },
};

// ─── Chat message type ─────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Main component ────────────────────────────────────────────────
export default function SuporteTecnicoPage({ moduleName, moduleColor }: ModuleConfig) {
  const [activeTab, setActiveTab] = useState("tickets");
  const [ticketSearch, setTicketSearch] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  // New ticket form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Olá! Sou o assistente de suporte técnico do ${moduleName}. Como posso ajudar você hoje?`,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // FAQ search
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredTickets = mockTickets.filter((t) =>
    t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.id.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  const filteredFaq = faqItems.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleNewTicketSubmit = () => {
    if (!newTitle.trim() || !newCategory || !newPriority || !newDescription.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    toast.success("Chamado criado com sucesso! Você receberá uma confirmação por e-mail.");
    setShowNewTicket(false);
    setNewTitle("");
    setNewCategory("");
    setNewPriority("");
    setNewDescription("");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Obrigado pela sua mensagem. Estou analisando sua questão. Em breve um membro da equipe técnica poderá dar continuidade ao atendimento. Enquanto isso, verifique se a seção de FAQ pode ajudar com sua dúvida.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setChatLoading(false);
    }, 1500);
  };

  const handleContactSubmit = () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      toast.error("Preencha todos os campos do formulário");
      return;
    }
    toast.success("Mensagem enviada com sucesso! Nossa equipe retornará em até 24h úteis.");
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Suporte Técnico"
        description={`Central de suporte e atendimento técnico do aplicativo ${moduleName}`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="tickets" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Chamados
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5 text-xs">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="contato" className="gap-1.5 text-xs">
            <Headphones className="h-3.5 w-3.5" />
            Contato
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB: Chamados ──────────────────────────────────────── */}
        <TabsContent value="tickets" className="space-y-4 mt-4">
          {!showNewTicket ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar chamados..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowNewTicket(true)}
                  className={cn("gap-1.5 text-xs", `bg-${moduleColor} hover:bg-${moduleColor}/90`)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo Chamado
                </Button>
              </div>

              <div className="space-y-2">
                {filteredTickets.length === 0 ? (
                  <SolidCard>
                    <div className="p-8 text-center">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhum chamado encontrado</p>
                    </div>
                  </SolidCard>
                ) : (
                  filteredTickets.map((ticket) => {
                    const status = statusConfig[ticket.status];
                    const priority = priorityConfig[ticket.priority];
                    const StatusIcon = status.icon;
                    return (
                      <SolidCard key={ticket.id} hoverable className="cursor-pointer group">
                        <div className="p-4 flex items-center gap-4">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", `bg-${moduleColor}/10`)}>
                            <StatusIcon className={cn("h-4.5 w-4.5", `text-${moduleColor}`)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
                              <Badge variant={status.variant} className="text-[10px] h-5 px-1.5">
                                {status.label}
                              </Badge>
                              <span className={cn("text-[10px] font-medium", priority.className)}>
                                {priority.label}
                              </span>
                            </div>
                            <h4 className="text-xs font-medium text-foreground truncate">{ticket.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                Aberto: {ticket.createdAt}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Atualizado: {ticket.lastUpdate}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {ticket.category}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </SolidCard>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* ─── New Ticket Form ─────────────────────────────── */
            <SolidCard>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Novo Chamado</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewTicket(false)} className="text-xs">
                    Cancelar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Título *</label>
                    <Input
                      placeholder="Descreva o problema resumidamente"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Categoria *</label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">Bug / Erro</SelectItem>
                          <SelectItem value="duvida">Dúvida</SelectItem>
                          <SelectItem value="solicitacao">Solicitação</SelectItem>
                          <SelectItem value="melhoria">Sugestão de Melhoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Prioridade *</label>
                      <Select value={newPriority} onValueChange={setNewPriority}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Descrição detalhada *</label>
                  <Textarea
                    placeholder="Descreva o problema em detalhes: o que aconteceu, passos para reproduzir, resultado esperado..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="min-h-[120px] text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNewTicketSubmit}
                    className={cn("gap-1.5 text-xs", `bg-${moduleColor} hover:bg-${moduleColor}/90`)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar Chamado
                  </Button>
                </div>
              </div>
            </SolidCard>
          )}
        </TabsContent>

        {/* ─── TAB: FAQ ───────────────────────────────────────────── */}
        <TabsContent value="faq" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar na base de conhecimento..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="space-y-2">
            {filteredFaq.length === 0 ? (
              <SolidCard>
                <div className="p-8 text-center">
                  <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma pergunta encontrada</p>
                </div>
              </SolidCard>
            ) : (
              filteredFaq.map((faq, idx) => (
                <SolidCard
                  key={idx}
                  hoverable
                  className="cursor-pointer"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", `bg-${moduleColor}/10`)}>
                        <HelpCircle className={cn("h-4 w-4", `text-${moduleColor}`)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-foreground">{faq.question}</h4>
                        {expandedFaq === idx && (
                          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                          expandedFaq === idx && "rotate-90"
                        )}
                      />
                    </div>
                  </div>
                </SolidCard>
              ))
            )}
          </div>
        </TabsContent>

        {/* ─── TAB: Chat ──────────────────────────────────────────── */}
        <TabsContent value="chat" className="mt-4">
          <SolidCard>
            <div className="flex flex-col h-[480px]">
              {/* Chat header */}
              <div className={cn("px-4 py-3 border-b border-border flex items-center gap-2")}>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", `bg-${moduleColor}/10`)}>
                  <Bot className={cn("h-4 w-4", `text-${moduleColor}`)} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Assistente de Suporte</p>
                  <p className="text-[10px] text-muted-foreground">Online • Tempo médio de resposta: 2min</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
                        msg.role === "user"
                          ? `bg-${moduleColor} text-white`
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.content}
                      <p
                        className={cn(
                          "text-[9px] mt-1",
                          msg.role === "user" ? "text-white/60" : "text-muted-foreground"
                        )}
                      >
                        {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Digitando...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="px-4 py-3 border-t border-border flex items-center gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                  className="h-9 text-xs flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading}
                  className={cn("h-9 w-9 p-0", `bg-${moduleColor} hover:bg-${moduleColor}/90`)}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </SolidCard>
        </TabsContent>

        {/* ─── TAB: Contato ───────────────────────────────────────── */}
        <TabsContent value="contato" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <SolidCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className={cn("h-5 w-5", `text-${moduleColor}`)} />
                    <h3 className="text-sm font-semibold text-foreground">Formulário de Contato</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Nome completo *</label>
                      <Input
                        placeholder="Seu nome"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">E-mail *</label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Assunto *</label>
                    <Input
                      placeholder="Assunto da mensagem"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Mensagem *</label>
                    <Textarea
                      placeholder="Descreva em detalhes como podemos ajudá-lo..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="min-h-[140px] text-xs resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleContactSubmit}
                      className={cn("gap-1.5 text-xs", `bg-${moduleColor} hover:bg-${moduleColor}/90`)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </div>
              </SolidCard>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-3">
              <SolidCard>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">Canais de Atendimento</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", `text-${moduleColor}`)} />
                      <div>
                        <p className="text-[11px] font-medium text-foreground">Chat ao Vivo</p>
                        <p className="text-[10px] text-muted-foreground">Seg–Sex, 8h às 18h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Headphones className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", `text-${moduleColor}`)} />
                      <div>
                        <p className="text-[11px] font-medium text-foreground">Telefone</p>
                        <p className="text-[10px] text-muted-foreground">(11) 4000-0000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Send className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", `text-${moduleColor}`)} />
                      <div>
                        <p className="text-[11px] font-medium text-foreground">E-mail</p>
                        <p className="text-[10px] text-muted-foreground">suporte@araripe.me</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SolidCard>

              <SolidCard>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">SLA de Atendimento</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">Crítica</span>
                      <span className="text-[10px] font-medium text-destructive">≤ 2h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">Alta</span>
                      <span className="text-[10px] font-medium text-orange-500">≤ 4h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">Média</span>
                      <span className="text-[10px] font-medium text-amber-500">≤ 24h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">Baixa</span>
                      <span className="text-[10px] font-medium text-muted-foreground">≤ 48h</span>
                    </div>
                  </div>
                </div>
              </SolidCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
