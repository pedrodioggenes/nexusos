import { memo, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Pencil, MessageSquare, PanelLeftClose, PanelLeft,
  MoreHorizontal, Share, FolderOutput, Pin, Archive, 
  Sparkles, Settings, FolderOpen, Code, FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ChatThread } from './types';
import { groupConversationsByDate, getGroupLabel, GroupedConversations } from '@/lib/conversation-utils';

interface ChatSidebarProps {
  threads: ChatThread[];
  activeId: string | null;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNew: () => void;
  onSelect: (thread: ChatThread) => void;
  onRename: (thread: ChatThread) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  onOpenShortcuts?: () => void;
  onOpenInsights?: () => void;
  onOpenScheduled?: () => void;
  onOpenExport?: () => void;
  onOpenShare?: () => void;
  hasActiveConversation?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ThreadItem = memo(function ThreadItem({
  thread, isActive, onSelect, onRename, onDelete,
}: {
  thread: ChatThread; isActive: boolean; onSelect: () => void; onRename: () => void; onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative px-3 py-2 rounded-lg cursor-pointer transition-all duration-150",
        isActive ? "bg-muted/60" : "hover:bg-muted/30"
      )}
      onClick={onSelect}
      title={thread.title}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn(
          "flex-1 min-w-0 truncate text-[13px]",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {thread.title}
        </span>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md hover:bg-border/60 transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="min-w-[180px] bg-background border-border text-muted-foreground rounded-xl">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Em breve" }); }} className="cursor-pointer focus:bg-muted focus:text-foreground rounded-lg mx-1">
                <Share className="h-4 w-4 mr-2" /> Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }} className="cursor-pointer focus:bg-muted focus:text-foreground rounded-lg mx-1">
                <Pencil className="h-4 w-4 mr-2" /> Renomear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Em breve" }); }} className="cursor-pointer focus:bg-muted focus:text-foreground rounded-lg mx-1">
                <FolderOutput className="h-4 w-4 mr-2" /> Mover para projeto
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50 my-1" />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Em breve" }); }} className="cursor-pointer focus:bg-muted focus:text-foreground rounded-lg mx-1">
                <Pin className="h-4 w-4 mr-2" /> Fixar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Em breve" }); }} className="cursor-pointer focus:bg-muted focus:text-foreground rounded-lg mx-1">
                <Archive className="h-4 w-4 mr-2" /> Arquivar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg mx-1">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

const SidebarText = memo(function SidebarText({ children, isExpanded, className }: { children: React.ReactNode; isExpanded: boolean; className?: string }) {
  return (
    <span className={cn(
      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
      isExpanded ? "max-w-[200px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0",
      className
    )}>
      {children}
    </span>
  );
});

const NavItem = memo(function NavItem({ 
  icon: Icon, label, onClick, isExpanded, active = false
}: { 
  icon: React.ElementType; label: string; onClick?: () => void; isExpanded: boolean; active?: boolean;
}) {
  const btn = (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-150",
        active ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <SidebarText isExpanded={isExpanded}>
        <span className="text-[13px]">{label}</span>
      </SidebarText>
    </button>
  );

  if (!isExpanded) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="bg-muted text-foreground border-border">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return btn;
});

