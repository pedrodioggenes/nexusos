/**
 * Attachment picker for DM composer — dual source: Computer + NexusDesk internal.
 * WhatsApp-style popover with upload from device or browse workspace docs.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip, Upload, FolderOpen, FileText, Image, Film,
  File, X, Loader2 } from
"lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHWDocuments } from "@/hooks/useHWDocuments";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import type { DMAttachment } from "@/hooks/useHWDMs";
import { toast } from "sonner";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";

const MAX_FILE_SIZE = 700 * 1024 * 1024; // 700MB
const BUCKET = "dm-attachments";

const ACCEPTED_TYPES = "*/*";

interface DMAttachmentPickerProps {
  onAttach: (attachments: DMAttachment[]) => void;
  disabled?: boolean;
}

function getFileCategory(type: string): "image" | "video" | "document" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return "document";
}

function getFileIcon(type: string) {
  const cat = typeof type === "string" ? type : "";
  if (cat.startsWith("image") || ["jpg", "png", "jpeg", "webp", "gif"].includes(cat))
  return <Image className="h-4 w-4" style={{ color: "#3B82F6" }} />;
  if (cat.startsWith("video") || ["mp4", "mov", "avi"].includes(cat))
  return <Film className="h-4 w-4" style={{ color: "#A855F7" }} />;
  if (cat.includes("pdf"))
  return <FileText className="h-4 w-4" style={{ color: "#EF4444" }} />;
  return <File className="h-4 w-4" style={{ color: "#71717A" }} />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DMAttachmentPicker({ onAttach, disabled }: DMAttachmentPickerProps) {
  const { user } = useAuth();
  const tenantQuery = useHWTenantId();
  const tenantId = tenantQuery.data ?? undefined;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"device" | "workspace">("device");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceClick = () => {
    fileInputRef.current?.click();
    setOpen(false);
  };

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user?.id) return;

    const validFiles = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} excede o limite de 700MB`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setUploading(true);
    const attachments: DMAttachment[] = [];

    try {
      for (const file of validFiles) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.
        from(BUCKET).
        upload(path, file);

        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        const { data: signedData } = await supabase.storage.
        from(BUCKET).
        createSignedUrl(path, 3600);

        attachments.push({
          url: signedData?.signedUrl || path,
          path,
          name: file.name,
          type: file.type,
          size: file.size,
          source: "upload"
        });
      }

      if (attachments.length > 0) {
        onAttach(attachments);
      }
    } catch (err) {
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [user?.id, onAttach]);

  const handleWorkspaceSelect = useCallback(async (doc: {name: string;filePath?: string;fileType: string;}) => {
    if (!doc.filePath) {
      toast.error("Arquivo sem caminho no storage");
      return;
    }

    const { data: signedData } = await supabase.storage.
    from("workspace-files").
    createSignedUrl(doc.filePath, 3600);

    const attachment: DMAttachment = {
      url: signedData?.signedUrl || doc.filePath,
      path: doc.filePath,
      name: doc.name,
      type: doc.fileType,
      source: "workspace"
    };

    onAttach([attachment]);
    setOpen(false);
  }, [onAttach]);

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileSelected} />
      

      {/* Click-outside overlay */}
      {open &&
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)} />

      }

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled || uploading}
        className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
        style={{
          backgroundColor: open ? "hsl(var(--primary) / 0.15)" : "transparent",
          color: open ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        }}>
        
        {uploading ?
        <Loader2 className="h-4 w-4 animate-spin" /> :

        <Paperclip className="h-4 w-4" />
        }
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 mb-2 w-72 rounded-xl overflow-hidden shadow-xl z-50"
          style={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))"
          }}>
          
            {/* Header tabs */}
            <div className="flex border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <button
              onClick={() => setTab("device")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: tab === "device" ? "hsl(var(--primary) / 0.1)" : "transparent",
                color: tab === "device" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                borderBottom: tab === "device" ? "2px solid hsl(var(--primary))" : "2px solid transparent"
              }}>
              
                <Upload className="h-3.5 w-3.5" />
                Meu Computador
              </button>
              <button
              onClick={() => setTab("workspace")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: tab === "workspace" ? "hsl(var(--primary) / 0.1)" : "transparent",
                color: tab === "workspace" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                borderBottom: tab === "workspace" ? "2px solid hsl(var(--primary))" : "2px solid transparent"
              }}>
              
                <FolderOpen className="h-3.5 w-3.5" />
                NexusDesk
              </button>
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto">
              {tab === "device" ?
            <DeviceTab onClick={handleDeviceClick} /> :

            <WorkspaceTab
              tenantId={tenantId}
              onSelect={handleWorkspaceSelect} />

            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

/** Device tab — quick action buttons */
function DeviceTab({ onClick }: {onClick: () => void;}) {
  return (
    <div className="p-3 space-y-1.5">
      <p className="text-[10px] font-medium mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        Selecione arquivos do seu computador
      </p>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
        style={{ color: "hsl(var(--foreground))" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "hsl(var(--muted))"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
        
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}>
          <Upload className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <div>
          <p className="text-xs font-medium">Enviar Arquivo</p>
          <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            Documentos, fotos, vídeos (até 700MB)
          </p>
        </div>
      </button>
    </div>);

}

/** Workspace tab — browse NexusDesk documents */
function WorkspaceTab({
  tenantId,
  onSelect



}: {tenantId?: string;onSelect: (doc: {name: string;filePath?: string;fileType: string;}) => void;}) {
  const { data: documents, isLoading } = useHWDocuments(tenantId);
  const [search, setSearch] = useState("");

  const filtered = (documents || []).filter((d) =>
  d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2">
      {/* Search */}
      <div className="px-1 pb-2">
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-transparent outline-none"
          style={{
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--foreground))"
          }} />
        
      </div>

      {isLoading ?
      <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div> :
      filtered.length === 0 ?
      <div className="text-center py-6">
          <FolderOpen className="h-6 w-6 mx-auto mb-2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {search ? "Nenhum documento encontrado" : "Nenhum documento no workspace"}
          </p>
        </div> :

      <div className="space-y-0.5">
          {filtered.map((doc) =>
        <button
          key={doc.id}
          onClick={() => onSelect({ name: doc.name, filePath: doc.filePath, fileType: doc.fileType })}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "hsl(var(--muted))"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
          
              {getFileIcon(doc.fileType)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                  {doc.name}
                </p>
                <p className="text-[10px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {doc.contextLabel} · {doc.uploadedBy}
                </p>
              </div>
            </button>
        )}
        </div>
      }
    </div>);

}

/** Attachment preview chips shown below composer */
export function AttachmentPreviewBar({
  attachments,
  onRemove



}: {attachments: DMAttachment[];onRemove: (index: number) => void;}) {
  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
      {attachments.map((att, i) =>
      <motion.div
        key={`${att.name}-${i}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg text-xs"
        style={{
          backgroundColor: "hsl(var(--muted))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))"
        }}>
        
          {getFileIcon(att.type)}
          <span className="max-w-[120px] truncate text-[11px]">{att.name}</span>
          {att.size &&
        <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              {formatFileSize(att.size)}
            </span>
        }
          <button
          onClick={() => onRemove(i)}
          className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 transition-colors"
          style={{ backgroundColor: "hsl(var(--muted-foreground) / 0.2)" }}>
          
            <X className="h-2.5 w-2.5" style={{ color: "hsl(var(--muted-foreground))" }} />
          </button>
        </motion.div>
      )}
    </div>);

}

