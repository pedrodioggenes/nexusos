import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between pb-2 mb-2 border-b border-border">
      <div className="min-w-0">
        <h1 className="text-sm font-condensed font-semibold text-foreground tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
