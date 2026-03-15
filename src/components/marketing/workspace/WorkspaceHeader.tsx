import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, MoreHorizontal, Trash2, Copy, Image, Smile, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { WorkspacePage } from '@/hooks/useWorkspacePages';
import { toast } from 'sonner';

interface WorkspaceHeaderProps {
  page: WorkspacePage;
  onUpdateTitle: (title: string) => void;
  onUpdateIcon: (icon: string) => void;
  onUpdateCover: (coverUrl: string | null) => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  editorContent?: unknown[];
}

const EMOJI_LIST = [
  '📄', '📝', '📋', '📌', '📎', '🗂️', '📁', '📂',
  '💡', '🎯', '🚀', '⭐', '✨', '🔥', '💪', '🎨',
  '📊', '📈', '📉', '💰', '🎁', '🏆', '🎪', '🎭',
  '📱', '💻', '🖥️', '⌨️', '🖱️', '📷', '📹', '🎬',
  '🔧', '⚙️', '🔨', '🛠️', '📦', '🎉', '🎊', '🎈',
  '❤️', '💙', '💚', '💜', '💛', '🧡', '🤍', '🖤',
];

export function WorkspaceHeader({
  page,
  onUpdateTitle,
  onUpdateIcon,
  onUpdateCover,
  onToggleFavorite,
  onDelete,
  editorContent,
}: WorkspaceHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [isExporting, setIsExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(page.title);
  }, [page.title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() !== page.title) {
      onUpdateTitle(title.trim() || 'Sem título');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      setTitle(page.title);
      setIsEditingTitle(false);
    }
  };

  const handleExportPDF = useCallback(async () => {
    const content = editorContent || (page.content as unknown[]);
    if (!content || !Array.isArray(content) || content.length === 0) {
      toast.error('Documento sem conteúdo para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const { collectImageUrls, resolveAllImageUrls } = await import('@/lib/pdf/blocknote-to-pdf');
      const { WorkspaceDocumentPDF } = await import('@/lib/pdf/templates/workspace-document-template');
      const { generateAndDownloadPDF } = await import('@/lib/pdf/generate-report');
      const React = await import('react');

      // Resolve all image URLs before generating PDF
      const imageUrls = collectImageUrls(content as any[]);
      const resolvedImageUrls = await resolveAllImageUrls(imageUrls, 'workspace-files');

      const doc = React.createElement(WorkspaceDocumentPDF, {
        data: {
          title: page.title,
          icon: page.icon,
          updatedAt: page.updated_at,
          blocks: content,
          resolvedImageUrls,
        },
      });

      await generateAndDownloadPDF(doc, `${page.title}.pdf`);
      toast.success('PDF exportado com sucesso');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  }, [editorContent, page]);

  return (
    <div className="mb-8">
      {/* Cover Image */}
      {page.cover_image && (
        <div className="relative h-48 -mx-6 -mt-6 mb-6 group">
          <img
            src={page.cover_image}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onUpdateCover(null)}
          >
            Remover capa
          </Button>
        </div>
      )}

      {/* Icon + Title + Actions */}
      <div className="flex items-start gap-4">
        {/* Icon Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-5xl hover:bg-muted/50 rounded-lg p-2 transition-colors">
              {page.icon}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-xs text-muted-foreground mb-2">Escolha um ícone</p>
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onUpdateIcon(emoji)}
                  className={cn(
                    "text-xl p-1.5 rounded hover:bg-muted transition-colors",
                    emoji === page.icon && "bg-app-gestao/20"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Title + Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isEditingTitle ? (
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-3xl font-bold h-auto py-1 px-2 bg-transparent border-none focus-visible:ring-1"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-bold cursor-text hover:bg-muted/30 rounded px-2 py-1 -mx-2 transition-colors truncate"
              >
                {page.title}
              </h1>
            )}

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFavorite}
              >
                <Star className={cn(
                  "h-4 w-4",
                  page.is_favorite && "fill-yellow-500 text-yellow-500"
                )} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!page.cover_image && (
                    <DropdownMenuItem onClick={() => onUpdateCover('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200')}>
                      <Image className="h-4 w-4 mr-2" />
                      Adicionar capa
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-2" />
                    )}
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Última edição: {new Date(page.updated_at).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
