import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, Clock, Search, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import {
  useWorkspacePages,
  useCreateWorkspacePage,
  useDeleteWorkspacePage,
  useToggleFavorite,
  useTrashedPages,
} from '@/hooks/useWorkspacePages';
import { TemplatesGallery } from '@/components/marketing/workspace/TemplatesGallery';
import { WorkspaceSearchDialog } from '@/components/marketing/workspace/WorkspaceSearchDialog';
import { TrashDialog } from '@/components/marketing/workspace/TrashDialog';
import { PageCard } from '@/components/marketing/workspace/PageCard';
import { BatchActionsBar } from '@/components/marketing/workspace/BatchActionsBar';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';

export default function Documentos() {
  const navigate = useNavigate();
  const { data: pages, isLoading } = useWorkspacePages();
  const createPage = useCreateWorkspacePage();
  const deletePage = useDeleteWorkspacePage();
  const toggleFavorite = useToggleFavorite();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  const selectionMode = selectedIds.size > 0;

  const handleConfirmDelete = () => {
    if (pageToDelete) {
      deletePage.mutate(pageToDelete.id);
      setPageToDelete(null);
    }
  };

  const handleBatchDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    // Limpar estado ANTES para evitar re-renders durante deleção
    setSelectedIds(new Set());
    setConfirmBatchDelete(false);
    
    // Processar sequencialmente para evitar race conditions
    for (const id of idsToDelete) {
      try {
        await deletePage.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao deletar página:', id, error);
      }
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Escape key to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectionMode) {
        clearSelection();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectionMode]);

  const handleCreatePage = async () => {
    const newPage = await createPage.mutateAsync({});
    navigate(`/app/marketing/documentos/${newPage.id}`);
  };

  const recentPages = pages?.slice(0, 6) || [];
  const favoritePages = pages?.filter(p => p.is_favorite) || [];

  // Detect if user is on Mac for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Get selected page titles for confirmation dialog
  const selectedPageTitles = useMemo(() => {
    if (!pages) return [];
    return pages.filter(p => selectedIds.has(p.id)).map(p => p.title);
  }, [pages, selectedIds]);

  return (
    <PageWrapper
      title="Documentos"
      subtitle="Crie e organize documentos, wikis e notas da equipe"
      icon={<FileText className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setSearchOpen(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              {isMac ? <><span className="text-xs">⌘</span>K</> : <>Ctrl+K</>}
            </kbd>
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setTrashOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreatePage} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Página
          </Button>
        </div>
      }
    >
      {/* Search Dialog */}
      <WorkspaceSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Trash Dialog */}
      <TrashDialog open={trashOpen} onOpenChange={setTrashOpen} />

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onDelete={() => setConfirmBatchDelete(true)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : pages?.length === 0 ? (
        <>
          {/* Templates for empty state */}
          <TemplatesGallery />

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="h-20 w-20 rounded-2xl bg-app-gestao/10 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-app-gestao" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum documento ainda</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Comece usando um template acima ou crie uma página em branco.
            </p>
            <Button onClick={handleCreatePage} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Criar Página em Branco
            </Button>
          </motion.div>
        </>
      ) : (
        <>
          {/* Templates Gallery */}
          <TemplatesGallery />

          {/* Favorites */}
          {favoritePages.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <h2 className="font-semibold">Favoritos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritePages.map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/app/marketing/documentos/${page.id}`)}
                    onDelete={() => setPageToDelete({ id: page.id, title: page.title })}
                    onToggleFavorite={() => toggleFavorite.mutate({ id: page.id, is_favorite: !page.is_favorite })}
                    isSelected={selectedIds.has(page.id)}
                    onSelect={(selected) => handleSelect(page.id, selected)}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recent */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Recentes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  onClick={() => navigate(`/app/marketing/documentos/${page.id}`)}
                  onDelete={() => setPageToDelete({ id: page.id, title: page.title })}
                  onToggleFavorite={() => toggleFavorite.mutate({ id: page.id, is_favorite: !page.is_favorite })}
                  isSelected={selectedIds.has(page.id)}
                  onSelect={(selected) => handleSelect(page.id, selected)}
                  selectionMode={selectionMode}
                />
              ))}
            </div>
          </section>

          {/* All Pages */}
          {pages && pages.length > 6 && (
            <section>
              <h2 className="font-semibold mb-4">Todas as Páginas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.slice(6).map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/app/marketing/documentos/${page.id}`)}
                    onDelete={() => setPageToDelete({ id: page.id, title: page.title })}
                    onToggleFavorite={() => toggleFavorite.mutate({ id: page.id, is_favorite: !page.is_favorite })}
                    isSelected={selectedIds.has(page.id)}
                    onSelect={(selected) => handleSelect(page.id, selected)}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Confirm single delete dialog */}
      <AlertDialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover para lixeira?</AlertDialogTitle>
            <AlertDialogDescription>
              O documento "<span className="font-medium text-foreground">{pageToDelete?.title}</span>" será movido para a lixeira. 
              Você poderá restaurá-lo posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm batch delete dialog */}
      <AlertDialog open={confirmBatchDelete} onOpenChange={setConfirmBatchDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover {selectedIds.size} documentos para lixeira?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Os seguintes documentos serão movidos para a lixeira:</span>
              <ul className="list-disc list-inside text-foreground font-medium max-h-32 overflow-y-auto">
                {selectedPageTitles.map((title, i) => (
                  <li key={i} className="truncate">{title}</li>
                ))}
              </ul>
              <span className="block">Você poderá restaurá-los posteriormente.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
