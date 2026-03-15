/**
 * Global incoming call banner — iOS-style card that appears at the top of the screen
 * regardless of which NexusDesk sub-app the user is in.
 * Features: Accept, Decline, and Silence (minimize without declining).
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VolumeX, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { startRingtone, stopRingtone } from '@/lib/ringtone';
import type { CallType } from '@/hooks/useHWCalling';

interface Props {
  callerName: string;
  callerAvatar?: string;
  callType: CallType;
  onAccept: () => void;
  onDecline: () => void;
}

export function GlobalIncomingCallBanner({ callerName, callerAvatar, callType, onAccept, onDecline }: Props) {
  const [silenced, setSilenced] = useState(false);

  // Start ringtone when banner mounts, stop on unmount or silence
  useEffect(() => {
    if (!silenced) {
      startRingtone();
    }
    return () => stopRingtone();
  }, []);

  useEffect(() => {
    if (silenced) {
      stopRingtone();
    }
  }, [silenced]);

  const handleAccept = () => {
    stopRingtone();
    onAccept();
  };

  const handleDecline = () => {
    stopRingtone();
    onDecline();
  };

  const handleSilence = () => {
    setSilenced(true);
  };

  return (
    <AnimatePresence>
      {silenced ? (
        /* Minimized pill — subtle indicator that a call is still incoming */
        <motion.div
          key="silenced"
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-3 inset-x-0 mx-auto z-[300] w-fit"
        >
          <div
            className="flex items-center gap-2.5 rounded-full px-4 py-2 shadow-lg border cursor-pointer"
            style={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.25)',
            }}
            onClick={() => setSilenced(false)}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'hsl(142 76% 36%)' }}
            />
            <span className="text-xs font-medium text-foreground">{callerName}</span>
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleDecline(); }}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))' }}
              >
                <PhoneOff className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAccept(); }}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: 'hsl(142 76% 36%)', color: 'white' }}
              >
                <Phone className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Full banner */
        <motion.div
          key="full"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-3 inset-x-0 mx-auto z-[300] w-[calc(100%-24px)] max-w-sm"
        >
          <div
            className="rounded-2xl p-4 shadow-2xl border"
            style={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Caller info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  {callerAvatar && <AvatarImage src={callerAvatar} />}
                  <AvatarFallback
                    className="text-base font-bold"
                    style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}
                  >
                    {callerName?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {/* Pulse indicator */}
                <span
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full animate-pulse border-2"
                  style={{
                    backgroundColor: 'hsl(142 76% 36%)',
                    borderColor: 'hsl(var(--card))',
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{callerName}</p>
                <p className="text-xs text-muted-foreground">
                  {callType === 'video' ? 'Chamada de vídeo recebida' : 'Chamada de voz recebida'}
                </p>
              </div>
              {/* Silence / minimize button */}
              <button
                onClick={handleSilence}
                className="h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0"
                style={{
                  backgroundColor: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
                title="Silenciar"
              >
                <VolumeX className="h-4 w-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: 'hsl(var(--destructive) / 0.12)',
                  color: 'hsl(var(--destructive))',
                }}
              >
                <PhoneOff className="h-4 w-4" />
                Recusar
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: 'hsl(142 76% 36%)',
                  color: 'white',
                }}
              >
                {callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                Atender
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