const CategoryLabel = memo(function CategoryLabel({ label, icon: Icon, isExpanded }: { label: string; icon: React.ElementType; isExpanded: boolean }) {
  const content = (
    <div className="flex items-center px-3 py-2 text-muted-foreground">
      <Icon className={cn("shrink-0 transition-all duration-300", isExpanded ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <SidebarText isExpanded={isExpanded}>
        <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
      </SidebarText>
    </div>
  );

  if (!isExpanded) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-muted text-foreground border-border">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return content;
});

export const ChatSidebar = memo(function ChatSidebar({
  threads, activeId, isLoading, searchQuery, onSearchChange,
  onNew, onSelect, onRename, onDelete, onClose,
  showCloseButton = false, onOpenShortcuts, onOpenInsights,
  onOpenScheduled, onOpenExport, onOpenShare,
  hasActiveConversation = false, isExpanded = true, onToggleExpanded,
}: ChatSidebarProps) {
  const groupedThreads = useMemo(() => 
    groupConversationsByDate(threads as any) as GroupedConversations,
    [threads]
  );

  const handleSelect = useCallback((thread: ChatThread) => {
    onSelect(thread);
  }, [onSelect]);

  const groupOrder: (keyof GroupedConversations)[] = ['today', 'yesterday', 'lastWeek', 'older'];

  return (
    <div 
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden transition-all duration-300 ease-in-out bg-secondary border-r border-border",
        isExpanded ? "w-[260px]" : "w-[52px]"
      )}
    >
      {/* Header */}
      <div className="shrink-0 p-2 border-b border-border">
        <div className={cn(
          "flex items-center transition-all duration-300 ease-in-out",
          isExpanded ? "justify-between" : "justify-center"
        )}>
          <div className={cn(
            "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-w-[200px] opacity-100 px-2" : "max-w-0 opacity-0 pointer-events-none px-0"
          )}>
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-[14px] font-semibold text-foreground ml-2 whitespace-nowrap">NexusIA</span>
          </div>
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className={cn(
                "flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-150 shrink-0 h-8 w-8",
                !isExpanded && "px-3 py-2 w-auto"
              )}
            >
              {isExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <div className="shrink-0 px-2 py-2 space-y-0.5 border-b border-border">
        <NavItem icon={Plus} label="Novo bate-papo" onClick={onNew} isExpanded={isExpanded} />
        <NavItem icon={Search} label="Procurar" onClick={onOpenShortcuts} isExpanded={isExpanded} />
        <NavItem icon={Settings} label="Personalizar" onClick={() => toast({ title: "Em breve" })} isExpanded={isExpanded} />
      </div>

      {/* Categories */}
      <div className="shrink-0 px-2 py-2 space-y-0.5 border-b border-border">
        <CategoryLabel label="Conversas" icon={MessageSquare} isExpanded={isExpanded} />
        <CategoryLabel label="Projetos" icon={FolderOpen} isExpanded={isExpanded} />
        <CategoryLabel label="Artefatos" icon={FileText} isExpanded={isExpanded} />
        <CategoryLabel label="Código" icon={Code} isExpanded={isExpanded} />
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 py-2">
          {isLoading ? (
            <div className="space-y-1 px-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg bg-muted/20" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8 px-3">
              <p className={cn(
                "text-[13px] text-muted-foreground transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                {searchQuery ? 'Nenhuma conversa encontrada' : 'Seus chats aparecerão aqui'}
              </p>
            </div>
          ) : isExpanded ? (
            groupOrder.map((groupKey) => {
              const group = groupedThreads[groupKey];
              if (!group || group.length === 0) return null;
              return (
                <div key={groupKey} className="mb-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 px-3 font-medium">
                    {getGroupLabel(groupKey)}
                  </p>
                  <div className="space-y-0.5">
                    {group.map((thread: any) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread as ChatThread}
                        isActive={activeId === thread.id}
                        onSelect={() => handleSelect(thread as ChatThread)}
                        onRename={() => onRename(thread as ChatThread)}
                        onDelete={() => onDelete(thread.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-1 py-1">
              {threads.slice(0, 8).map((thread: any) => (
                <TooltipProvider key={thread.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSelect(thread as ChatThread)}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg transition-colors",
                          activeId === thread.id ? "bg-muted" : "hover:bg-muted/40"
                        )}
                      >
                        <MessageSquare className={cn(
                          "h-4 w-4 shrink-0",
                          activeId === thread.id ? "text-foreground" : "text-muted-foreground"
                        )} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-muted text-foreground border-border max-w-[200px]">
                      <span className="truncate">{thread.title}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default ChatSidebar;
