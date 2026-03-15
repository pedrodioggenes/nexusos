import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Plus, 
  Star, 
  FileText, 
  MoreHorizontal,
  Trash2,
  Copy,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  useWorkspacePagesTree, 
  useCreateWorkspacePage,
  useDeleteWorkspacePage,
  useToggleFavorite,
  WorkspacePage 
} from '@/hooks/useWorkspacePages';
import { Skeleton } from '@/components/ui/skeleton';

interface PageItemProps {
  page: WorkspacePage & { children?: WorkspacePage[] };
  level?: number;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onAddChild: (parentId: string) => void;
  activeId?: string;
}

function PageItem({ 
  page, 
  level = 0, 
  onNavigate, 
  onDelete, 
  onToggleFavorite,
  onAddChild,
  activeId 
}: PageItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isActive = page.id === activeId;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
          isActive 
            ? "bg-app-gestao/10 text-app-gestao" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        style={{ paddingLeft: `${8 + level * 12}px` }}
      >
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="p-0.5 hover:bg-muted rounded">
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isOpen && "rotate-90"
                )} />
              </button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <span className="w-4" />
        )}

        <button
          onClick={() => onNavigate(page.id)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-base leading-none">{page.icon}</span>
          <span className="truncate">{page.title}</span>
        </button>

        <div className="opacity-0 group-hover:opacity-100 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(page.id);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onToggleFavorite(page.id, page.is_favorite)}>
                <Heart className={cn("h-4 w-4 mr-2", page.is_favorite && "fill-current")} />
                {page.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(page.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar sub-página
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(page.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && (
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            {page.children!.map((child) => (
              <PageItem
                key={child.id}
                page={child as WorkspacePage & { children?: WorkspacePage[] }}
                level={level + 1}
                onNavigate={onNavigate}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onAddChild={onAddChild}
                activeId={activeId}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function WorkspaceSidebar() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const { tree, favorites, isLoading } = useWorkspacePagesTree();
  const createPage = useCreateWorkspacePage();
  const deletePage = useDeleteWorkspacePage();
  const toggleFavorite = useToggleFavorite();

  const handleNavigate = (id: string) => {
    navigate(`/app/marketing/documentos/${id}`);
  };

  const handleCreatePage = async (parentId?: string) => {
    const newPage = await createPage.mutateAsync({ parent_page_id: parentId });
    navigate(`/app/marketing/documentos/${newPage.id}`);
  };

  const handleDelete = (id: string) => {
    deletePage.mutate(id);
    if (id === pageId) {
      navigate('/app/marketing/documentos');
    }
  };

  const handleToggleFavorite = (id: string, current: boolean) => {
    toggleFavorite.mutate({ id, is_favorite: !current });
  };

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => handleCreatePage()}
        >
          <Plus className="h-4 w-4" />
          Nova página
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
                Favoritos
              </p>
              {favorites.map((page) => (
                <div
                  key={page.id}
                  onClick={() => handleNavigate(page.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
                    page.id === pageId
                      ? "bg-app-gestao/10 text-app-gestao"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-base leading-none">{page.icon}</span>
                  <span className="truncate">{page.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* All Pages */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
              Páginas
            </p>
            {tree.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma página ainda</p>
                <p className="text-xs">Clique em "Nova página" para começar</p>
              </div>
            ) : (
              tree.map((page) => (
                <PageItem
                  key={page.id}
                  page={page}
                  onNavigate={handleNavigate}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onAddChild={handleCreatePage}
                  activeId={pageId}
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
