import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * NexusIA Layout 2
 * Simplified full-screen container with guaranteed height chain
 */
export function IALayout2() {
  const { user, loading, signOut, isNosAdmin, isSupplier } = useAuth();
  const navigate = useNavigate();

  // Non-blocking: redirect only when loading is complete
  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!loading && isNosAdmin()) return <Navigate to="/auth" replace />;
  if (!loading && isSupplier()) return <Navigate to="/app/trade/fornecedor" replace />;

  return (
    <div className="h-[100dvh] w-screen bg-background overflow-hidden">
      <Outlet context={{ signOut, navigate, user }} />
    </div>
  );
}

export default IALayout2;
