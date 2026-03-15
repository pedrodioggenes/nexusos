import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Check, 
  FileText,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: 'execute' | 'clarify' | 'plan';
  isStreaming?: boolean;
}

interface DocumentAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageContent: string;
  onInsertContent: (markdown: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-ai-assistant`;

// Extract intent from response and clean content
function parseResponse(content: string): { intent: 'execute' | 'clarify' | 'plan' | null; cleanContent: string } {
  const intentMatch = content.match(/^\[INTENT:(execute|clarify|plan)\]/);
  if (intentMatch) {
    return {
      intent: intentMatch[1] as 'execute' | 'clarify' | 'plan',
      cleanContent: content.replace(/^\[INTENT:(execute|clarify|plan)\]\s*/, '').trim()
    };
  }
  return { intent: null, cleanContent: content };
}

// Extract markdown content for insertion (after headings, lists, etc.)
function extractInsertableContent(content: string): string | null {
  // Look for markdown content (headings, lists, tables)
  const hasMarkdown = /^#{1,6}\s|^\s*[-*]\s|^\s*\d+\.\s|^\|/m.test(content);
  if (!hasMarkdown) return null;
  
  // Find the first markdown element and return from there
  const lines = content.split('\n');
  let startIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s|^\s*[-*]\s|^\s*\d+\.\s|^\|/.test(lines[i])) {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex === -1) return null;
  
  return lines.slice(startIndex).join('\n').trim();
}

export function DocumentAIPanel({ 
  isOpen, 
  onClose, 
  pageTitle, 
  pageContent,
  onInsertContent 
}: DocumentAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStatus('Analisando seu pedido...');

    // Prepare messages for API
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content
    }));

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true
    }]);

    try {
      abortControllerRef.current = new AbortController();

      // Use user's JWT for proper auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Você precisa estar autenticado');
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: apiMessages,
          context: {
            pageTitle,
            pageContent: pageContent.substring(0, 2000) // Limit context size
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar solicitação');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setStatus('Gerando resposta...');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              
              // Parse intent and update message
              const { intent, cleanContent } = parseResponse(fullContent);
              
              setMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: cleanContent, intent: intent || undefined }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, continue buffering
          }
        }
      }

      // Finalize message
      const { intent, cleanContent } = parseResponse(fullContent);
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: cleanContent, intent: intent || undefined, isStreaming: false }
          : m
      ));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Cancelled by user
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      } else {
        console.error('Document AI error:', error);
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: 'Desculpe, ocorreu um erro. Tente novamente.', isStreaming: false }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      setStatus(null);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, pageTitle, pageContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInsert = (message: Message) => {
    const insertable = extractInsertableContent(message.content);
    if (insertable) {
      onInsertContent(insertable);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'execute': return <FileText className="h-3.5 w-3.5" />;
      case 'clarify': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'plan': return <ClipboardList className="h-3.5 w-3.5" />;
      default: return <Lightbulb className="h-3.5 w-3.5" />;
    }
  };

  const getIntentLabel = (intent?: string) => {
    switch (intent) {
      case 'execute': return 'Conteúdo gerado';
      case 'clarify': return 'Clarificação';
      case 'plan': return 'Plano proposto';
      default: return null;
    }
  };

  const suggestions = [
    "Crie uma introdução para este documento",
    "Adicione uma seção de objetivos",
    "Sugira melhorias para o conteúdo atual",
    "Crie um resumo executivo"
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-background border-l border-border z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">NexusIA • Geração de Conteúdo</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearConversation}
              title="Limpar conversa"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Como posso ajudar?</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Descreva o que você quer criar ou peça ajuda com o documento.
              </p>
              
              {/* Suggestions */}
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 text-sm transition-colors"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-xl px-3 py-2",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {/* Intent badge for assistant */}
                    {message.role === 'assistant' && message.intent && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/50">
                        {getIntentIcon(message.intent)}
                        <span className="text-xs text-muted-foreground">
                          {getIntentLabel(message.intent)}
                        </span>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className={cn(
                      "text-sm prose prose-sm max-w-none",
                      message.role === 'user' 
                        ? 'prose-invert' 
                        : 'prose-neutral dark:prose-invert'
                    )}>
                      {message.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content || (message.isStreaming ? '...' : '')}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* Streaming indicator */}
                    {message.isStreaming && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">
                          {status || 'Gerando...'}
                        </span>
                      </div>
                    )}

                    {/* Insert button for execute intent */}
                    {message.role === 'assistant' && 
                     !message.isStreaming && 
                     message.intent === 'execute' &&
                     extractInsertableContent(message.content) && (
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full gap-2"
                          onClick={() => handleInsert(message)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Inserir no Documento
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/30">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o que você quer criar..."
            className="min-h-[80px] max-h-[160px] pr-12 resize-none"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          A IA vai entender se você quer gerar diretamente ou precisa de ajuda para planejar.
        </p>
      </div>
    </motion.div>
  );
}
