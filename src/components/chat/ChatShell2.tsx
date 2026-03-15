import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { PanelLeft, Sparkles, ArrowLeft, LogOut, Menu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAccessControl } from '@/hooks/useAccessControl';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp } from 'lucide-react';

// Chat components
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatComposer } from './ChatComposer';
import { WelcomeScreen } from './WelcomeScreen';
import type { ChatMessage, ChatThread, UploadedFile, PendingAction } from './types';

// Lazy load dialog components
const ExportDialog = lazy(() => import('@/components/ia/ExportDialog').then(m => ({ default: m.ExportDialog })));
const ShareDialog = lazy(() => import('@/components/ia/ShareDialog').then(m => ({ default: m.ShareDialog })));
const KeyboardShortcutsDialog = lazy(() => import('@/components/ia/KeyboardShortcuts').then(m => ({ default: m.KeyboardShortcutsDialog })));
const ScheduledQueryDialog = lazy(() => import('@/components/ia/ScheduledQueryDialog').then(m => ({ default: m.ScheduledQueryDialog })));
const InsightsDashboard = lazy(() => import('@/components/ia/InsightsDashboard').then(m => ({ default: m.InsightsDashboard })));
const RenameDialog = lazy(() => import('@/components/ia/RenameDialog').then(m => ({ default: m.RenameDialog })));
const ContextualSuggestions = lazy(() => import('@/components/ia/ContextualSuggestions').then(m => ({ default: m.ContextualSuggestions })));

// Default suggested questions
const SUGGESTED_QUESTIONS = [
  "Qual o ROI das campanhas de trade este mês?",
  "Quais alertas críticos precisam de atenção?",
  "Gere um relatório executivo de performance por loja",
  "Analise a parceria Nestlé e recomende próximos passos",
];

interface LayoutContext {
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
  user: { email?: string } | null;
}

import type { ThinkingMode, AIModel } from './types';

interface ChatShell2Props {
  // Hook interface
  conversations: ChatThread[];
  activeConversationId: string | null;
  isLoading: boolean;
  isLoadingConversations: boolean;
  currentStatus: string | null;
  
  // Actions
  onCreateConversation: () => Promise<string | null>;
  onSelectConversation: (id: string | null) => void;
  onDeleteConversation: (id: string) => Promise<void>;
  onRenameConversation: (id: string, title: string) => Promise<boolean>;
  onSendMessage: (message: string, files?: UploadedFile[]) => Promise<void>;
  onCancelStreaming: () => void;
  onRegenerate: (index: number) => Promise<void>;
  onEditMessage: (index: number, content: string) => Promise<void>;
  onFeedback: (index: number, type: 'like' | 'dislike') => Promise<void>;
  onConfirmAction?: (messageId: string, action: PendingAction) => Promise<void>;
  onRejectAction?: (messageId: string, actionId: string) => void;
  
  // Search
  searchConversations: (query: string) => ChatThread[];
  
  // State
  isStreaming: boolean;
  localMessages: ChatMessage[];
  displayStatus: string | null;
  processingActionId?: string | null;
  
  // Thinking mode & model
  thinkingMode?: ThinkingMode;
  onThinkingModeChange?: (mode: ThinkingMode) => void;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
  
  // Connected tools
  onConnectedToolsChange?: (connectedIds: string[], toolGroups: string[]) => void;
  
  // Keyboard shortcuts
  onNewChat: () => void;
}

