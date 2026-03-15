import React, { useMemo, createContext, useContext, useState, useCallback, useEffect, Suspense } from "react";

import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  UNSAFE_RouteContext,
} from "react-router-dom";
import { motion } from "framer-motion";
import { getAppRouteConfig } from "@/config/app-routes";

// ─── Types ────────────────────────────────────────────────────

export interface EmbeddedNavState {
  currentPath: string;
  depth: number;
  pathHistory: string[];
  goBack: () => void;
  goToDepth: (depth: number) => void;
  basePath: string;
  initialPath: string;
}

const EmbeddedNavContext = createContext<EmbeddedNavState | null>(null);

export function useEmbeddedNav() {
  return useContext(EmbeddedNavContext);
}

// ─── Loading Fallback ─────────────────────────────────────────

function RouteFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#52525B', borderTopColor: 'transparent' }}
        />
        <span className="text-xs" style={{ color: '#52525B' }}>Carregando...</span>
      </div>
    </div>
  );
}

// ─── Router Context Reset ─────────────────────────────────────

function RouterContextReset({ children }: { children: React.ReactNode }) {
  return (
    <UNSAFE_LocationContext.Provider value={null as any}>
      <UNSAFE_NavigationContext.Provider value={null as any}>
        <UNSAFE_RouteContext.Provider value={{ outlet: null, matches: [], isDataRoute: false }}>
          {children}
        </UNSAFE_RouteContext.Provider>
      </UNSAFE_NavigationContext.Provider>
    </UNSAFE_LocationContext.Provider>
  );
}

// ─── Inner Router Content ─────────────────────────────────────

/**
 * This component lives INSIDE the MemoryRouter and:
 * 1. Syncs location changes back to parent state
 * 2. Exposes the navigate function to the parent context
 * 3. Renders all module routes
 */
function InnerRouterContent({
  onLocationChange,
  onNavigateReady,
  routeElements,
}: {
  onLocationChange: (path: string) => void;
  onNavigateReady: (nav: (to: number | string) => void) => void;
  routeElements: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    onLocationChange(location.pathname);
  }, [location.pathname, onLocationChange]);

  useEffect(() => {
    onNavigateReady((to: number | string) => {
      navigate(to as any);
    });
  }, [navigate, onNavigateReady]);

  return (
    <Routes>
      {routeElements}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: '#52525B' }}>Página não encontrada neste contexto</p>
          </div>
        }
      />
    </Routes>
  );
}

// ─── Provider ─────────────────────────────────────────────────

interface EmbeddedNavProviderProps {
  moduleId: string;
  initialPagePath: string;
  shell?: React.ReactNode;
}

export function EmbeddedNavProvider({ moduleId, initialPagePath, shell }: EmbeddedNavProviderProps) {
  const routeConfig = getAppRouteConfig(moduleId);
  const basePath = routeConfig?.basePath || `/app/${moduleId}`;
  const initialFullPath = `${basePath}/${initialPagePath}`.replace(/\/+$/g, '').replace(/\/+/g, '/');

  const [currentPath, setCurrentPath] = useState(initialFullPath);
  const [pathHistory, setPathHistory] = useState<string[]>([initialFullPath]);
  const navigateRef = React.useRef<((to: number | string) => void) | null>(null);

  const handleLocationChange = useCallback((pathname: string) => {
    setCurrentPath(pathname);
    setPathHistory(prev => {
      const idx = prev.indexOf(pathname);
      if (idx >= 0) return prev.slice(0, idx + 1);
      return [...prev, pathname];
    });
  }, []);

  const handleNavigateReady = useCallback((nav: (to: number | string) => void) => {
    navigateRef.current = nav;
  }, []);

  const goBack = useCallback(() => {
    navigateRef.current?.(-1);
  }, []);

  const goToDepth = useCallback((d: number) => {
    const target = pathHistory[d - 1];
    if (target) navigateRef.current?.(target);
  }, [pathHistory]);

  const depth = pathHistory.length;

  const contextValue = useMemo<EmbeddedNavState>(() => ({
    currentPath, depth, pathHistory, goBack, goToDepth, basePath, initialPath: initialFullPath,
  }), [currentPath, depth, pathHistory, goBack, goToDepth, basePath, initialFullPath]);

  const routeElements = useMemo(() => {
    if (!routeConfig) return null;
    return routeConfig.routes.map((route) => {
      const LazyComponent = React.lazy(route.loader);
      const fullPath = route.path
        ? `${basePath}/${route.path}`.replace(/\/+/g, '/')
        : basePath;
      return (
        <Route
          key={fullPath}
          path={fullPath}
          element={
            <Suspense fallback={<RouteFallback />}>
              <LazyComponent />
            </Suspense>
          }
        />
      );
    });
  }, [routeConfig, basePath]);

  if (!routeConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: '#52525B' }}>Rotas não configuradas para "{moduleId}"</p>
      </div>
    );
  }

  return (
    <EmbeddedNavContext.Provider value={contextValue}>
      <div className="h-full flex flex-col overflow-hidden">
        {shell}
        <div
          className="flex-1 overflow-auto min-h-0 hw-embedded-container"
          style={{ backgroundColor: '#0f0f10' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full p-3 md:p-5 max-w-7xl mx-auto w-full"
          >
            <RouterContextReset>
              <MemoryRouter initialEntries={[initialFullPath]}>
                <InnerRouterContent
                  onLocationChange={handleLocationChange}
                  onNavigateReady={handleNavigateReady}
                  routeElements={routeElements}
                />
              </MemoryRouter>
            </RouterContextReset>
          </motion.div>
        </div>
      </div>
    </EmbeddedNavContext.Provider>
  );
}
