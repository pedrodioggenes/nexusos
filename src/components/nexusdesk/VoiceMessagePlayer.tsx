/**
 * Inline audio player for voice messages — WhatsApp-style waveform look.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: string; // from attachment name
  isMine: boolean;
}

export function VoiceMessagePlayer({ url, isMine }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const animRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    setProgress(pct);
    setCurrentTime(audio.currentTime);
    animRef.current = requestAnimationFrame(updateProgress);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(updateProgress);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, updateProgress]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio play error:", err);
      }
    }
  }, [isPlaying]);

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
    setProgress(pct * 100);
    setCurrentTime(audio.currentTime);
  };

  const displayTime = isPlaying || currentTime > 0
    ? formatTime(currentTime)
    : totalDuration > 0
    ? formatTime(totalDuration)
    : "0:00";

  // Generate pseudo-waveform bars
  const bars = 28;
  const waveform = useRef(
    Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8)
  ).current;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{
          backgroundColor: isMine
            ? "hsl(var(--primary))"
            : "hsl(var(--primary) / 0.15)",
          color: isMine
            ? "hsl(var(--primary-foreground))"
            : "hsl(var(--primary))",
        }}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </button>

      {/* Waveform + progress */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="flex items-end gap-[2px] h-6 cursor-pointer"
          onClick={handleSeek}
        >
          {waveform.map((h, i) => {
            const barPct = ((i + 1) / bars) * 100;
            const isActive = barPct <= progress;
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-full min-w-[2px]"
                style={{
                  height: `${h * 100}%`,
                  backgroundColor: isActive
                    ? isMine
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary))"
                    : isMine
                    ? "hsl(var(--primary) / 0.3)"
                    : "hsl(var(--muted-foreground) / 0.25)",
                  transition: "background-color 0.1s",
                }}
              />
            );
          })}
        </div>
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
        >
          {displayTime}
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
