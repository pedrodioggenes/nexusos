"use client";

import { useCallback, useMemo } from 'react';
import { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";
import { useDemandAttachmentUpload } from '@/hooks/useDemandAttachmentUpload';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveBlockNoteFileUrl } from '@/lib/storage-utils';

interface DemandRichEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Default empty block that BlockNote requires
const defaultBlock: PartialBlock = {
  type: "paragraph",
  content: [],
};

export function DemandRichEditor({ 
  initialContent, 
  onChange,
  editable = true,
  placeholder = "Digite aqui... Use / para comandos ou arraste imagens",
  className,
  minHeight = "200px",
}: DemandRichEditorProps) {
  const { uploadFile, isUploading } = useDemandAttachmentUpload();
  
  // Ensure initialContent is a non-empty array for BlockNote
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only use initial value to prevent re-creation on tab switch
  const safeInitialContent = useMemo(() => (
    Array.isArray(initialContent) && initialContent.length > 0
      ? initialContent
      : [defaultBlock]
  ) as PartialBlock[], []);

  // Handle file upload for BlockNote
  const handleUpload = useCallback(async (file: File): Promise<string> => {
    return await uploadFile(file);
  }, [uploadFile]);

  // Resolve file URLs for rendering (handles raw paths and expired signed URLs)
  const handleResolveFileUrl = useCallback(async (url: string): Promise<string> => {
    return resolveBlockNoteFileUrl(url, 'demand-attachments');
  }, []);

  const editor = useCreateBlockNote({
    initialContent: safeInitialContent,
    uploadFile: handleUpload,
    resolveFileUrl: handleResolveFileUrl,
  });

  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(editor.document as unknown[]);
    }
  }, [editor, onChange]);

  return (
    <div 
      className={cn(
        "demand-rich-editor relative rounded-lg border border-border bg-card/50 overflow-hidden",
        className
      )}
      style={{ minHeight }}
    >
      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-lg text-xs text-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          Enviando arquivo...
        </div>
      )}
      
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        editable={editable}
        theme="dark"
      />
    </div>
  );
}

// Read-only viewer for demand descriptions
export function DemandContentViewer({ 
  content,
  className,
}: { 
  content: unknown[] | null | undefined;
  className?: string;
}) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Sem detalhamento
      </p>
    );
  }

  return (
    <DemandRichEditor 
      initialContent={content}
      editable={false}
      className={cn("border-0 bg-transparent min-h-0", className)}
      minHeight="auto"
    />
  );
}
