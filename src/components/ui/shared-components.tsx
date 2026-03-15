import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * ActionableCard - Card com suporte a navegação e acessibilidade
 * Substitui divs clicáveis por elementos semânticos com aria-labels
 */
interface ActionableCardProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  moduleColor?: 'gestao' | 'trade' | 'ofertas' | 'ia';
  showExternalIcon?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
}

export const ActionableCard = memo(function ActionableCard({
  children,
  href,
  onClick,
  className,
  moduleColor = 'gestao',
  showExternalIcon = true,
  isLoading = false,
  ariaLabel,
}: ActionableCardProps) {
  const navigate = useNavigate();

  const colorClasses = {
    gestao: 'hover:border-module-gestao/50 focus-visible:ring-module-gestao/50',
    trade: 'hover:border-module-trade/50 focus-visible:ring-module-trade/50',
    ofertas: 'hover:border-module-ofertas/50 focus-visible:ring-module-ofertas/50',
    ia: 'hover:border-module-ia/50 focus-visible:ring-module-ia/50',
  };

  const handleClick = useCallback(() => {
    if (href) {
      navigate(href);
    } else if (onClick) {
      onClick();
    }
  }, [href, navigate, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const isInteractive = !!(href || onClick);

  if (!isInteractive) {
    return (
      <Card className={cn("bg-card border-border", className)}>
        {children}
      </Card>
    );
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-card border-border transition-all duration-200",
        "cursor-pointer group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        colorClasses[moduleColor],
        "hover:shadow-lg",
        className
      )}
    >
      <div className="relative">
        {children}
        {showExternalIcon && (
          <ExternalLink className="absolute top-3 right-3 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
        )}
      </div>
    </Card>
  );
});

/**
 * DataFreshnessIndicator - Mostra quando os dados foram atualizados
 */
interface DataFreshnessIndicatorProps {
  lastUpdated?: Date | string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
  showRefresh?: boolean;
}

export const DataFreshnessIndicator = memo(function DataFreshnessIndicator({
  lastUpdated,
  isLoading = false,
  onRefresh,
  className,
  showRefresh = true,
}: DataFreshnessIndicatorProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'Atualização não disponível';
    
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `${diffMins}min atrás`;
      if (diffHours < 24) return `${diffHours}h atrás`;
      
      return format(d, "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 text-[10px] text-muted-foreground/60", className)}>
      <Clock className="h-3 w-3" />
      <span>{formatDate(lastUpdated)}</span>
      {showRefresh && onRefresh && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className="p-0.5 rounded hover:bg-muted transition-colors"
          title="Atualizar dados"
          aria-label="Atualizar dados"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
});

/**
 * StatCardAccessible - Versão acessível do StatCard com navegação
 */
interface StatCardAccessibleProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
  href?: string;
  onClick?: () => void;
  isLoading?: boolean;
  moduleColor?: 'gestao' | 'trade' | 'ofertas' | 'ia';
  progress?: number;
  iconColor?: string;
  iconBg?: string;
}

export const StatCardAccessible = memo(function StatCardAccessible({
  title,
  value,
  icon,
  change,
  positive = true,
  href,
  onClick,
  isLoading = false,
  moduleColor = 'gestao',
  progress,
  iconColor = 'text-foreground',
  iconBg = 'bg-muted',
}: StatCardAccessibleProps) {
  return (
    <ActionableCard
      href={href}
      onClick={onClick}
      moduleColor={moduleColor}
      ariaLabel={`${title}: ${value}${change ? `, variação ${change}` : ''}`}
      className="h-full"
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className={cn("h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center transition-colors", iconBg)}>
            {icon}
          </div>
          {change && (
            <span className={cn(
              "flex items-center gap-0.5 text-[9px] md:text-[10px]",
              positive ? 'text-success' : 'text-destructive'
            )}>
              {isLoading ? <Skeleton className="h-3 w-8" /> : change}
            </span>
          )}
        </div>
        <p className="text-base md:text-lg font-semibold text-foreground truncate">
          {isLoading ? <Skeleton className="h-5 w-16" /> : value}
        </p>
        <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">{title}</p>
        {progress !== undefined && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            )}
          </div>
        )}
      </CardContent>
    </ActionableCard>
  );
});

/**
 * SectionHeader - Cabeçalho de seção com data freshness
 */
interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  lastUpdated?: Date | string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  icon,
  lastUpdated,
  isLoading,
  onRefresh,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
        {(lastUpdated || isLoading) && (
          <DataFreshnessIndicator
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            onRefresh={onRefresh}
            className="mt-1"
          />
        )}
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
});

/**
 * DashboardHeader - Cabeçalho padrão de dashboard
 */
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: Date | string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  periodText?: string;
}

export const DashboardHeader = memo(function DashboardHeader({
  title,
  subtitle,
  lastUpdated,
  isLoading,
  onRefresh,
  periodText,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-base md:text-lg font-condensed font-semibold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] md:text-xs text-muted-foreground">
            {subtitle}
            {periodText && ` • ${periodText}`}
          </p>
        )}
      </div>
      <DataFreshnessIndicator
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={onRefresh}
        showRefresh={!!onRefresh}
        className="justify-end"
      />
    </div>
  );
});

export default ActionableCard;
