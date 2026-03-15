/**
 * DemandNotificationWidget - Right panel widget in NexusDesk
 * Shows pending demand notifications with acknowledge button.
 */
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClipboardList, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDemandNotifications } from '@/hooks/useDemandNotifications';

export function DemandNotificationWidget() {
  const {
    demandNotifications,
    unreadDemandCount,
    acknowledgeDemand,
    isAcknowledging,
  } = useDemandNotifications();

  const pendingDemands = demandNotifications.filter((n) => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-xl p-4"
      style={{
        backgroundColor: '#18181B',
        border: '1px solid #27272A',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" style={{ color: '#C2410C' }} />
          <h3
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: '#71717A' }}
          >
            Demandas
          </h3>
        </div>
        {unreadDemandCount > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
          >
            {unreadDemandCount}
          </span>
        )}
      </div>

      {/* Content */}
      {pendingDemands.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#52525B' }}>
          Nenhuma demanda pendente
        </p>
      ) : (
        <ScrollArea className="max-h-[240px]">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {pendingDemands.slice(0, 5).map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(194, 65, 12, 0.08)',
                    border: '1px solid rgba(194, 65, 12, 0.15)',
                  }}
                >
                  <p
                    className="text-xs font-medium mb-1 line-clamp-2"
                    style={{ color: '#D4D4D8' }}
                  >
                    {notification.message}
                  </p>
                  <p className="text-[10px] mb-2" style={{ color: '#52525B' }}>
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                  {notification.resource_id && (
                    <Button
                      size="sm"
                      className="w-full h-7 text-[11px] font-medium rounded-md"
                      style={{
                        backgroundColor: '#C2410C',
                        color: '#FFFFFF',
                      }}
                      disabled={isAcknowledging}
                      onClick={() => acknowledgeDemand(notification.resource_id!)}
                    >
                      {isAcknowledging ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Acusar Recebimento
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </motion.div>
  );
}
