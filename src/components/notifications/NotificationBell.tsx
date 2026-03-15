/**
 * NotificationBell - Header component for notifications
 * 
 * Shows unread count badge and opens NotificationInbox in a popover.
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationInbox } from './NotificationInbox';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
}

export function NotificationBell({ className, iconClassName }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative h-8 w-8", className)}
        >
          <Bell className={cn("h-4 w-4", iconClassName)} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Notificações'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-xl" 
        align="end"
        sideOffset={8}
      >
        <NotificationInbox onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
