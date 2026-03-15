/**
 * ErrorState - Consistent error state component
 * 
 * Provides actionable error states with:
 * - Error icon
 * - Error message
 * - Retry action
 * - Support/details action
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SolidCard, SolidCardContent } from '@/components/ui/solid-card';
import { AlertTriangle, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: 'default' | 'card' | 'inline' | 'toast';
  size?: 'sm' | 'md' | 'lg';
}

export function ErrorState({
  title = 'Erro',
  message,
  details,
  onRetry,
  onSupport,
  isRetrying = false,
  className,
  variant = 'default',
  size = 'md',
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const sizeClasses = {
    sm: {
      container: 'py-6 px-4',
      iconWrapper: 'p-2',
      icon: 'h-5 w-5',
      title: 'text-sm font-medium',
      message: 'text-xs',
      details: 'text-xs',
    },
    md: {
      container: 'py-10 px-6',
      iconWrapper: 'p-3',
      icon: 'h-6 w-6',
      title: 'text-base font-medium',
      message: 'text-sm',
      details: 'text-xs',
    },
    lg: {
      container: 'py-14 px-8',
      iconWrapper: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-lg font-semibold',
      message: 'text-base',
      details: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  const content = (
    <div className={cn('flex flex-col items-center text-center', sizes.container, className)}>
      <div
        className={cn(
          'rounded-full bg-destructive/10 mb-4',
          sizes.iconWrapper
        )}
      >
        <AlertTriangle className={cn('text-destructive', sizes.icon)} />
      </div>
      
      <h3 className={cn('text-foreground mb-1', sizes.title)}>
        {title}
      </h3>
      
      <p className={cn('text-muted-foreground max-w-md mb-4', sizes.message)}>
        {message}
      </p>
      
      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size={size === 'sm' ? 'sm' : 'default'}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')} />
            {isRetrying ? 'Tentando...' : 'Tentar novamente'}
          </Button>
        )}
        
        {onSupport && (
          <Button
            variant="outline"
            onClick={onSupport}
            size={size === 'sm' ? 'sm' : 'default'}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Suporte
          </Button>
        )}
      </div>
      
      {/* Details (expandable) */}
      {details && (
        <div className="mt-4 w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-muted-foreground"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ocultar detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Ver detalhes
              </>
            )}
          </Button>
          
          {showDetails && (
            <pre
              className={cn(
                'mt-2 p-3 rounded-lg bg-muted/50 text-left overflow-auto max-h-32',
                'font-mono',
                sizes.details
              )}
            >
              {details}
            </pre>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <SolidCard className={cn('border-destructive/20', className)}>
        <SolidCardContent>{content}</SolidCardContent>
      </SolidCard>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'border border-destructive/30 bg-destructive/5 rounded-lg',
          className
        )}
      >
        {content}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className={cn('flex items-start gap-3 p-4', className)}>
        <div className="p-1.5 rounded-full bg-destructive/10 shrink-0">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
          {(onRetry || onSupport) && (
            <div className="flex gap-2 mt-2">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="h-7 text-xs"
                >
                  {isRetrying ? 'Tentando...' : 'Tentar novamente'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
}

/**
 * Specialized error states
 */

export function NetworkErrorState({
  onRetry,
  isRetrying,
  className,
}: {
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}) {
  return (
    <ErrorState
      title="Erro de conexão"
      message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente."
      onRetry={onRetry}
      isRetrying={isRetrying}
      className={className}
    />
  );
}

export function ServerErrorState({
  error,
  onRetry,
  onSupport,
  isRetrying,
  className,
}: {
  error?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  isRetrying?: boolean;
  className?: string;
}) {
  return (
    <ErrorState
      title="Erro no servidor"
      message="Ocorreu um erro interno. Nossa equipe foi notificada e está trabalhando na solução."
      details={error}
      onRetry={onRetry}
      onSupport={onSupport}
      isRetrying={isRetrying}
      className={className}
    />
  );
}

export function PermissionErrorState({
  onSupport,
  className,
}: {
  onSupport?: () => void;
  className?: string;
}) {
  return (
    <ErrorState
      title="Permissão negada"
      message="Você não tem permissão para realizar esta ação. Entre em contato com o administrador."
      onSupport={onSupport}
      className={className}
    />
  );
}

export default ErrorState;
