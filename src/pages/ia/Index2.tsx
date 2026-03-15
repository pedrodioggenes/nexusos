import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNexusIA, Conversation, StoredMessage, PendingAction } from '@/hooks/useNexusIA';
import { ChatShell2 } from '@/components/chat/ChatShell2';
import type { ChatMessage, ChatThread, UploadedFile, ThinkingMode, AIModel } from '@/components/chat/types';
import { AVAILABLE_MODELS } from '@/components/chat/ThinkingModeSelector';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/components/ia/KeyboardShortcuts';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * NexusIA Page 2 - ChatGPT-style AI assistant
 * Uses the new modular chat architecture with fixed sidebar height
 */
export default function IAHome() {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayStatus, setDisplayStatus] = useState<string | null>(null);
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode>('standard');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-flash');
  const [connectedToolGroups, setConnectedToolGroups] = useState<string[]>([]);
  
  const currentConversationIdRef = useRef<string | null>(null);
  const fullResponseRef = useRef('');
  const localMessagesRef = useRef<ChatMessage[]>([]);

  const { 
    sendMessage, 
    isLoading, 
    isLoadingConversations,
    conversations,
    activeConversationId,
    createConversation,
    updateConversation,
    renameConversation,
    deleteConversation,
    selectConversation,
    getActiveConversation,
    generateSmartTitle,
    sendMessageStreaming,
    cancelStreaming,
    currentStatus,
    parseActions,
    cleanContentForDisplay,
    executeAction,
    submitFeedback,
    searchConversations,
    regenerateLastMessage,
    editAndRegenerate,
  } = useNexusIA();

  // Global unhandled promise rejection handler to prevent silent crashes
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('NexusIA - Unhandled promise rejection:', event.reason);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // Keep latest localMessages for effects without adding it as a dependency
  useEffect(() => {
    localMessagesRef.current = localMessages;
  }, [localMessages]);

  // Sync local messages with active conversation
  useEffect(() => {
    const activeConversation = getActiveConversation();
    const optimistic = localMessagesRef.current;

    if (activeConversation) {
      const activeMessages = (activeConversation.messages as unknown as ChatMessage[]) || [];

      // Prevent the "flash" where a newly-created conversation overwrites our optimistic
      // first message with an empty array until the backend update completes.
      if (
        currentConversationIdRef.current === activeConversationId &&
        optimistic.length > 0 &&
        activeMessages.length === 0
      ) {
        return;
      }

      setLocalMessages(activeMessages);
      return;
    }

    // Also avoid wiping optimistic messages during the tiny window after creation.
    if (currentConversationIdRef.current && optimistic.length > 0) return;
    setLocalMessages([]);
  }, [activeConversationId, getActiveConversation]);

  // Keyboard shortcuts
  const handleNewConversation = useCallback(async () => {
    await createConversation();
    setLocalMessages([]);
  }, [createConversation]);

  useKeyboardShortcuts({
    newChat: handleNewConversation,
    toggleSidebar: () => {},
    toggleTheme: () => {},
    cancelStreaming: () => isStreaming && cancelStreaming(),
    regenerate: () => {
      let lastAssistantIndex = -1;
      for (let i = localMessages.length - 1; i >= 0; i--) {
        if (localMessages[i].role === 'assistant') {
          lastAssistantIndex = i;
          break;
        }
      }
      if (lastAssistantIndex >= 0) {
        handleRegenerate(lastAssistantIndex);
      }
    },
    openShortcuts: () => {},
  }, true);

  // Handle sending messages
  const handleSendMessage = useCallback(async (message: string, files?: UploadedFile[]) => {
    if (!message.trim() || isLoading) return;

    let currentConversationId = activeConversationId;

    if (!currentConversationId) {
      const newId = await createConversation();
      if (!newId) {
        console.error('Failed to create conversation');
        return;
      }
      currentConversationId = newId;
    }

    currentConversationIdRef.current = currentConversationId;
    fullResponseRef.current = '';

    // Build message content with file references
    let messageContent = message.trim();
    if (files && files.length > 0) {
      const fileRefs = files.map(f => `[Anexo: ${f.name}](${f.url})`).join('\n');
      messageContent = `${messageContent}\n\n${fileRefs}`;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      attachments: files,
    };

    const newMessages = [...localMessages, userMessage];
    setLocalMessages(newMessages);

    // Persist the user message immediately (ChatGPT-like: no data loss if the user refreshes)
    // and so the sidebar can reflect the new conversation state ASAP.
    void updateConversation(currentConversationId!, newMessages as unknown as StoredMessage[]);

    const isFirstMessage = localMessages.length === 0;
    // Use AI-generated smart title for first message
    let title: string | undefined;
    if (isFirstMessage) {
      title = await generateSmartTitle(message);

      // Update the title as soon as we have it (so it appears in the sidebar immediately)
      if (title) {
        void renameConversation(currentConversationId!, title);
      }
    }

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    };

    const messagesWithAssistant = [...newMessages, assistantMessage];
    setLocalMessages(messagesWithAssistant);

    setIsStreaming(true);
    setDisplayStatus(null);

    try {
      await sendMessageStreaming(
        currentConversationId,
        newMessages as unknown as StoredMessage[],
        (delta) => {
          fullResponseRef.current += delta;
          setLocalMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: fullResponseRef.current };
            }
            return updated;
          });
        },
        (status) => {
          setDisplayStatus(status);
        },
        async (responseTime, tokenCount) => {
          setIsStreaming(false);
          setDisplayStatus(null);
          
          const finalContent = fullResponseRef.current || 'Não foi possível obter uma resposta.';
          
          const actions = parseActions(finalContent);
          const cleanContent = cleanContentForDisplay(finalContent);
          
          const finalMessage: ChatMessage = {
            ...assistantMessage,
            content: cleanContent,
            status: 'done',
            pendingActions: actions.length > 0 ? actions as any : undefined,
            responseTime,
            tokenCount,
          };
          
          setLocalMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = finalMessage;
            return updated;
          });
          
          await updateConversation(currentConversationId!, [...newMessages, finalMessage] as unknown as StoredMessage[], title);
        },
        async () => {
          setIsStreaming(false);
          setDisplayStatus(null);
          if (fullResponseRef.current) {
            const partialContent = fullResponseRef.current + '\n\n*[Resposta cancelada pelo usuário]*';
            const finalMessages = [...newMessages, {
              ...assistantMessage,
              content: partialContent,
              status: 'done' as const,
            }];
            await updateConversation(currentConversationId!, finalMessages as unknown as StoredMessage[], title);
          }
        },
        thinkingMode,
        connectedToolGroups,
        AVAILABLE_MODELS.find(m => m.id === selectedModel)?.apiModel
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
      setDisplayStatus(null);
      
      let errorContent = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast.error('Limite de requisições atingido', {
            description: 'Aguarde alguns segundos e tente novamente.',
          });
        } else if (error.message.includes('402')) {
          toast.error('Créditos de IA esgotados', {
            description: 'Entre em contato com o administrador para adicionar créditos.',
          });
        } else {
          toast.error('Erro ao processar mensagem', {
            description: error.message || 'Tente novamente em alguns instantes.'
          });
        }
        errorContent = error.message;
      }
      
      setLocalMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === 'assistant') {
          updated[lastIdx] = { ...updated[lastIdx], content: errorContent, status: 'error' };
        }
        return updated;
      });
      
      await updateConversation(currentConversationId, [...newMessages, {
        ...assistantMessage,
        content: errorContent,
        status: 'error',
      }] as unknown as StoredMessage[], title);
    }
  }, [
    activeConversationId, 
    createConversation, 
    isLoading, 
    localMessages, 
    generateSmartTitle,
    renameConversation,
    sendMessageStreaming,
    parseActions,
    cleanContentForDisplay,
    updateConversation,
  ]);

  // Handle regenerate
  const handleRegenerate = useCallback(async (messageIndex: number) => {
    if (!activeConversationId) return;

    const messagesUpToWithAssistant = localMessages.slice(0, messageIndex + 1);
    const messagesUpTo = messagesUpToWithAssistant.slice(0, -1);

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    };

    setLocalMessages([...messagesUpTo, assistantMessage]);
    setIsStreaming(true);
    setDisplayStatus(null);
    fullResponseRef.current = '';
    currentConversationIdRef.current = activeConversationId;

    try {
      await regenerateLastMessage(
        activeConversationId,
        messagesUpToWithAssistant as unknown as StoredMessage[],
        (delta) => {
          fullResponseRef.current += delta;
          setLocalMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: fullResponseRef.current };
            }
            return updated;
          });
        },
        (status) => setDisplayStatus(status),
        async (responseTime, tokenCount) => {
          setIsStreaming(false);
          setDisplayStatus(null);

          const finalContent = fullResponseRef.current || 'Não foi possível obter uma resposta.';
          const actions = parseActions(finalContent);
          const cleanContent = cleanContentForDisplay(finalContent);

          const finalMessage: ChatMessage = {
            ...assistantMessage,
            content: cleanContent,
            status: 'done',
            pendingActions: actions.length > 0 ? actions as any : undefined,
            responseTime,
            tokenCount,
          };

          const finalMessages = [...messagesUpTo, finalMessage];
          setLocalMessages(finalMessages);
          await updateConversation(activeConversationId, finalMessages as unknown as StoredMessage[]);

          toast.success('Resposta regenerada');
        }
      );
    } catch (error) {
      console.error('Error regenerating:', error);
      setIsStreaming(false);
      toast.error('Erro ao regenerar resposta');
    }
  }, [
    activeConversationId, 
    localMessages, 
    regenerateLastMessage,
    parseActions,
    cleanContentForDisplay,
    updateConversation,
  ]);

  // Handle edit message
  const handleEditMessage = useCallback(async (index: number, newContent: string) => {
    if (!activeConversationId) return;
    
    const messagesUpTo = localMessages.slice(0, index);
    const editedMessage: ChatMessage = {
      ...localMessages[index],
      content: newContent,
    };
    
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    };

    setLocalMessages([...messagesUpTo, editedMessage, assistantMessage]);
    setIsStreaming(true);
    setDisplayStatus(null);
    fullResponseRef.current = '';
    currentConversationIdRef.current = activeConversationId;

    try {
      await editAndRegenerate(
        activeConversationId,
        [...messagesUpTo, editedMessage] as unknown as StoredMessage[],
        index,
        newContent,
        (delta) => {
          fullResponseRef.current += delta;
          setLocalMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: fullResponseRef.current };
            }
            return updated;
          });
        },
        (status) => setDisplayStatus(status),
        async (responseTime, tokenCount) => {
          setIsStreaming(false);
          setDisplayStatus(null);
          
          const finalContent = fullResponseRef.current || 'Não foi possível obter uma resposta.';
          const actions = parseActions(finalContent);
          const cleanContent = cleanContentForDisplay(finalContent);
          
          const finalMessage: ChatMessage = {
            ...assistantMessage,
            content: cleanContent,
            status: 'done',
            pendingActions: actions.length > 0 ? actions as any : undefined,
            responseTime,
            tokenCount,
          };
          
          const finalMessages = [...messagesUpTo, editedMessage, finalMessage];
          setLocalMessages(finalMessages);
          await updateConversation(activeConversationId, finalMessages as unknown as StoredMessage[]);
        }
      );
    } catch (error) {
      console.error('Error editing message:', error);
      setIsStreaming(false);
      toast.error('Erro ao reenviar mensagem');
    }
  }, [
    activeConversationId,
    localMessages,
    editAndRegenerate,
    parseActions,
    cleanContentForDisplay,
    updateConversation,
  ]);

  // Handle feedback
  const handleFeedback = useCallback(async (index: number, type: 'like' | 'dislike') => {
    if (!activeConversationId) return;
    
    const success = await submitFeedback(activeConversationId, index, type);
    if (success) {
      setLocalMessages(prev => prev.map((msg, idx) => 
        idx === index ? { ...msg, feedback: type } : msg
      ));
      toast.success(type === 'like' ? 'Obrigado pelo feedback!' : 'Feedback registrado');
    }
  }, [activeConversationId, submitFeedback]);

  // Handle action confirmation
  const handleConfirmAction = useCallback(async (messageId: string, action: PendingAction) => {
    setProcessingActionId(action.id);
    
    try {
      const result = await executeAction(action);
      
      setLocalMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.pendingActions) {
          return {
            ...msg,
            pendingActions: msg.pendingActions.map(a => 
              a.id === action.id ? { ...a, confirmed: true } : a
            ),
            content: msg.content + `\n\n---\n✅ **Ação executada:** ${result}`
          };
        }
        return msg;
      }));
      
      toast.success('Ação executada com sucesso!');
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Erro ao executar ação');
    } finally {
      setProcessingActionId(null);
    }
  }, [executeAction]);

  // Handle action rejection
  const handleRejectAction = useCallback((messageId: string, actionId: string) => {
    setLocalMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.pendingActions) {
        return {
          ...msg,
          pendingActions: msg.pendingActions.filter(a => a.id !== actionId),
          content: msg.content + '\n\n---\n❌ *Ação cancelada pelo usuário*'
        };
      }
      return msg;
    }));
    
    toast.info('Ação cancelada');
  }, []);

  // Search adapter
  const searchConversationsAdapter = useCallback((query: string): ChatThread[] => {
    const results = searchConversations(query);
    return results as unknown as ChatThread[];
  }, [searchConversations]);

  return (
    <ErrorBoundary>
      <ChatShell2
        conversations={conversations as unknown as ChatThread[]}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        isLoadingConversations={isLoadingConversations}
        currentStatus={currentStatus}
        onCreateConversation={createConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        onSendMessage={handleSendMessage}
        onCancelStreaming={cancelStreaming}
        onRegenerate={handleRegenerate}
        onEditMessage={handleEditMessage}
        onFeedback={handleFeedback}
        onConfirmAction={handleConfirmAction}
        onRejectAction={handleRejectAction}
        searchConversations={searchConversationsAdapter}
        isStreaming={isStreaming}
        localMessages={localMessages}
        displayStatus={displayStatus}
        processingActionId={processingActionId}
        thinkingMode={thinkingMode}
        onThinkingModeChange={setThinkingMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onConnectedToolsChange={(_ids, groups) => setConnectedToolGroups(groups)}
        onNewChat={handleNewConversation}
      />
    </ErrorBoundary>
  );
}
