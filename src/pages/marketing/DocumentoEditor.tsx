import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  WorkspaceEditor, 
  WorkspaceHeader, 
  PageBreadcrumb,
  DocumentAIPanel,
  type WorkspaceEditorHandle
} from '@/components/marketing/workspace';
import { DocumentDemandLink } from '@/components/marketing/workspace/DocumentDemandLink';
import {
  useWorkspacePage,
  useWorkspacePages,
  useUpdateWorkspacePage,
  useDeleteWorkspacePage,
  useToggleFavorite,
} from '@/hooks/useWorkspacePages';

// Helper to extract text content from BlockNote document
function extractTextFromContent(content: unknown[]): string {
  if (!Array.isArray(content)) return '';
  
  const extractText = (block: unknown): string => {
    if (!block || typeof block !== 'object') return '';
    
    const b = block as Record<string, unknown>;
    let text = '';
    
    // Extract from content array
    if (Array.isArray(b.content)) {
      for (const item of b.content) {
        if (typeof item === 'object' && item !== null) {
          const i = item as Record<string, unknown>;
          if (i.type === 'text' && typeof i.text === 'string') {
            text += i.text + ' ';
          }
        }
      }
    }
    
    // Extract from children
    if (Array.isArray(b.children)) {
      for (const child of b.children) {
        text += extractText(child) + ' ';
      }
    }
    
    return text;
  };
  
  return content.map(extractText).join(' ').trim().substring(0, 2000);
}

export default function DocumentoEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId: string }>();
  const { data: page, isLoading } = useWorkspacePage(pageId);
  const { data: allPages } = useWorkspacePages();
  const updatePage = useUpdateWorkspacePage();
  const deletePage = useDeleteWorkspacePage();
  const toggleFavorite = useToggleFavorite();
  
  const [isSaving, setIsSaving] = useState(false);
  const [aiPanelOpen, setAIPanelOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<WorkspaceEditorHandle>(null);
  const [currentContent, setCurrentContent] = useState<unknown[]>([]);

  const handleContentChange = useCallback((content: unknown[]) => {
    if (!pageId) return;
    
    // Update current content for AI context
    setCurrentContent(content);

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      await updatePage.mutateAsync({ id: pageId, content });
      setIsSaving(false);
    }, 1000);
  }, [pageId, updatePage]);

  const handleUpdateTitle = (title: string) => {
    if (pageId) {
      updatePage.mutate({ id: pageId, title });
    }
  };

  const handleUpdateIcon = (icon: string) => {
    if (pageId) {
      updatePage.mutate({ id: pageId, icon });
    }
  };

  const handleUpdateCover = (coverUrl: string | null) => {
    if (pageId) {
      updatePage.mutate({ id: pageId, cover_image: coverUrl });
    }
  };

  const handleToggleFavorite = () => {
    if (pageId && page) {
      toggleFavorite.mutate({ id: pageId, is_favorite: !page.is_favorite });
    }
  };

  const handleDelete = () => {
    if (pageId) {
      deletePage.mutate(pageId);
      navigate('/app/marketing/documentos');
    }
  };

  const handleInsertAIContent = useCallback((markdown: string) => {
    if (editorRef.current) {
      editorRef.current.insertMarkdown(markdown);
      toast.success('Conteúdo inserido no documento');
      setAIPanelOpen(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-4">
          A página que você está procurando não existe ou foi excluída.
        </p>
        <Button onClick={() => navigate('/app/marketing/documentos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Documentos
        </Button>
      </div>
    );
  }

  // Get text content for AI context
  const pageTextContent = extractTextFromContent(
    currentContent.length > 0 ? currentContent : (page.content as unknown[])
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      {allPages && (
        <PageBreadcrumb currentPage={page} allPages={allPages} />
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando...
        </div>
      )}

      {/* Header */}
      <WorkspaceHeader
        page={page}
        onUpdateTitle={handleUpdateTitle}
        onUpdateIcon={handleUpdateIcon}
        onUpdateCover={handleUpdateCover}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        editorContent={currentContent.length > 0 ? currentContent : (page.content as unknown[])}
      />

      {/* Demand links */}
      {pageId && (
        <div className="mb-4 px-1">
          <DocumentDemandLink pageId={pageId} />
        </div>
      )}

      {/* Editor */}
      <WorkspaceEditor
        ref={editorRef}
        key={page.id}
        pageId={page.id}
        initialContent={page.content as unknown[]}
        onChange={handleContentChange}
      />

      {/* AI Assistant Button */}
      <Button
        onClick={() => setAIPanelOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg gap-2 z-40"
        size="lg"
      >
        <Sparkles className="h-4 w-4" />
        Assistente IA
      </Button>

      {/* AI Panel */}
      <AnimatePresence>
        {aiPanelOpen && (
          <DocumentAIPanel
            isOpen={aiPanelOpen}
            onClose={() => setAIPanelOpen(false)}
            pageTitle={page.title}
            pageContent={pageTextContent}
            onInsertContent={handleInsertAIContent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
