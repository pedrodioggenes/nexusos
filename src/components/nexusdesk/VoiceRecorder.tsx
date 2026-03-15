/**
 * WhatsApp-style voice recorder for DM composer.
 * Press mic to start, press again (or send) to stop and send.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { DMAttachment } from "@/hooks/useHWDMs";

const BUCKET = "dm-attachments";
const MAX_DURATION = 300; // 5 minutes

interface VoiceRecorderProps {
  onSend: (content: string, attachments: DMAttachment[]) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onSend, onRecordingStart, onRecordingStop, disabled }: VoiceRecorderProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      // Prefer webm/opus, fallback to whatever is available
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setIsRecording(true);
      setDuration(0);
      onRecordingStart?.();

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= MAX_DURATION - 1) {
            // Auto-stop at max duration
            handleSend();
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic access error:", err);
      toast.error("Microfone bloqueado", {
        description: "Permita o acesso ao microfone nas configurações do navegador.",
      });
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopRecordingCleanup();
    setIsRecording(false);
    setDuration(0);
    chunksRef.current = [];
    onRecordingStop?.();
  }, [stopRecordingCleanup]);

  const handleSend = useCallback(async () => {
    if (!mediaRecorderRef.current || !user?.id) return;

    const recorder = mediaRecorderRef.current;

    // Stop and wait for final data
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type: mime }));
      };
      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        const mime = recorder.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type: mime }));
      }
    });

    stopRecordingCleanup();
    setIsRecording(false);
    const recordedDuration = duration;
    setDuration(0);
    onRecordingStop?.();

    if (blob.size < 1000) {
      toast.info("Gravação muito curta");
      return;
    }

    setUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "m4a" : "webm";
      const path = `${user.id}/voice-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type });

      if (uploadError) {
        toast.error("Erro ao enviar áudio");
        return;
      }

      const { data: signedData } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 3600);

      const attachment: DMAttachment = {
        url: signedData?.signedUrl || path,
        path,
        name: `Mensagem de voz (${formatDuration(recordedDuration)})`,
        type: blob.type,
        size: blob.size,
        source: "upload",
      };

      onSend("🎤 Mensagem de voz", [attachment]);
    } catch {
      toast.error("Erro ao enviar mensagem de voz");
    } finally {
      setUploading(false);
    }
  }, [user?.id, duration, onSend, stopRecordingCleanup]);

  if (uploading) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
        >
          <Send className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isRecording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2"
        >
          {/* Cancel */}
          <button
            type="button"
            onClick={handleCancel}
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "hsl(var(--destructive))" }}
            title="Cancelar"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Pulsing indicator + duration */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ backgroundColor: "hsl(var(--destructive) / 0.1)" }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "hsl(var(--destructive))" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-xs font-mono font-medium tabular-nums"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {formatDuration(duration)}
            </span>
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
            title="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="idle"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
          style={{
            color: "hsl(var(--muted-foreground))",
          }}
          title="Gravar mensagem de voz"
        >
          <Mic className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
