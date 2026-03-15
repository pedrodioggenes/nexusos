"use client";

import { useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { PartialBlock, BlockNoteEditor } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import "@blocknote/shadcn/style.css";
import { useWorkspaceFileUpload } from '@/hooks/useWorkspaceFileUpload';
import { TaskBlockComponent, TaskBlockData } from './blocks/TaskBlock';
import { Loader2 } from 'lucide-react';
import { resolveBlockNoteFileUrl } from '@/lib/storage-utils';

interface WorkspaceEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  editable?: boolean;
  pageId?: string;
}

export interface WorkspaceEditorHandle {
  insertMarkdown: (markdown: string) => void;
  getEditor: () => BlockNoteEditor | null;
}

// Default empty block that BlockNote requires
const defaultBlock: PartialBlock = {
  type: "paragraph",
  content: [],
};

export const WorkspaceEditor = forwardRef<WorkspaceEditorHandle, WorkspaceEditorProps>(({ 
  initialContent, 
  onChange,
  editable = true,
  pageId,
}, ref) => {
  const { uploadFile, isUploading } = useWorkspaceFileUpload({ pageId });
  const [taskBlocks, setTaskBlocks] = useState<Map<string, TaskBlockData>>(new Map());
  
  // Ensure initialContent is a non-empty array for BlockNote
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only use initial value
  const safeInitialContent = (
    Array.isArray(initialContent) && initialContent.length > 0
      ? initialContent
      : [defaultBlock]
  ) as PartialBlock[];

  // Handle file upload for BlockNote
  const handleUpload = useCallback(async (file: File): Promise<string> => {
    const url = await uploadFile(file);
    return url;
  }, [uploadFile]);

  // Resolve file URLs for rendering (handles raw paths and expired signed URLs)
  const handleResolveFileUrl = useCallback(async (url: string): Promise<string> => {
    return resolveBlockNoteFileUrl(url, 'workspace-files');
  }, []);

  const editor = useCreateBlockNote({
    initialContent: safeInitialContent,
    uploadFile: handleUpload,
    resolveFileUrl: handleResolveFileUrl,
  });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    insertMarkdown: (markdown: string) => {
      if (!editor) return;
      
      try {
        // Try to parse markdown to blocks
        const blocks = editor.tryParseMarkdownToBlocks(markdown);
        
        if (blocks && blocks.length > 0) {
          // Get current cursor position or use last block
          const cursorPosition = editor.getTextCursorPosition();
          const targetBlock = cursorPosition?.block || editor.document[editor.document.length - 1];
          
          if (targetBlock) {
            editor.insertBlocks(blocks, targetBlock, 'after');
          }
        }
      } catch (error) {
        console.error('Error inserting markdown:', error);
        
        // Fallback: insert as paragraph
        const paragraphBlock: PartialBlock = {
          type: "paragraph",
          content: [{ type: "text", text: markdown, styles: {} }],
        };
        
        const lastBlock = editor.document[editor.document.length - 1];
        if (lastBlock) {
          editor.insertBlocks([paragraphBlock], lastBlock, 'after');
        }
      }
    },
    getEditor: () => editor,
  }), [editor]);

  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(editor.document as unknown[]);
    }
  }, [editor, onChange]);

  // Update task block data
  const updateTaskBlock = useCallback((blockId: string, data: TaskBlockData) => {
    setTaskBlocks(prev => new Map(prev).set(blockId, data));
  }, []);

  return (
    <div className="workspace-editor min-h-[500px] relative">
      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          Enviando...
        </div>
      )}
      
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        editable={editable}
        theme="dark"
        data-theming-css-variables-demo
      />
      
      {/* Render task blocks */}
      {Array.from(taskBlocks.entries()).map(([blockId, data]) => (
        <div key={blockId} className="my-2">
          <TaskBlockComponent
            data={data}
            onChange={(newData) => updateTaskBlock(blockId, newData)}
            pageId={pageId}
            readOnly={!editable}
          />
        </div>
      ))}
    </div>
  );
});

WorkspaceEditor.displayName = 'WorkspaceEditor';
