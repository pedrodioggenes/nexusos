import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { PanelLeft, Bot, ArrowLeft, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAccessControl } from '@/hooks/useAccessControl';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';
import { SolidCard, SolidCardHeader, SolidCardContent } from '@/components/ui/solid-card';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ChatShellProps {
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
  
  // Keyboard shortcuts
  onNewChat: () => void;
}

export const ChatShell = memo(function ChatShell({
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
  onNewChat,
}: ChatShellProps) {
  const isMobile = useIsMobile();
  const { canAccessPortal } = useAccessControl();
  const { signOut, navigate, user } = useOutletContext<LayoutContext>();
  
  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
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
    />
  );

  return (
    <SolidCard 
      className="h-full w-full overflow-hidden flex flex-col rounded-none border-0" 
      withGradient
      style={{ boxShadow: 'none' }}
    >
      {/* Integrated Header - Inside the card like demo */}
      <SolidCardHeader className="shrink-0 pb-3" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Expandable back arrow */}
            {canAccessPortal && (
              <motion.div
                onMouseEnter={() => setIsBackExpanded(true)}
                onMouseLeave={() => setIsBackExpanded(false)}
                className="flex items-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/portal")}
                  className="h-8 px-2 gap-1.5"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <AnimatePresence mode="wait">
                    {isBackExpanded && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="text-xs whitespace-nowrap overflow-hidden"
                      >
                        Mudar de aplicativo
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}

            {/* Logo - like demo */}
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl"
                style={{ backgroundColor: "rgba(39, 39, 42, 0.8)" }}
              >
                <Bot className="w-5 h-5 accent-soft-text" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-medium accent-soft-text">NexusIA</h1>
                <p className="text-[10px] text-white/40 hidden sm:block">Assistente de Trade Marketing</p>
              </div>
            </div>
          </div>

          {/* Right side - Profile name + Sign out */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {!isMobile && (
              <>
                <span className="text-xs text-white/50 hidden md:block max-w-[150px] truncate">
                  {displayName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 gap-2 text-white/40 hover:text-white/70"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs">Sair</span>
                </Button>
              </>
            )}
            
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {displayName}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </SolidCardHeader>

      {/* Main content area */}
      <SolidCardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        <div className="h-full w-full min-h-0 flex overflow-hidden">
          {/* Desktop Sidebar - w-48 (192px) */}
          {!isMobile && (
            <AnimatePresence mode="wait">
              {showSidebar && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="shrink-0 h-full overflow-hidden"
                  style={{ borderRight: "1px solid rgba(255, 255, 255, 0.05)" }}
                >
                  {sidebarContent}
                </motion.aside>
              )}
            </AnimatePresence>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
            {/* Header with sidebar toggle */}
            <div className="absolute left-3 top-3 z-10">
              {isMobile ? (
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
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

            {/* Content - key forces immediate transition */}
            {localMessages.length === 0 ? (
              <WelcomeScreen
                key="welcome"
                suggestedQuestions={SUGGESTED_QUESTIONS}
                onSelectQuestion={handleSuggestedQuestion}
                composerSlot={composerComponent}
              />
            ) : (
              <div key="chat" className="flex-1 flex flex-col min-h-0">
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

                {/* Contextual suggestions */}
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

                {/* Sticky composer */}
                <div 
                  className="shrink-0 p-4"
                  style={{ 
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    backgroundColor: "rgba(24, 24, 27, 0.3)",
                  }}
                >
                  <div className="max-w-3xl mx-auto">
                    {composerComponent}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SolidCardContent>

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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
            <InsightsDashboard
              conversations={conversations as any}
              isDarkMode={true}
            />
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
                <div className="p-3 text-sm text-muted-foreground">
                  Nenhuma conversa encontrada.
                </div>
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
        <KeyboardShortcutsDialog
          open={shortcutsDialogOpen}
          onOpenChange={setShortcutsDialogOpen}
          isDarkMode={true}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ScheduledQueryDialog
          open={scheduledQueryDialogOpen}
          onOpenChange={setScheduledQueryDialogOpen}
          isDarkMode={true}
        />
      </Suspense>
    </SolidCard>
  );
});

export default ChatShell;
