import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import { WorkspacePage } from '@/hooks/useWorkspacePages';

interface PageBreadcrumbProps {
  currentPage: WorkspacePage;
  allPages: WorkspacePage[];
}

export function PageBreadcrumb({ currentPage, allPages }: PageBreadcrumbProps) {
  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: WorkspacePage[] = [];
    let current: WorkspacePage | undefined = currentPage;

    while (current) {
      path.unshift(current);
      current = allPages.find(p => p.id === current?.parent_page_id);
    }

    return path;
  }, [currentPage, allPages]);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link
        to="/app/marketing/documentos"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Documentos</span>
      </Link>

      {breadcrumbPath.map((page, index) => (
        <span key={page.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {index === breadcrumbPath.length - 1 ? (
            <span className="text-foreground font-medium flex items-center gap-1">
              <span>{page.icon}</span>
              <span className="truncate max-w-[150px]">{page.title}</span>
            </span>
          ) : (
            <Link
              to={`/app/marketing/documentos/${page.id}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>{page.icon}</span>
              <span className="truncate max-w-[100px]">{page.title}</span>
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
