import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, ImageIcon, FileIcon, Film, Music, Archive, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GLOBAL_ACCEPTED_TYPES,
  GLOBAL_MAX_FILE_SIZE,
  GLOBAL_MAX_FILE_SIZE_LABEL,
  GLOBAL_ACCEPT_STRING,
  getFileCategoryFromUrl,
  formatFileSize,
} from '@/lib/upload-constants';

interface CampaignMediaUploaderProps {
  assets: string[];
  onAssetsChange: (urls: string[]) => void;
  campaignId?: string;
  maxFiles?: number;
  disabled?: boolean;
}

function getFileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split('/').pop() || 'arquivo');
  } catch {
    return url.split('/').pop() || 'arquivo';
  }
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case 'video': return <Film className={className} />;
    case 'audio': return <Music className={className} />;
    case 'design': return <Palette className={className} />;
    case 'archive': return <Archive className={className} />;
    case 'document': return <FileIcon className={className} />;
    default: return <FileIcon className={className} />;
  }
}

export function CampaignMediaUploader({
  assets,
  onAssetsChange,
  maxFiles = 20,
  disabled = false,
}: CampaignMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => {
      if (!GLOBAL_ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: 'Tipo inválido', description: `${f.name} — formato não suportado`, variant: 'destructive' });
        return false;
      }
      if (f.size > GLOBAL_MAX_FILE_SIZE) {
        toast({ title: 'Arquivo grande', description: `${f.name} excede ${GLOBAL_MAX_FILE_SIZE_LABEL}`, variant: 'destructive' });
        return false;
      }
      return true;
    });

    if (assets.length + validFiles.length > maxFiles) {
      toast({ title: 'Limite atingido', description: `Máximo de ${maxFiles} arquivos`, variant: 'destructive' });
      return;
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of validFiles) {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('campaign-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        continue;
      }

      const { data: signedData } = await supabase.storage
        .from('campaign-media')
        .createSignedUrl(data.path, 3600);

      newUrls.push(signedData?.signedUrl || data.path);
    }

    if (newUrls.length > 0) {
      onAssetsChange([...assets, ...newUrls]);
    }
    setUploading(false);
  }, [assets, maxFiles, onAssetsChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, [disabled, uploading, uploadFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  }, [uploadFiles]);

  const handleRemove = useCallback((index: number) => {
    onAssetsChange(assets.filter((_, i) => i !== index));
  }, [assets, onAssetsChange]);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={GLOBAL_ACCEPT_STRING}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Imagens, vídeos, PSD, PDF, ZIP e mais — até {GLOBAL_MAX_FILE_SIZE_LABEL} por arquivo ({assets.length}/{maxFiles})
            </p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((url, index) => {
            const category = getFileCategoryFromUrl(url);
            const fileName = getFileNameFromUrl(url);

            return (
              <div key={url} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                {category === 'image' ? (
                  <img
                    src={url}
                    alt={`Asset ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : category === 'video' ? (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                    <CategoryIcon category={category} className="h-10 w-10 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground text-center truncate w-full">{fileName}</span>
                  </div>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
