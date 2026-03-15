import { useState, useMemo } from 'react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X, 
  Megaphone, 
  Settings, 
  AlertCircle,
  Package,
  FileCheck,
  Zap,
  Filter,
  Search,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<string, React.ElementType> = {
  campaign: Megaphone,
  system: Settings,
  alert: AlertCircle,
  trade: Package,
  proof: FileCheck,
  insight: Zap,
  demand: FileCheck,
  execution: Zap,
};

const typeColors: Record<string, string> = {
  campaign: 'bg-blue-500/10 text-blue-500',
  system: 'bg-amber-500/10 text-amber-500',
  alert: 'bg-destructive/10 text-destructive',
  trade: 'bg-success/10 text-success',
  proof: 'bg-primary/10 text-primary',
  insight: 'bg-accent/10 text-accent',
  demand: 'bg-orange-500/10 text-orange-500',
  execution: 'bg-emerald-500/10 text-emerald-500',
};

interface NotificationInboxProps {
  onClose?: () => void;
}

export function NotificationInbox({ onClose }: NotificationInboxProps) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!n.title.toLowerCase().includes(searchLower) && 
            !n.message.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'unread') return !n.read;
      if (activeTab !== 'all') return n.type === activeTab;
      return true;
    });
  }, [notifications, search, activeTab]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    
    filteredNotifications.forEach(n => {
      const date = new Date(n.created_at);
      let key: string;
      
      if (isToday(date)) {
        key = 'Hoje';
      } else if (isYesterday(date)) {
        key = 'Ontem';
      } else {
        key = format(date, "dd 'de' MMMM", { locale: ptBR });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const markSelectedAsRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    deselectAll();
  };

  const deleteSelected = () => {
    selectedIds.forEach(id => deleteNotification(id));
    deselectAll();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on metadata
    const meta = notification.metadata as Record<string, unknown> | null;
    if (meta?.link && typeof meta.link === 'string') {
      navigate(meta.link);
      onClose?.();
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'Não lidas' },
    { value: 'campaign', label: 'Campanhas' },
    { value: 'system', label: 'Sistema' },
    { value: 'trade', label: 'Trade' },
  ];

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col card-elevated">
      {/* Header */}
      <CardHeader className="p-4 pb-3 border-b space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Marcar todas
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => clearAll()} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Limpar todas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Buscar notificações..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-7 w-full justify-start">
            {notificationTypes.map(type => (
              <TabsTrigger 
                key={type.value} 
                value={type.value} 
                className="text-[10px] h-6 px-2"
              >
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      {/* Batch Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-muted/50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedIds.size === filteredNotifications.length}
                  onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                />
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} selecionada{selectedIds.size > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={markSelectedAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar lidas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-destructive hover:text-destructive"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
              {search && (
                <Button 
                  variant="link" 
                  className="text-xs" 
                  onClick={() => setSearch('')}
                >
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-background/95 backdrop-blur px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide border-b">
                    {date}
                  </div>
                  <AnimatePresence mode="popLayout">
                    {items.map((notification) => {
                      const Icon = typeIcons[notification.type] || Bell;
                      const isSelected = selectedIds.has(notification.id);
                      
                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className={cn(
                            'group relative flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                            !notification.read && 'bg-primary/5',
                            isSelected && 'bg-primary/10'
                          )}
                        >
                          <div 
                            className="shrink-0 pt-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(notification.id);
                            }}
                          >
                            <Checkbox checked={isSelected} />
                          </div>

                          <div 
                            className="flex items-start gap-3 flex-1 min-w-0"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={cn('p-2 rounded-full shrink-0', typeColors[notification.type])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  'text-sm truncate',
                                  notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>

                          {/* Quick actions */}
                          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                title="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              title="Excluir"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default NotificationInbox;
