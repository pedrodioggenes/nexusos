import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RequireWorkspaceUserProps {
  children: React.ReactNode;
  allowSupplier?: boolean;
  supplierOnly?: boolean;
  internalOnly?: boolean;
}

/**
 * Route guard for workspace (client) users
 * Handles:
 * - internal users (CLIENT_INTERNAL_USER)
 * - supplier users (SUPPLIER_USER)
 * 
 * Redirects:
 * - /auth if not authenticated
 * - /console if nos_admin
 * - /app/trade/fornecedor if supplier trying to access internal routes
 * - /portal if internal user trying to access supplier routes
 */
export function RequireWorkspaceUser({ 
  children, 
  allowSupplier = true,
  supplierOnly = false,
  internalOnly = false,
}: RequireWorkspaceUserProps) {
  const { user, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar-background">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // NOS admins should use console
  if (userType === 'nos_admin') {
    return <Navigate to="/nos" replace />;
  }

  // Supplier-only routes
  if (supplierOnly && userType !== 'supplier') {
    return <Navigate to="/portal" replace />;
  }

  // Internal-only routes
  if (internalOnly && userType === 'supplier') {
    return <Navigate to="/app/trade/fornecedor" replace />;
  }

  // If suppliers not allowed on this route
  if (!allowSupplier && userType === 'supplier') {
    return <Navigate to="/app/trade/fornecedor" replace />;
  }

  return <>{children}</>;
}
