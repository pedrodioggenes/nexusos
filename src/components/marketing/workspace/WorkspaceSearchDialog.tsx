import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useWorkspaceSearch } from '@/hooks/useWorkspaceSearch';

interface WorkspaceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceSearchDialog({ open, onOpenChange }: WorkspaceSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useWorkspaceSearch(query, open);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = useCallback((pageId: string) => {
    onOpenChange(false);
    navigate(`/app/marketing/documentos/${pageId}`);
  }, [navigate, onOpenChange]);

  // Extract text preview from content JSON
  const getPreviewText = (contentPreview: string): string => {
    try {
      // Try to extract readable text from the JSON content
      const cleanText = contentPreview
        .replace(/[{}\[\]"]/g, ' ')
        .replace(/type:|content:|text:|props:|children:/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleanText.slice(0, 120) + (cleanText.length > 120 ? '...' : '');
    } catch {
      return contentPreview.slice(0, 120);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar documentos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : query.length < 2 ? (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <Search className="h-8 w-8 opacity-50" />
              <p>Digite pelo menos 2 caracteres para buscar</p>
            </div>
          </CommandEmpty>
        ) : results && results.length > 0 ? (
          <CommandGroup heading="Resultados">
            {results.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => handleSelect(result.id)}
                className="flex items-start gap-3 py-3"
              >
                <span className="text-2xl shrink-0">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {getPreviewText(result.content_preview)}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <FileText className="h-8 w-8 opacity-50" />
              <p>Nenhum documento encontrado</p>
              <p className="text-xs">Tente buscar por outro termo</p>
            </div>
          </CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
}
