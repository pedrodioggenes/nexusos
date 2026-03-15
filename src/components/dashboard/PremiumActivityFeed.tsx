import { motion } from 'framer-motion';
import { 
  Megaphone, 
  CheckCircle, 
  Target, 
  FileText, 
  Clock,
  ChevronRight 
} from 'lucide-react';
import { PremiumGlassCard } from './PremiumGlassCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ActivityStatus = 'online' | 'away' | 'offline';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
    status?: ActivityStatus;
  };
  action: string;
  target: string;
  type: 'campaign' | 'approval' | 'goal' | 'document';
  timestamp: Date;
}

interface PremiumActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  limit?: number;
  onViewAll?: () => void;
  className?: string;
}

const typeConfig = {
  campaign: { icon: Megaphone, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  approval: { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  goal: { icon: Target, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  document: { icon: FileText, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
};

const statusConfig = {
  online: 'bg-success status-pulse-online',
  away: 'bg-amber-400',
  offline: 'bg-muted-foreground',
};

/**
 * Premium Activity Feed with status indicators
 * Magic UI / Aceternity UI aesthetic
 */
export function PremiumActivityFeed({ 
  activities, 
  isLoading,
  limit = 4,
  onViewAll,
  className 
}: PremiumActivityFeedProps) {
  const displayedActivities = activities.slice(0, limit);
  
  return (
    <PremiumGlassCard delay={0.25} className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-app-gestao" />
          <h3 className="text-sm font-semibold text-foreground">
            Atividade Recente
          </h3>
        </div>
        {onViewAll && (
          <motion.button
            onClick={onViewAll}
            whileHover={{ x: 3 }}
            className="text-xs font-medium text-app-gestao hover:text-app-gestao-glow flex items-center gap-1 transition-colors"
          >
            Ver tudo
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        )}
      </div>
      
      {/* Activity List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : displayedActivities.length > 0 ? (
          displayedActivities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            const status = activity.user.status || 'online';
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.3 + index * 0.1,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="flex items-start gap-3 group"
              >
                {/* Avatar with status */}
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={cn(
                      "text-xs font-medium",
                      config.bgColor,
                      config.color
                    )}>
                      {activity.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      statusConfig[status]
                    )} 
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-semibold">
                      {activity.user.name}
                    </span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium text-app-gestao">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
                
                {/* Type Icon */}
                <div className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                  config.bgColor,
                  "opacity-60 group-hover:opacity-100 transition-opacity"
                )}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente
            </p>
          </div>
        )}
      </div>
    </PremiumGlassCard>
  );
}

export type { ActivityItem, ActivityStatus };
