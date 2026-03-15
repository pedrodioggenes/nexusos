import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, ArrowLeft, Clock, Eye, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';

interface SharedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface SharedConversationData {
  id: string;
  title: string;
  messages: SharedMessage[];
  created_at: string;
  updated_at: string;
  share_token: string;
  view_count: number;
  created_by_name?: string;
}

export default function SharedConversation() {
  const { token } = useParams<{ token: string }>();
  const [conversation, setConversation] = useState<SharedConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (token) {
      fetchSharedConversation(token);
    }
  }, [token]);

  const fetchSharedConversation = async (shareToken: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch shared conversation
      const { data: shared, error: sharedError } = await (supabase as any)
        .from('ia_shared_conversations')
        .select(`
          id,
          conversation_id,
          share_token,
          view_count,
          created_at,
          is_active,
          expires_at
        `)
        .eq('share_token', shareToken)
        .eq('is_active', true)
        .single();

      if (sharedError || !shared) {
        setError('Conversa não encontrada ou expirada');
        return;
      }

      // Check if expired
      if (shared.expires_at && new Date(shared.expires_at) < new Date()) {
        setError('Este link de compartilhamento expirou');
        return;
      }

      // Fetch the actual conversation
      const { data: conv, error: convError } = await (supabase as any)
        .from('ia_conversations')
        .select('id, title, messages, created_at, updated_at')
        .eq('id', shared.conversation_id)
        .single();

      if (convError || !conv) {
        setError('Conversa não encontrada');
        return;
      }

      // Increment view count (fire and forget)
      (supabase as any)
        .from('ia_shared_conversations')
        .update({ view_count: (shared.view_count || 0) + 1 })
        .eq('id', shared.id)
        .then(() => {});

      // Parse messages from JSON
      const messages = Array.isArray(conv.messages) 
        ? (conv.messages as Json[]).map(m => {
            if (typeof m === 'object' && m !== null && 'role' in m && 'content' in m) {
              return {
                role: (m as { role: string }).role as 'user' | 'assistant',
                content: (m as { content: string }).content,
                timestamp: 'timestamp' in m ? (m as { timestamp: string }).timestamp : undefined
              };
            }
            return null;
          }).filter(Boolean) as SharedMessage[]
        : [];

      setConversation({
        id: conv.id,
        title: conv.title,
        messages,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        share_token: shared.share_token,
        view_count: (shared.view_count || 0) + 1,
      });
    } catch (err) {
      console.error('Error fetching shared conversation:', err);
      setError('Erro ao carregar conversa');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isDarkMode ? 'bg-zinc-950' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-zinc-900' : 'bg-white',
    textPrimary: isDarkMode ? 'text-zinc-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-zinc-400' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-zinc-500' : 'text-gray-500',
    border: isDarkMode ? 'border-zinc-800' : 'border-gray-200',
    userMsgBg: isDarkMode ? 'bg-zinc-800' : 'bg-blue-500',
    userMsgText: isDarkMode ? 'text-zinc-100' : 'text-white',
  };

  if (loading) {
    return (
      <div className={cn("min-h-screen flex flex-col", theme.bg)}>
        <header className={cn("border-b p-4", theme.cardBg, theme.border)}>
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-3/4 ml-auto rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center", theme.bg)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-center p-8 rounded-2xl border max-w-md", theme.cardBg, theme.border)}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className={cn("text-xl font-semibold mb-2", theme.textPrimary)}>
            Link inválido
          </h1>
          <p className={cn("mb-6", theme.textSecondary)}>
            {error}
          </p>
          <Link to="/">
            <Button variant="outline" className={isDarkMode ? 'border-zinc-700' : ''}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className={cn("min-h-screen flex flex-col", theme.bg)}>
      {/* Header */}
      <header className={cn("border-b sticky top-0 z-10 backdrop-blur-sm", theme.cardBg, theme.border)}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={cn("font-semibold text-lg", theme.textPrimary)}>
                  {conversation.title}
                </h1>
                <div className={cn("flex items-center gap-3 text-xs", theme.textMuted)}>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(conversation.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {conversation.view_count} visualizações
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={theme.textSecondary}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Shared badge */}
      <div className={cn("border-b", theme.border)}>
        <div className="max-w-3xl mx-auto px-4 py-2">
          <div className={cn(
            "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit",
            isDarkMode ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"
          )}>
            <Share2 className="h-3 w-3" />
            <span>Conversa compartilhada com NexusIA</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {conversation.messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-6"
            >
              {message.role === 'user' ? (
                <div className="flex justify-end">
                  <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", theme.userMsgBg)}>
                    <p className={cn("text-[15px] whitespace-pre-wrap", theme.userMsgText)}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("prose prose-sm max-w-none", isDarkMode ? 'prose-invert' : '')}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeContent = String(children).replace(/\n$/, '');
                            
                            if (!inline && (match || codeContent.includes('\n'))) {
                              return (
                                <div className={cn("relative my-3 rounded-lg overflow-hidden", isDarkMode ? 'bg-zinc-800' : 'bg-gray-100')}>
                                  <div className={cn("flex items-center justify-between px-4 py-2 text-xs", isDarkMode ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-600')}>
                                    <span>{match ? match[1] : 'code'}</span>
                                  </div>
                                  <pre className="p-4 overflow-x-auto">
                                    <code className={cn("text-sm", isDarkMode ? 'text-zinc-200' : 'text-gray-800')} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code 
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-sm font-mono",
                                  isDarkMode ? 'bg-zinc-800 text-violet-300' : 'bg-gray-100 text-violet-600'
                                )} 
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          ul({ children }) {
                            return <ul className={cn("list-disc list-inside my-2 space-y-1", isDarkMode ? 'text-zinc-200' : 'text-gray-700')}>{children}</ul>;
                          },
                          ol({ children }) {
                            return <ol className={cn("list-decimal list-inside my-2 space-y-1", isDarkMode ? 'text-zinc-200' : 'text-gray-700')}>{children}</ol>;
                          },
                          li({ children }) {
                            return <li className="leading-relaxed">{children}</li>;
                          },
                          p({ children }) {
                            return <p className={cn("text-[15px] leading-relaxed mb-3 last:mb-0", isDarkMode ? 'text-zinc-200' : 'text-gray-700')}>{children}</p>;
                          },
                          strong({ children }) {
                            return <strong className={cn("font-semibold", isDarkMode ? 'text-zinc-100' : 'text-gray-900')}>{children}</strong>;
                          },
                          em({ children }) {
                            return <em className="italic">{children}</em>;
                          },
                          a({ href, children }) {
                            return (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
                              >
                                {children}
                              </a>
                            );
                          },
                          h1({ children }) {
                            return <h1 className={cn("text-xl font-bold mt-4 mb-2", isDarkMode ? 'text-zinc-100' : 'text-gray-900')}>{children}</h1>;
                          },
                          h2({ children }) {
                            return <h2 className={cn("text-lg font-bold mt-3 mb-2", isDarkMode ? 'text-zinc-100' : 'text-gray-900')}>{children}</h2>;
                          },
                          h3({ children }) {
                            return <h3 className={cn("text-base font-bold mt-3 mb-1", isDarkMode ? 'text-zinc-100' : 'text-gray-900')}>{children}</h3>;
                          },
                          blockquote({ children }) {
                            return (
                              <blockquote className={cn("border-l-4 pl-4 my-3 italic", isDarkMode ? 'border-violet-500 text-zinc-400' : 'border-violet-400 text-gray-600')}>
                                {children}
                              </blockquote>
                            );
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto my-3">
                                <table className={cn("min-w-full border-collapse", isDarkMode ? 'border-zinc-700' : 'border-gray-300')}>
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children }) {
                            return (
                              <th className={cn("border px-3 py-2 text-left font-semibold", isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-300 bg-gray-100')}>
                                {children}
                              </th>
                            );
                          },
                          td({ children }) {
                            return (
                              <td className={cn("border px-3 py-2", isDarkMode ? 'border-zinc-700' : 'border-gray-300')}>
                                {children}
                              </td>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <footer className={cn("border-t py-4", theme.border)}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className={cn("text-sm", theme.textMuted)}>
            Powered by <span className="font-semibold text-violet-400">NexusIA</span> — Assistente de IA do nexusOS
          </p>
          <Link 
            to="/" 
            className={cn(
              "text-xs mt-1 inline-block hover:underline",
              isDarkMode ? "text-zinc-500 hover:text-zinc-400" : "text-gray-500 hover:text-gray-600"
            )}
          >
            Saiba mais sobre a plataforma
          </Link>
        </div>
      </footer>
    </div>
  );
}
