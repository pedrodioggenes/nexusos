import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * NexusIA Embed Layout
 * Minimalista SEM 100dvh e SEM w-screen
 * Para uso em iframes ou containers com altura definida externamente
 */
export function IAEmbedLayout() {
  const { user, loading, signOut, isNosAdmin, isSupplier } = useAuth();
  const navigate = useNavigate();

  // Non-blocking: redirect only when loading is complete
  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!loading && isNosAdmin()) return <Navigate to="/auth" replace />;
  if (!loading && isSupplier()) return <Navigate to="/app/trade/fornecedor" replace />;

  // h-full herda do container pai, não força viewport
  return (
    <div className="h-full w-full bg-background overflow-hidden">
      <Outlet context={{ signOut, navigate, user }} />
    </div>
  );
}

export default IAEmbedLayout;
