/**
 * Active call screen — shows local/remote video, call controls.
 * For voice calls, renders hidden <audio> elements to play remote streams.
 */
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CallStatus, CallType } from '@/hooks/useHWCalling';

interface Props {
  callStatus: CallStatus;
  callType: CallType | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  otherUserName?: string;
  otherUserAvatar?: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

/**
 * Hidden audio element that plays a remote MediaStream.
 * Essential for voice calls and video call audio.
 */
function RemoteAudio({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    // Autoplay may be blocked — try to play explicitly
    el.play().catch(err => {
      console.warn('[HWCalling] Audio autoplay blocked, will retry on user interaction:', err);
    });
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

function VideoTile({ stream, muted, label, isSelf }: { stream: MediaStream | null; muted?: boolean; label?: string; isSelf?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    // Ensure playback starts
    el.play().catch(err => {
      console.warn('[HWCalling] Video autoplay issue:', err);
    });
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
          style={{ transform: isSelf ? 'scaleX(-1)' : undefined }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }}>
            <span className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
              {label?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}
      {label && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-medium"
          style={{ backgroundColor: 'hsl(var(--background) / 0.7)', color: 'hsl(var(--foreground))' }}>
          {label}
        </div>
      )}
    </div>
  );
}

function CallTimer({ startTime }: { startTime: Date | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>;
}

export function CommsActiveCall({
  callStatus, callType, localStream, remoteStreams,
  isMuted, isVideoOff, otherUserName, otherUserAvatar,
  onToggleMute, onToggleVideo, onEndCall,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStartTime] = useState(() => callStatus === 'active' ? new Date() : null);
  const isVideo = callType === 'video';
  const hasRemote = remoteStreams.size > 0;

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[100] flex flex-col'
    : 'h-full flex flex-col';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={containerClass}
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Hidden audio elements for ALL remote streams (voice + video calls) */}
      {[...remoteStreams.entries()].map(([userId, stream]) => (
        <RemoteAudio key={`audio-${userId}`} stream={stream} />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {otherUserAvatar && <AvatarImage src={otherUserAvatar} />}
            <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
              {otherUserName?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{otherUserName || 'Chamada'}</p>
            <p className="text-[10px] text-muted-foreground">
              {callStatus === 'calling' && 'Chamando...'}
              {callStatus === 'ringing' && 'Tocando...'}
              {callStatus === 'active' && <CallTimer startTime={callStartTime} />}
              {callStatus === 'ended' && 'Encerrada'}
            </p>
          </div>
        </div>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-xl transition-colors hover:bg-muted">
          {isFullscreen ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <Maximize2 className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden p-3">
        {isVideo ? (
          <>
            {/* Remote video (main) */}
            <div className="w-full h-full">
              {hasRemote ? (
                <div className={`w-full h-full ${remoteStreams.size > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
                  {[...remoteStreams.entries()].map(([userId, stream]) => (
                    <VideoTile key={userId} stream={stream} label={otherUserName} />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                  <Avatar className="h-24 w-24">
                    {otherUserAvatar && <AvatarImage src={otherUserAvatar} />}
                    <AvatarFallback className="text-3xl font-bold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
                      {otherUserName?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{otherUserName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {callStatus === 'calling' ? 'Chamando...' : callStatus === 'ringing' ? 'Tocando...' : 'Conectando...'}
                    </p>
                  </div>
                  {/* Pulse animation */}
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full animate-ping absolute" style={{ backgroundColor: 'hsl(var(--primary) / 0.4)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Local video (PIP) */}
            {localStream && !isVideoOff && (
              <div className="absolute bottom-5 right-5 w-32 h-44 rounded-xl overflow-hidden shadow-lg border" style={{ borderColor: 'hsl(var(--border))' }}>
                <VideoTile stream={localStream} muted isSelf label="Você" />
              </div>
            )}
          </>
        ) : (
          /* Voice call — show avatar */
          <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-6" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <div className="relative">
              <Avatar className="h-28 w-28">
                {otherUserAvatar && <AvatarImage src={otherUserAvatar} />}
                <AvatarFallback className="text-4xl font-bold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
                  {otherUserName?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {callStatus !== 'active' && (
                <div className="absolute -bottom-1 -right-1">
                  <div className="w-4 h-4 rounded-full animate-ping absolute" style={{ backgroundColor: 'hsl(var(--primary) / 0.4)' }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-foreground">{otherUserName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {callStatus === 'calling' ? 'Chamando...' : callStatus === 'ringing' ? 'Tocando...' : callStatus === 'active' ? 'Chamada de voz' : 'Conectando...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-5 shrink-0">
        <button
          onClick={onToggleMute}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isMuted ? 'hsl(var(--destructive))' : 'hsl(var(--muted))',
            color: isMuted ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--foreground))',
          }}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {isVideo && (
          <button
            onClick={onToggleVideo}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: isVideoOff ? 'hsl(var(--destructive))' : 'hsl(var(--muted))',
              color: isVideoOff ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--foreground))',
            }}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
        )}

        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  );
}
