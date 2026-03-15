import { useMemo } from "react";
import { getWorkbenchPageById } from "@/config/workbench-registry";
import { HWEmbeddedBreadcrumb } from "@/components/nexusdesk/HWEmbeddedBreadcrumb";
import { EmbeddedNavProvider } from "@/contexts/EmbeddedNavigationContext";

interface HWEmbeddedPageProps {
  pageId: string;
}

export function HWEmbeddedPage({ pageId }: HWEmbeddedPageProps) {
  const page = getWorkbenchPageById(pageId);

  const { appId, pagePath } = useMemo(() => {
    if (!page) return { appId: '', pagePath: '' };
    return { appId: page.appId, pagePath: page.componentPath };
  }, [page]);

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: '#52525B' }}>Página não encontrada</p>
      </div>
    );
  }

  return (
    <EmbeddedNavProvider
      moduleId={appId}
      initialPagePath={pagePath}
      shell={
        <HWEmbeddedBreadcrumb pageId={pageId} />
      }
    />
  );
}
