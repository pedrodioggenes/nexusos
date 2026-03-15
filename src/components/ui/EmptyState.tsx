/**
 * EmptyState - Consistent empty state component
 * 
 * Provides a standardized empty state with:
 * - Icon
 * - Title
 * - Description
 * - Optional CTA action
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SolidCard, SolidCardContent } from '@/components/ui/solid-card';
import { InboxIcon, PlusCircle } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  variant?: 'default' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = 'default',
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      iconWrapper: 'p-2',
      icon: 'h-6 w-6',
      title: 'text-sm font-medium',
      description: 'text-xs',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'p-3',
      icon: 'h-8 w-8',
      title: 'text-base font-medium',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'p-4',
      icon: 'h-10 w-10',
      title: 'text-lg font-semibold',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  const content = (
    <div className={cn('flex flex-col items-center text-center', sizes.container, className)}>
      <div
        className={cn(
          'rounded-full bg-muted/50 mb-4',
          sizes.iconWrapper
        )}
      >
        {icon || <InboxIcon className={cn('text-muted-foreground', sizes.icon)} />}
      </div>
      
      <h3 className={cn('text-foreground mb-1', sizes.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn('text-muted-foreground max-w-sm', sizes.description)}>
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4"
          size={size === 'sm' ? 'sm' : 'default'}
        >
          {action.icon || <PlusCircle className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <SolidCard className={className}>
        <SolidCardContent>{content}</SolidCardContent>
      </SolidCard>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('border border-dashed border-border rounded-lg', className)}>
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Specialized empty states for common scenarios
 */

export function NoDataEmptyState({
  action,
  className,
}: {
  action?: EmptyStateProps['action'];
  className?: string;
}) {
  return (
    <EmptyState
      title="Nenhum dado encontrado"
      description="Não há registros para exibir no momento."
      action={action}
      className={className}
    />
  );
}

export function NoResultsEmptyState({
  searchQuery,
  onClearSearch,
  className,
}: {
  searchQuery: string;
  onClearSearch?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      title="Nenhum resultado"
      description={`Não encontramos resultados para "${searchQuery}". Tente ajustar os termos de busca.`}
      action={
        onClearSearch
          ? {
              label: 'Limpar busca',
              onClick: onClearSearch,
            }
          : undefined
      }
      className={className}
    />
  );
}

export function NoAccessEmptyState({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Acesso restrito"
      description="Você não tem permissão para visualizar este conteúdo."
      className={className}
    />
  );
}

export function ErrorEmptyState({
  error,
  onRetry,
  className,
}: {
  error?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      title="Algo deu errado"
      description={error || 'Ocorreu um erro ao carregar os dados. Tente novamente.'}
      action={
        onRetry
          ? {
              label: 'Tentar novamente',
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  );
}

export default EmptyState;
