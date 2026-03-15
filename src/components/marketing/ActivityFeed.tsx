import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Megaphone, 
  Wallet, 
  Target, 
  FileText, 
  CheckCircle, 
  Edit,
  Upload,
  Bell,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  action: string;
  target?: string;
  targetHref?: string;
  type: "campaign" | "budget" | "goal" | "document" | "approval" | "edit" | "upload" | "alert";
  timestamp: Date;
}

const typeConfig = {
  campaign: { icon: Megaphone, color: "text-violet-500", bgColor: "bg-violet-500/10" },
  budget: { icon: Wallet, color: "text-app-gestao", bgColor: "bg-app-gestao/10" },
  goal: { icon: Target, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  document: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  approval: { icon: CheckCircle, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  edit: { icon: Edit, color: "text-muted-foreground", bgColor: "bg-muted" },
  upload: { icon: Upload, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  alert: { icon: Bell, color: "text-destructive", bgColor: "bg-destructive/10" },
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  limit?: number;
  onViewAll?: () => void;
  className?: string;
}

export function ActivityFeed({
  activities,
  isLoading = false,
  limit = 5,
  onViewAll,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);
  
  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold">Atividade Recente</h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-muted-foreground hover:text-foreground">
            Ver tudo
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      
      <div className="px-4 pb-4 space-y-1">
        {displayActivities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  {activity.user.avatar && <AvatarImage src={activity.user.avatar} />}
                  <AvatarFallback className="text-[10px] bg-muted">
                    {activity.user.initials || activity.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium text-foreground">{activity.user.name}</span>
                    {" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                    {activity.target && (
                      <>
                        {" "}
                        <span className="font-medium text-app-gestao hover:underline cursor-pointer">
                          {activity.target}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                
                <div className={cn("h-6 w-6 rounded flex items-center justify-center shrink-0", config.bgColor)}>
                  <Icon className={cn("h-3 w-3", config.color)} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
