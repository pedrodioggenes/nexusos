/**
 * Call history list — shows past calls with status, duration, and re-call action.
 */
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHWCallHistory } from '@/hooks/useHWCallHistory';
import type { CallType } from '@/hooks/useHWCalling';

interface Props {
  onStartCall: (userId: string, type: CallType) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function CallStatusIcon({ status, isOutgoing }: { status: string; isOutgoing: boolean }) {
  if (status === 'missed' || status === 'declined') {
    return <PhoneMissed className="h-3.5 w-3.5" style={{ color: 'hsl(var(--destructive))' }} />;
  }
  if (isOutgoing) {
    return <PhoneOutgoing className="h-3.5 w-3.5" style={{ color: 'hsl(var(--primary))' }} />;
  }
  return <PhoneIncoming className="h-3.5 w-3.5" style={{ color: 'hsl(142 76% 36%)' }} />;
}

export function CommsCallHistory({ onStartCall }: Props) {
  const { data: calls, isLoading } = useHWCallHistory();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!calls?.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <Phone className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground/70">Nenhuma chamada</p>
          <p className="text-xs mt-1.5 text-muted-foreground max-w-[220px] mx-auto">
            Suas chamadas de voz e vídeo aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-1.5 py-1 space-y-0.5">
        {calls.map(call => {
          const other = call.other_participants[0];
          if (!other) return null;
          const isMissed = call.status === 'missed' || call.status === 'declined';

          return (
            <div
              key={call.id}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'hsl(var(--muted))')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Avatar className="h-10 w-10 shrink-0">
                {other.avatar_url && <AvatarImage src={other.avatar_url} />}
                <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                  {other.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CallStatusIcon status={call.status} isOutgoing={call.is_outgoing} />
                  <p className="text-xs font-semibold truncate" style={{ color: isMissed ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))' }}>
                    {other.full_name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {call.call_type === 'video' ? 'Vídeo' : 'Voz'}
                  </span>
                  {call.duration_seconds != null && call.duration_seconds > 0 && (
                    <>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{formatDuration(call.duration_seconds)}</span>
                    </>
                  )}
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(call.created_at)}</span>
                </div>
              </div>

              {/* Re-call buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onStartCall(other.user_id, 'voice')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: 'hsl(var(--primary))' }}
                  title="Chamada de voz"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onStartCall(other.user_id, 'video')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: 'hsl(var(--primary))' }}
                  title="Chamada de vídeo"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
