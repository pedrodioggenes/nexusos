import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, ImageIcon } from "lucide-react";
import { useDemandAttachmentUpload } from "@/hooks/useDemandAttachmentUpload";
import { GLOBAL_ACCEPTED_TYPES } from "@/lib/upload-constants";
import { cn } from "@/lib/utils";

interface EvidenceUploadFieldProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export function EvidenceUploadField({
  urls,
  onChange,
  maxFiles = 10,
  label = "Fotos de comprovação",
}: EvidenceUploadFieldProps) {
  const { upload, isUploading, progress } = useDemandAttachmentUpload({
    onSuccess: (url) => {
      onChange([...urls, url]);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxFiles - urls.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      await upload(file);
    }

    // Reset input
    e.target.value = "";
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

  return (
    <div className="space-y-2">
      <Label className="text-xs flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5" />
        {label}
      </Label>

      {/* Thumbnails grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-muted"
            >
              {isImage(url) ? (
                <img
                  src={url}
                  alt={`Evidência ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {urls.length < maxFiles && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="w-full border-dashed gap-2"
            onClick={() => document.getElementById("evidence-upload-input")?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Enviando... {progress}%
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" />
                Adicionar foto ({urls.length}/{maxFiles})
              </>
            )}
          </Button>
          <input
            id="evidence-upload-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
