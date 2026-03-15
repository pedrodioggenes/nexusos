/**
 * NexusIA Chat Types
 * ChatGPT-style chat interface types
 */

export type ChatRole = 'system' | 'user' | 'assistant';

export type ThinkingMode = 'standard' | 'extended';

export type AIModel = 
  | 'gemini-flash' 
  | 'gemini-pro' 
  | 'gpt-5' 
  | 'gpt-5-mini'
  | 'gpt-5.2';

export interface PendingAction {
  id: string;
  type: 'create_campaign' | 'approve_proof' | 'reject_proof' | 'cancel_campaign';
  data: Record<string, unknown>;
  confirmed?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status?: 'streaming' | 'done' | 'error';
  responseTime?: number;
  tokenCount?: number;
  feedback?: 'like' | 'dislike';
  pendingActions?: PendingAction[];
  attachments?: UploadedFile[];
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export type ChatStatus = 'idle' | 'sending' | 'streaming' | 'error';
