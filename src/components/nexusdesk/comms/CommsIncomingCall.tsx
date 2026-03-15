/**
 * Incoming call overlay — fullscreen modal with accept/decline.
 */
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CallType } from '@/hooks/useHWCalling';

interface Props {
  callerName: string;
  callerAvatar?: string;
  callType: CallType;
  onAccept: () => void;
  onDecline: () => void;
}

export function CommsIncomingCall({ callerName, callerAvatar, callType, onAccept, onDecline }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'hsl(var(--background) / 0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Pulse rings */}
      <div className="relative mb-8">
        <div className="absolute inset-0 -m-6 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'hsl(var(--primary))' }} />
        <div className="absolute inset-0 -m-3 rounded-full animate-pulse opacity-30" style={{ backgroundColor: 'hsl(var(--primary))' }} />
        <Avatar className="h-28 w-28 relative z-10">
          {callerAvatar && <AvatarImage src={callerAvatar} />}
          <AvatarFallback className="text-4xl font-bold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
            {callerName?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      </div>

      <p className="text-2xl font-bold text-foreground mb-1">{callerName}</p>
      <p className="text-sm text-muted-foreground mb-12">
        {callType === 'video' ? 'Chamada de vídeo' : 'Chamada de voz'}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
          >
            <PhoneOff className="h-7 w-7" />
          </button>
          <span className="text-xs text-muted-foreground">Recusar</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ backgroundColor: 'hsl(142 76% 36%)', color: 'white' }}
          >
            {callType === 'video' ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
          </button>
          <span className="text-xs text-muted-foreground">Atender</span>
        </div>
      </div>
    </motion.div>
  );
}
