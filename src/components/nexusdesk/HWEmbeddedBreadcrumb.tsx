/**
 * HWEmbeddedBreadcrumb
 * 
 * Dynamic breadcrumb for embedded pages within the NexusDesk shell.
 * Reads navigation depth from EmbeddedNavigationContext and renders
 * a clickable path: NexusDesk > Module > Page > Sub-page
 * 
 * Preserves the original visual style with module-colored labels.
 */

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEmbeddedNav } from "@/contexts/EmbeddedNavigationContext";
import { getWorkbenchPageById, getWorkbenchAppForPage } from "@/config/workbench-registry";
import { APP_PATHS } from "@/config/route-paths";

interface HWEmbeddedBreadcrumbProps {
  pageId: string;
}

/**
 * Extract a human-readable label from a URL path segment.
 * E.g., 'demandas' → 'Demandas', 'nova-demanda' → 'Nova Demanda'
 */
function segmentToLabel(segment: string): string {
  // Skip UUID-like segments — show as "Detalhe"
  if (/^[0-9a-f]{8}-/.test(segment)) return 'Detalhe';
  // Skip purely numeric segments
  if (/^\d+$/.test(segment)) return `#${segment}`;
  
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function HWEmbeddedBreadcrumb({ pageId }: HWEmbeddedBreadcrumbProps) {
  const parentNavigate = useNavigate();
  const embeddedNav = useEmbeddedNav();
  const page = getWorkbenchPageById(pageId);
  const module = getWorkbenchAppForPage(pageId);

  if (!page || !module) return null;

  const moduleBasePath = APP_PATHS[module.appId] || `/app/${module.appId}`;
  const depth = embeddedNav?.depth ?? 1;
  const canGoBack = depth > 1;

  // Build extra breadcrumb segments from navigation depth
  const extraSegments: string[] = [];
  if (embeddedNav && embeddedNav.pathHistory.length > 1) {
    const initialPath = embeddedNav.pathHistory[0];
    const currentPath = embeddedNav.currentPath;
    
    if (currentPath !== initialPath) {
      // Get the part after the initial path
      const suffix = currentPath.replace(initialPath, '').replace(/^\//, '');
      if (suffix) {
        const parts = suffix.split('/').filter(Boolean);
        parts.forEach(part => {
          extraSegments.push(segmentToLabel(part));
        });
      }
    }
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-2 shrink-0"
      style={{ backgroundColor: '#18181B', borderBottom: '1px solid #27272A' }}
    >
      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#71717A' }}>
        {/* Back button when depth > 1 */}
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 mr-1"
            style={{ color: '#A1A1AA' }}
            onClick={() => embeddedNav?.goBack()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}

        <span>NexusDesk</span>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: module.appColor }}>{module.appLabel}</span>
        <ChevronRight className="h-3 w-3" />
        
        {/* Page title — clickable if there are sub-segments */}
        {extraSegments.length > 0 ? (
          <button
            className="hover:underline cursor-pointer transition-colors"
            style={{ color: '#A1A1AA' }}
            onClick={() => {
              // Navigate back to root page
              if (embeddedNav) {
                const stepsBack = embeddedNav.pathHistory.length - 1;
                for (let i = 0; i < stepsBack; i++) {
                  embeddedNav.goBack();
                }
              }
            }}
          >
            {page.title}
          </button>
        ) : (
          <span style={{ color: '#D4D4D8' }}>{page.title}</span>
        )}

        {/* Extra segments from drill-down navigation */}
        {extraSegments.map((segment, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: idx === extraSegments.length - 1 ? '#D4D4D8' : '#A1A1AA' }}>
              {segment}
            </span>
          </span>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-[10px] gap-1"
        style={{ color: '#52525B' }}
        onClick={() => parentNavigate(moduleBasePath)}
      >
        Abrir app completo
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}
