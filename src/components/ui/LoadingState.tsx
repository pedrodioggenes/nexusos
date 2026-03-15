/**
 * LoadingState - Consistent loading state component
 * 
 * Provides various loading states:
 * - Spinner
 * - Skeleton
 * - Progress bar
 * - Shimmer effect
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  className?: string;
}

export function LoadingState({
  message,
  variant = 'spinner',
  size = 'md',
  progress = 0,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: {
      spinner: 'h-4 w-4',
      container: 'py-4',
      text: 'text-xs',
      dots: 'h-1.5 w-1.5',
    },
    md: {
      spinner: 'h-6 w-6',
      container: 'py-8',
      text: 'text-sm',
      dots: 'h-2 w-2',
    },
    lg: {
      spinner: 'h-8 w-8',
      container: 'py-12',
      text: 'text-base',
      dots: 'h-2.5 w-2.5',
    },
  };

  const sizes = sizeClasses[size];

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', sizes.container, className)}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        {message && (
          <p className={cn('text-muted-foreground mt-4', sizes.text)}>{message}</p>
        )}
      </div>
    );
  }

  if (variant === 'progress') {
    return (
      <div className={cn('flex flex-col items-center', sizes.container, className)}>
        <div className="w-48 mb-2">
          <Progress value={progress} className="h-2" />
        </div>
        <p className={cn('text-muted-foreground', sizes.text)}>
          {message || `${Math.round(progress)}%`}
        </p>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center', sizes.container, className)}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'rounded-full bg-primary animate-bounce',
                sizes.dots
              )}
              style={{
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
        {message && (
          <p className={cn('text-muted-foreground mt-3', sizes.text)}>{message}</p>
        )}
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={cn('flex flex-col items-center justify-center', sizes.container, className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes.spinner)} />
      {message && (
        <p className={cn('text-muted-foreground mt-3', sizes.text)}>{message}</p>
      )}
    </div>
  );
}

/**
 * Page-level loading state
 */
export function PageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingState message={message} size="lg" />
    </div>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoading({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return <Loader2 className={cn('animate-spin text-muted-foreground', sizeClass, className)} />;
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border p-4 space-y-3', className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({
  columns = 5,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-4 py-3 px-4', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ maxWidth: i === 0 ? '40%' : '100%' }}
        />
      ))}
    </div>
  );
}

export default LoadingState;