export const ChatShell2 = memo(function ChatShell2({
  conversations,
  activeConversationId,
  isLoading,
  isLoadingConversations,
  currentStatus,
  onCreateConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onSendMessage,
  onCancelStreaming,
  onRegenerate,
  onEditMessage,
  onFeedback,
  onConfirmAction,
  onRejectAction,
  searchConversations,
  isStreaming,
  localMessages,
  displayStatus,
  processingActionId,
  thinkingMode = 'standard',
  onThinkingModeChange,
  selectedModel,
  onModelChange,
  onConnectedToolsChange,
  onNewChat,
}: ChatShell2Props) {
  const isMobile = useIsMobile();
  const { canAccessPortal } = useAccessControl();
  const { signOut, navigate, user } = useOutletContext<LayoutContext>();
  
  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isBackExpanded, setIsBackExpanded] = useState(false);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<ChatThread | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [scheduledQueryDialogOpen, setScheduledQueryDialogOpen] = useState(false);

  // Display name from user
  const displayName = user?.email?.split('@')[0] || 'Usuário';

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return searchConversations(searchQuery);
  }, [searchConversations, searchQuery]);

  // Handlers
  const handleNewConversation = useCallback(async () => {
    await onCreateConversation();
    setMobileSidebarOpen(false);
  }, [onCreateConversation]);

  const handleSelectConversation = useCallback((thread: ChatThread) => {
    onSelectConversation(thread.id);
    setMobileSidebarOpen(false);
  }, [onSelectConversation]);

  const handleDeleteClick = useCallback((id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (conversationToDelete) {
      await onDeleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleRenameClick = useCallback((thread: ChatThread) => {
    setConversationToRename(thread);
    setRenameDialogOpen(true);
  }, []);

  const handleRename = async (newTitle: string) => {
    if (conversationToRename) {
      const success = await onRenameConversation(conversationToRename.id, newTitle);
      if (success) {
        toast.success('Conversa renomeada');
      }
    }
    setRenameDialogOpen(false);
    setConversationToRename(null);
  };

  const handleSubmit = useCallback(async (message: string, files?: UploadedFile[]) => {
    setInputValue('');
    await onSendMessage(message, files);
  }, [onSendMessage]);

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Active conversation for dialogs
  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsDialogOpen(true);
      }
      if (e.key === 'Escape' && isStreaming) {
        onCancelStreaming();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewConversation, isStreaming, onCancelStreaming]);

  // Sidebar content
  const sidebarContent = (
    <ChatSidebar
      threads={filteredConversations}
      activeId={activeConversationId}
      isLoading={isLoadingConversations}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNew={handleNewConversation}
      onSelect={handleSelectConversation}
      onRename={handleRenameClick}
      onDelete={handleDeleteClick}
      onClose={() => setShowSidebar(false)}
      showCloseButton={!isMobile}
      isExpanded={sidebarExpanded}
      onToggleExpanded={() => setSidebarExpanded(prev => !prev)}
      onOpenShortcuts={() => {
        setSearchDialogOpen(true);
        setSearchQuery('');
      }}
      onOpenInsights={() => setInsightsDialogOpen(true)}
      onOpenScheduled={() => setScheduledQueryDialogOpen(true)}
      onOpenExport={() => setExportDialogOpen(true)}
      onOpenShare={() => setShareDialogOpen(true)}
      hasActiveConversation={!!activeConversationId && localMessages.length > 0}
    />
  );

  // Composer component
  const composerComponent = (
    <ChatComposer
      onSend={handleSubmit}
      onStop={onCancelStreaming}
      disabled={isLoading && !isStreaming}
      isStreaming={isStreaming}
      conversationId={activeConversationId}
      autoFocus={localMessages.length === 0}
      initialValue={inputValue}
      thinkingMode={thinkingMode}
      onThinkingModeChange={onThinkingModeChange}
      selectedModel={selectedModel}
      onModelChange={onModelChange}
      onConnectedToolsChange={onConnectedToolsChange}
    />
  );

  return (
    <div 
      className="h-full w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: '#0f0f10' }}
    >
      
      {/* Header */}
      <header 
        className="shrink-0 py-2.5 px-4 relative z-20"
        style={{ 
          backgroundColor: "#18181B",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {canAccessPortal && (
              <motion.div
                onMouseEnter={() => setIsBackExpanded(true)}
                onMouseLeave={() => setIsBackExpanded(false)}
                className="flex items-center"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/portal")}
                  className="h-9 w-9 rounded-xl hover:bg-white/[0.06]"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <AnimatePresence mode="wait">
                  {isBackExpanded && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs whitespace-nowrap overflow-hidden text-white/50 font-medium"
                    >
                      Mudar de aplicativo
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ 
                  backgroundColor: "#27272A",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                <Sparkles className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-[#FAFAFA] leading-tight">NexusIA</h1>
                <p className="text-[10px] text-[#71717A] hidden sm:block">Assistente IA</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* User Dropdown - Both mobile and desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-white/[0.06]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-app-ia/20 text-app-ia font-medium">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-black/90 backdrop-blur-xl border-white/10 rounded-xl">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
                
                {/* Premium Community Button */}
                <div className="p-2">
                  <Button
                    onClick={() => navigate("/app/desk")}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Acessar NexusDesk
                  </Button>
                </div>
                
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex relative z-10">
        {!isMobile && showSidebar && (
          <aside className="h-full shrink-0">
            {sidebarContent}
          </aside>
        )}

        <main className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden">
          <div className="absolute left-3 top-16 z-10">
            {isMobile ? (
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted">
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 border-border bg-sidebar">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            ) : (
              !showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(true)}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              )
            )}
          </div>

          {localMessages.length === 0 ? (
            <div key="welcome" className="flex-1 flex flex-col min-h-0">
              <WelcomeScreen
                suggestedQuestions={SUGGESTED_QUESTIONS}
                onSelectQuestion={handleSuggestedQuestion}
                composerSlot={composerComponent}
              />
            </div>
          ) : (
            <div key="chat" className="flex-1 flex flex-col min-h-0 h-full">
              <ChatMessages
                messages={localMessages}
                isStreaming={isStreaming}
                isLoading={isLoading}
                displayStatus={displayStatus}
                onRegenerate={onRegenerate}
                onEdit={() => {}}
                onFeedback={onFeedback}
                onConfirmAction={onConfirmAction}
                onRejectAction={onRejectAction}
                processingActionId={processingActionId}
              />

              {!isStreaming && localMessages.length > 0 && (
                <div className="px-4 pt-2">
                  <div className="max-w-3xl mx-auto">
                    <Suspense fallback={null}>
                      <ContextualSuggestions
                        lastUserMessage={localMessages.filter(m => m.role === 'user').pop()}
                        lastAssistantMessage={localMessages.filter(m => m.role === 'assistant').pop()}
                        onSelect={handleSuggestedQuestion}
                        isDarkMode={true}
                      />
                    </Suspense>
                  </div>
                </div>
              )}

              <div 
                className="shrink-0 p-4"
                style={{ 
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="max-w-3xl mx-auto">
                  {composerComponent}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir conversa</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Suspense fallback={null}>
        <RenameDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          currentTitle={conversationToRename?.title || ''}
          onRename={handleRename}
          isDarkMode={true}
        />
      </Suspense>

      <Dialog open={insightsDialogOpen} onOpenChange={setInsightsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights de Uso
            </DialogTitle>
          </DialogHeader>
          <Suspense fallback={null}>
            <InsightsDashboard conversations={conversations as any} isDarkMode={true} />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          conversation={activeConversation as any}
          isDarkMode={true}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          conversationId={activeConversationId || ''}
          isDarkMode={true}
        />
      </Suspense>

      <Dialog
        open={searchDialogOpen}
        onOpenChange={(open) => {
          setSearchDialogOpen(open);
          if (!open) setSearchQuery('');
        }}
      >
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Buscar conversas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busque por título ou conteúdo..."
              className="w-full h-10 rounded-md bg-muted text-foreground placeholder:text-muted-foreground border border-border px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
              {filteredConversations.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">Nenhuma conversa encontrada.</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredConversations.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => {
                        handleSelectConversation(thread);
                        setSearchDialogOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <div className="text-sm text-foreground truncate">{thread.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date((thread as any).updated_at ?? Date.now()).toLocaleDateString('pt-BR')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <KeyboardShortcutsDialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen} isDarkMode={true} />
      </Suspense>

      <Suspense fallback={null}>
        <ScheduledQueryDialog open={scheduledQueryDialogOpen} onOpenChange={setScheduledQueryDialogOpen} isDarkMode={true} />
      </Suspense>
    </div>
  );
});

export default ChatShell2;