/** Inline attachment renderer for message bubbles */
export function MessageAttachments({
  attachments,
  isMine



}: {attachments: DMAttachment[];isMine: boolean;}) {
  if (!attachments?.length) return null;

  return (
    <div className="space-y-1.5 mb-1">
      {attachments.map((att, i) => {
        const cat = getFileCategory(att.type);

        // Voice / audio message — render inline player
        if (att.type?.startsWith("audio/")) {
          return (
            <VoiceMessagePlayer
              key={i}
              url={att.url}
              isMine={!!isMine}
            />
          );
        }

        if (cat === "image") {
          return (
            <a
              key={i}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden">
              
              <img
                src={att.url}
                alt={att.name}
                className="max-w-full max-h-52 rounded-lg object-cover"
                loading="lazy" />
              
            </a>);

        }

        if (cat === "video") {
          return (
            <video
              key={i}
              src={att.url}
              controls
              preload="metadata"
              className="max-w-full max-h-52 rounded-lg" />);


        }

        // Document
        return (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isMine ?
              "hsl(var(--primary) / 0.08)" :
              "hsl(var(--muted) / 0.5)",
              border: `1px solid ${isMine ? "hsl(var(--primary) / 0.15)" : "hsl(var(--border) / 0.5)"}`
            }}>
            
            {getFileIcon(att.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                {att.name}
              </p>
              {att.size &&
              <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {formatFileSize(att.size)}
                </p>
              }
            </div>
          </a>);

      })}
    </div>);

}