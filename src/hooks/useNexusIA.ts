import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StoredMessage extends Message {
  id: string;
  timestamp: string;
  responseTime?: number;
  tokenCount?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  created_at: string;
  updated_at: string;
}

export interface PendingAction {
  id: string;
  type: 'create_campaign' | 'approve_proof' | 'reject_proof' | 'cancel_campaign';
  data: Record<string, any>;
  confirmed?: boolean;
}

export interface MessageFeedback {
  id: string;
  conversation_id: string;
  message_index: number;
  feedback_type: 'like' | 'dislike';
  feedback_text?: string;
}

export interface UserPreferences {
  id: string;
  display_name?: string;
  preferred_tone?: string;
  theme?: string;
  custom_instructions?: string;
}

export function useNexusIA() {
  const { user, tenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  
  // AbortController ref for canceling streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUserPreferences();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from('hiperia_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      const parsedConversations: Conversation[] = (data || []).map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        messages: Array.isArray(conv.messages) ? conv.messages : [],
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }));

      setConversations(parsedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load user preferences
  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('hiperia_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setUserPreferences(data as UserPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Save user preferences
  const saveUserPreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('hiperia_user_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving preferences:', error);
        return;
      }

      setUserPreferences(prev => prev ? { ...prev, ...prefs } : prefs as UserPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const createConversation = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('hiperia_conversations')
        .insert({
          user_id: user.id,
          tenant_id: tenant?.id || null,
          title: 'Nova conversa',
          messages: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      const newConversation: Conversation = {
        id: data.id,
        title: data.title,
        messages: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversation = async (
    conversationId: string, 
    messages: StoredMessage[], 
    title?: string
  ) => {
    try {
      // Cast messages to Json type for Supabase
      const messagesJson = messages as unknown as Json;
      
      const updateData: { messages: Json; title?: string } = { messages: messagesJson };
      if (title) {
        updateData.title = title;
      }

      const { error } = await supabase
        .from('hiperia_conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) {
        console.error('Error updating conversation:', error);
        return;
      }

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages, title: title || conv.title, updated_at: new Date().toISOString() }
            : conv
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  // Rename conversation
  const renameConversation = async (conversationId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('hiperia_conversations')
        .update({ title: newTitle })
        .eq('id', conversationId);

      if (error) {
        console.error('Error renaming conversation:', error);
        return false;
      }

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        )
      );
      return true;
    } catch (error) {
      console.error('Error renaming conversation:', error);
      return false;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('hiperia_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Error deleting conversation:', error);
        return;
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const selectConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
  }, []);

  const getActiveConversation = useCallback((): Conversation | null => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Generate title from first message - fallback simples
  const generateTitle = (content: string): string => {
    const maxLength = 30;
    const cleaned = content.replace(/\n/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  };

  // Generate smart title using AI
  const generateSmartTitle = async (content: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { message: content }
      });
      
      if (error || !data?.title) {
        console.log('Smart title fallback - using simple truncation');
        return generateTitle(content);
      }
      
      return data.title;
    } catch (err) {
      console.log('Smart title error - using fallback:', err);
      return generateTitle(content);
    }
  };

  // Submit feedback for a message
  const submitFeedback = async (
    conversationId: string,
    messageIndex: number,
    feedbackType: 'like' | 'dislike',
    feedbackText?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('hiperia_message_feedback')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          message_index: messageIndex,
          feedback_type: feedbackType,
          feedback_text: feedbackText,
        }, { onConflict: 'conversation_id,message_index,user_id' });

      if (error) {
        console.error('Error submitting feedback:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  };

  // Create share link
  const createShareLink = async (conversationId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('hiperia_shared_conversations')
        .insert({
          conversation_id: conversationId,
          created_by: user.id,
        })
        .select('share_token')
        .single();

      if (error) {
        console.error('Error creating share link:', error);
        return null;
      }

      return data.share_token;
    } catch (error) {
      console.error('Error creating share link:', error);
      return null;
    }
  };

  // Search conversations (including message content)
  const searchConversations = useCallback((query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in message content
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );
    });
  }, [conversations]);

  const sendMessage = async (
    conversationId: string,
    messages: StoredMessage[]
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('hiperia-chat', {
        body: { messages: messages.map(m => ({ role: m.role, content: m.content })) }
      });

      if (error) {
        console.error('NexusIA error:', error);
        throw new Error(error.message || 'Erro ao processar mensagem');
      }

      if (data?.error) {
        if (data.status === 429) {
          throw new Error('Limite de requisições excedido. Aguarde um momento e tente novamente.');
        }
        if (data.status === 402) {
          throw new Error('Créditos de IA esgotados. Entre em contato com o administrador.');
        }
        throw new Error(data.error);
      }

      return data?.content || 'Não foi possível obter uma resposta.';
    } catch (error) {
      console.error('Error in useNexusIA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Parse pending actions from message content (handles multiline JSON)
  const parseActions = (content: string): PendingAction[] => {
    const actions: PendingAction[] = [];
    const actionRegex = /\[ACTION_REQUIRED:(\w+):([\s\S]*?)\]/g;
    let match;
    
    while ((match = actionRegex.exec(content)) !== null) {
      try {
        const type = match[1] as PendingAction['type'];
        const data = JSON.parse(match[2]);
        actions.push({
          id: crypto.randomUUID(),
          type,
          data
        });
      } catch (e) {
        console.error('Error parsing action:', e);
      }
    }
    
    return actions;
  };

  // Remove action tags from content for display (handles multiline)
  const cleanContentForDisplay = (content: string): string => {
    return content.replace(/\[ACTION_REQUIRED:\w+:[\s\S]*?\]/g, '').trim();
  };

  // Streaming message function with status updates
  const sendMessageStreaming = async (
    conversationId: string,
    messages: StoredMessage[],
    onDelta: (text: string) => void,
    onStatus: (status: string | null) => void,
    onDone: (responseTime: number, tokenCount: number) => void,
    onCancel?: () => void,
    thinkingMode: 'standard' | 'extended' = 'standard',
    connectedToolGroups?: string[],
    selectedApiModel?: string
  ): Promise<void> => {
    setIsLoading(true);
    setCurrentStatus(null);
    
    const startTime = Date.now();
    let tokenCount = 0;
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hiperia-chat`;
    
    try {
      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado para usar a NexusIA');
      }
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          thinkingMode,
          connectedToolGroups: connectedToolGroups || [],
          selectedModel: selectedApiModel || undefined,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Aguarde um momento e tente novamente.');
        }
        if (response.status === 402) {
          throw new Error('Créditos de IA esgotados. Entre em contato com o administrador.');
        }
        
        throw new Error(errorData.error || 'Erro ao processar mensagem');
      }

      if (!response.body) {
        throw new Error('Resposta sem corpo');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line as data arrives
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle different event types
            if (parsed.type === "status") {
              // Status update event
              const statusMessage = parsed.message || null;
              setCurrentStatus(statusMessage);
              onStatus(statusMessage);
            } else if (parsed.type === "error") {
              throw new Error(parsed.message || 'Erro desconhecido');
            } else if (parsed.choices?.[0]?.delta?.content) {
              // Content delta event
              const content = parsed.choices[0].delta.content;
              tokenCount += Math.ceil(content.length / 4); // Rough estimate
              onDelta(content);
            }
          } catch (parseError) {
            // Incomplete JSON split across chunks: put it back and wait for more data
            if (parseError instanceof SyntaxError) {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
            throw parseError;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "status") {
              setCurrentStatus(parsed.message || null);
              onStatus(parsed.message || null);
            } else if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              tokenCount += Math.ceil(content.length / 4);
              onDelta(content);
            }
          } catch { /* ignore partial leftovers */ }
        }
      }

      const responseTime = Date.now() - startTime;
      setCurrentStatus(null);
      onStatus(null);
      onDone(responseTime, tokenCount);
    } catch (error) {
      // Check if it was an abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Streaming was cancelled');
        onCancel?.();
        return;
      }
      console.error('Error in streaming:', error);
      throw error;
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setCurrentStatus(null);
    }
  };

  // Cancel streaming function
  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Execute a confirmed action (uses user's access token for proper auth)
  const executeAction = async (action: PendingAction): Promise<string> => {
    const confirmMessage = `[CONFIRM_ACTION:${action.type}:${JSON.stringify(action.data)}]`;
    
    // Get user's session token for proper authentication
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) throw new Error('Sessão inválida. Faça login novamente.');
    
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hiperia-chat`;
    
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        messages: [
          { role: 'user', content: confirmMessage }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
      if (response.status === 429) throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
      if (response.status === 402) throw new Error('Créditos insuficientes.');
      throw new Error('Erro ao executar ação');
    }

    // Read the streamed response
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Sem resposta');

    const decoder = new TextDecoder();
    let result = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.choices?.[0]?.delta?.content) {
              result += parsed.choices[0].delta.content;
            }
          } catch { /* ignore */ }
        }
      }
    }

    return result || 'Ação executada.';
  };

  // Regenerate last message
  const regenerateLastMessage = useCallback(async (
    conversationId: string,
    messages: StoredMessage[],
    onDelta: (text: string) => void,
    onStatus: (status: string | null) => void,
    onDone: (responseTime: number, tokenCount: number) => void
  ) => {
    // Remove the last assistant message and regenerate
    const messagesWithoutLast = messages.slice(0, -1);
    return sendMessageStreaming(conversationId, messagesWithoutLast, onDelta, onStatus, onDone);
  }, []);

  // Edit and regenerate from a specific message
  const editAndRegenerate = useCallback(async (
    conversationId: string,
    messages: StoredMessage[],
    editIndex: number,
    newContent: string,
    onDelta: (text: string) => void,
    onStatus: (status: string | null) => void,
    onDone: (responseTime: number, tokenCount: number) => void
  ) => {
    // Keep messages up to editIndex, update the edited message
    const editedMessages = messages.slice(0, editIndex + 1);
    editedMessages[editIndex] = {
      ...editedMessages[editIndex],
      content: newContent
    };
    
    return sendMessageStreaming(conversationId, editedMessages, onDelta, onStatus, onDone);
  }, []);

  return {
    // State
    isLoading,
    isLoadingConversations,
    conversations,
    activeConversationId,
    currentStatus,
    userPreferences,
    
    // Actions
    sendMessage,
    sendMessageStreaming,
    cancelStreaming,
    createConversation,
    updateConversation,
    renameConversation,
    deleteConversation,
    selectConversation,
    getActiveConversation,
    loadConversations,
    generateTitle,
    generateSmartTitle,
    
    // New features
    submitFeedback,
    createShareLink,
    searchConversations,
    saveUserPreferences,
    regenerateLastMessage,
    editAndRegenerate,
    
    // Action helpers
    parseActions,
    cleanContentForDisplay,
    executeAction,
  };
}
