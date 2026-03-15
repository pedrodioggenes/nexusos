import { useState } from "react";
import { useHWNotifications, useMarkHWNotificationRead, useMarkAllHWNotificationsRead } from "@/hooks/useHWNotifications";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { Bell, CheckCheck, MessageSquare, Megaphone, GraduationCap, Users, FileText, Loader2, HandMetal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


function getNotificationIcon(type: string) {
  switch (type) {
    case 'dm': return <MessageSquare className="h-4 w-4" />;
    case 'broadcast': return <Megaphone className="h-4 w-4" />;
    case 'training': return <GraduationCap className="h-4 w-4" />;
    case 'post': return <FileText className="h-4 w-4" />;
    case 'team': return <Users className="h-4 w-4" />;
    case 'demand': return <HandMetal className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function isDemandNotification(n: { type: string; relatedEntityType: string | null }) {
  return n.type === 'demand' || n.relatedEntityType === 'marketing_demands';
}

export function HWNotificationsPanel() {
  const { data: tenantId } = useHWTenantId();
  const { data: dbNotifications, isLoading } = useHWNotifications(tenantId || undefined);
  const markRead = useMarkHWNotificationRead();
  const markAllRead = useMarkAllHWNotificationsRead();
  const [open, setOpen] = useState(false);
  const [ackingId, setAckingId] = useState<string | null>(null);

  const notifications = dbNotifications || [];
  const unreadCount = notifications.filter(n => !n.readAt).length;

  const handleMarkAllRead = () => {
    if (tenantId) markAllRead.mutate({ tenantId });
  };

  const handleAcknowledge = async (demandId: string, notificationId: string) => {
    setAckingId(notificationId);
    try {
      const { data, error } = await supabase.rpc('rpc_acknowledge_demand', {
        p_demand_id: demandId,
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro');
      toast.success('Recebimento confirmado! Demanda movida para "Fazendo".');
      if (tenantId) markRead.mutate({ id: notificationId, tenantId });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao acusar recebimento');
    } finally {
      setAckingId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 sm:h-8 sm:w-8 rounded-lg hover:bg-zinc-800 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
          style={{ color: '#71717A' }}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[340px] sm:w-[380px] p-0 rounded-xl overflow-hidden"
        style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #27272A' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg hover:bg-zinc-800" style={{ color: '#71717A' }} onClick={handleMarkAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#52525B' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto mb-2" style={{ color: '#3F3F46' }} />
              <p className="text-xs" style={{ color: '#52525B' }}>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const isDemand = isDemandNotification(n);
              const canAck = isDemand && !n.readAt && n.relatedEntityId;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
                  style={{ backgroundColor: !n.readAt ? 'rgba(194, 65, 12, 0.05)' : 'transparent', borderBottom: '1px solid #27272A' }}
                >
                  <button
                    className="w-full flex items-start gap-3"
                    onClick={() => {
                      if (!n.readAt && tenantId && !isDemand) markRead.mutate({ id: n.id, tenantId });
                    }}
                  >
                    <div
                      className="mt-0.5 p-1.5 rounded-lg shrink-0"
                      style={{ backgroundColor: !n.readAt ? 'rgba(194, 65, 12, 0.15)' : '#27272A', color: !n.readAt ? '#EA580C' : '#71717A' }}
                    >
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold truncate" style={{ color: !n.readAt ? '#FAFAFA' : '#A1A1AA' }}>{n.title}</p>
                        {!n.readAt && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#C2410C' }} />}
                      </div>
                      {n.message && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: '#71717A' }}>{n.message}</p>}
                      <p className="text-[10px] mt-1" style={{ color: '#52525B' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                  {/* ACK button for demand notifications */}
                  {canAck && (
                    <Button
                      size="sm"
                      className="mt-2 ml-10 h-7 text-xs rounded-lg gap-1.5"
                      style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
                      disabled={ackingId === n.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(n.relatedEntityId!, n.id);
                      }}
                    >
                      {ackingId === n.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <HandMetal className="h-3 w-3" />
                      )}
                      Acusar Recebimento
                    </Button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
