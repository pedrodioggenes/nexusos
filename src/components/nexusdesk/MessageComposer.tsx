import { useState, useRef, useEffect, KeyboardEvent, useMemo, useCallback } from "react";
import { Send, Paperclip, Smile, AtSign, Bold, Italic, Code, X, FileIcon, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GovernanceHint } from "./GovernanceHint";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHWMembers } from "@/hooks/useHWMembers";
import type { MessageType } from "@/hooks/useChannelGovernance";

interface MessageComposerProps {
  placeholder?: string;
  onSend: (content: string, attachments?: { url: string; name: string; type: string }[]) => void;
  disabled?: boolean;
  initialContent?: string;
  allowedTypes?: MessageType[];
  suggestedTemplate?: string | null;
  autoSuggestComprovacao?: boolean;
}

function detectMessageType(content: string): MessageType | null {
  const lower = content.toLowerCase();
  if (lower.includes('#comprovação') || lower.includes('#comprovacao')) return 'comprovação';
  if (lower.includes('#comunicado')) return 'comunicado';
  if (lower.includes('#pedido')) return 'pedido';
  return null;
}

export function MessageComposer({
  placeholder = "Escreva uma mensagem...",
  onSend,
  disabled,
  initialContent,
  allowedTypes = ['normal', 'comunicado', 'pedido', 'comprovação'],
  suggestedTemplate,
  autoSuggestComprovacao = false,
}: MessageComposerProps) {
  const [content, setContent] = useState(initialContent || "");
  const [isFocused, setIsFocused] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialContentApplied = useRef(false);

  const { members } = useHWMembers();

  useEffect(() => {
    if (initialContent && !initialContentApplied.current) {
      setContent(initialContent);
      initialContentApplied.current = true;
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [initialContent]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const detectedType = useMemo(() => detectMessageType(content), [content]);
  const showComprovacaoHint = autoSuggestComprovacao && detectedType === 'comprovação';

  // Filter members for mention autocomplete
  const filteredMembers = useMemo(() => {
    if (!showMentions || !mentionQuery) return members.slice(0, 8);
    return members
      .filter(m => m.full_name.toLowerCase().includes(mentionQuery.toLowerCase()))
      .slice(0, 8);
  }, [members, showMentions, mentionQuery]);

  // Detect @ mention trigger
  const handleContentChange = useCallback((value: string) => {
    setContent(value);

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  }, []);

  const insertMention = useCallback((memberName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (!atMatch) return;

    const beforeAt = textBeforeCursor.slice(0, atMatch.index);
    const afterCursor = content.slice(cursorPos);
    const newContent = `${beforeAt}@${memberName} ${afterCursor}`;
    setContent(newContent);
    setShowMentions(false);

    setTimeout(() => {
      const newPos = (beforeAt + `@${memberName} `).length;
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
      textarea.focus();
    }, 0);
  }, [content]);

  // Formatting helpers
  const wrapSelection = useCallback((prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = end + prefix.length;
      textarea.focus();
    }, 0);
  }, [content]);

  const handleSend = async () => {
    if ((!content.trim() && pendingFiles.length === 0) || disabled || isUploading) return;

    let uploadedAttachments: { url: string; name: string; type: string }[] = [];
    if (pendingFiles.length > 0) {
      setIsUploading(true);
      try {
        for (const file of pendingFiles) {
          const ext = file.name.split('.').pop();
          const path = `nexusdesk/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('workspace-files').upload(path, file);
          if (error) throw error;
          const { data: signedData } = await supabase.storage.from('workspace-files').createSignedUrl(path, 3600);
          uploadedAttachments.push({ url: signedData?.signedUrl || path, name: file.name, type: file.type });
        }
      } catch (err: any) {
        toast.error("Erro ao enviar arquivo: " + err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSend(content.trim() || '📎 Arquivo(s)', uploadedAttachments.length > 0 ? uploadedAttachments : undefined);
    setContent("");
    setPendingFiles([]);
    setShowMentions(false);
  };

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex].full_name);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUseTemplate = () => {
    if (suggestedTemplate) {
      setContent(suggestedTemplate);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  return (
    <div className="px-3 sm:px-4 pb-3 sm:pb-4" style={{ backgroundColor: '#0f0f10' }}>
      <div
        className="rounded-xl transition-all relative"
        style={{
          backgroundColor: '#18181B',
          border: `1px solid ${isFocused ? '#7C2D12' : '#27272A'}`,
        }}
      >
        {/* Mention autocomplete popup */}
        {showMentions && filteredMembers.length > 0 && (
          <div
            className="absolute bottom-full left-0 right-0 mb-1 rounded-lg shadow-xl overflow-hidden z-50"
            style={{ backgroundColor: '#27272A', border: '1px solid #3F3F46' }}
          >
            {filteredMembers.map((member, idx) => (
              <button
                key={member.user_id}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: idx === mentionIndex ? 'rgba(124, 45, 18, 0.3)' : 'transparent',
                  color: idx === mentionIndex ? '#EA580C' : '#A1A1AA',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(member.full_name);
                }}
                onMouseEnter={() => setMentionIndex(idx)}
              >
                <span className="flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: '#3F3F46', color: '#A1A1AA' }}>
                  {member.initials}
                </span>
                <span>{member.full_name}</span>
                {member.department_role && (
                  <span className="text-xs ml-auto" style={{ color: '#52525B' }}>{member.department_role}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Formatting toolbar */}
        <div
          className="hidden sm:flex items-center gap-1 px-3 py-2"
          style={{ borderBottom: '1px solid #27272A' }}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}
            onClick={() => wrapSelection('**', '**')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}
            onClick={() => wrapSelection('_', '_')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}
            onClick={() => wrapSelection('`', '`')}>
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 mx-1" style={{ backgroundColor: '#27272A' }} />

          <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const pos = textarea.selectionStart;
                const newContent = content.slice(0, pos) + '@' + content.slice(pos);
                setContent(newContent);
                setTimeout(() => {
                  textarea.selectionStart = pos + 1;
                  textarea.selectionEnd = pos + 1;
                  textarea.focus();
                  handleContentChange(newContent);
                }, 0);
              }
            }}>
            <AtSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}>
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Pending files preview */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 py-2" style={{ borderBottom: '1px solid #27272A' }}>
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                {file.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <FileIcon className="h-3 w-3" />}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="ml-1 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2 p-2.5 sm:p-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { setIsFocused(false); setTimeout(() => setShowMentions(false), 200); }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm sm:text-sm"
            style={{ color: '#FAFAFA', minHeight: '24px', maxHeight: '200px', fontSize: '16px' }}
          />

          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChosen}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleFileSelect}
              className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg hover:bg-zinc-700 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
              style={{ color: '#71717A' }}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend}
              disabled={(!content.trim() && pendingFiles.length === 0) || disabled || isUploading}
              size="icon"
              className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
              style={{
                backgroundColor: (content.trim() || pendingFiles.length > 0) ? '#C2410C' : '#27272A',
                color: (content.trim() || pendingFiles.length > 0) ? '#FFFFFF' : '#52525B',
              }}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <GovernanceHint
          detectedType={detectedType}
          allowedTypes={allowedTypes}
          suggestedTemplate={suggestedTemplate ?? null}
          showComprovacaoHint={showComprovacaoHint}
          onUseTemplate={handleUseTemplate}
        />
      </div>

      <p className="hidden sm:block text-xs mt-2 text-center" style={{ color: '#52525B' }}>
        <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: '#27272A' }}>Enter</kbd>
        {" "}para enviar,{" "}
        <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: '#27272A' }}>Shift+Enter</kbd>
        {" "}para nova linha
      </p>
    </div>
  );
}
