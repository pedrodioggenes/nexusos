/**
 * AccessGate - Unified access control component (Enterprise)
 * 
 * Provides consistent access control across the application based on:
 * - Authentication status
 * - User type (internal, supplier, nos_admin)
 * - Role (admin, operador, leitura)
 * - Module access (via RPC is_module_enabled)
 * - Feature flags (via RPC is_feature_enabled)
 * 
 * Features:
 * - LoadingState during validation
 * - AccessDenied on rejection
 * - TanStack Query cache (staleTime 60s) to avoid RPC spam
 * - NOS admin bypass option
 * 
 * IMPORTANT: This is a UI helper. Real enforcement happens on the server via RLS.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth, AppRole, UserType } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AccessDenied } from '@/components/guards/AccessDenied';

interface AccessGateProps {
  children: React.ReactNode;

  // Auth / role / type gates
  requireAuth?: boolean;
  allowedUserTypes?: UserType[];
  allowedRoles?: AppRole[];

  // Governance gates
  requireApp?: string;   // Check if app is enabled for tenant + user
  /** @deprecated Use requireApp */
  requireModule?: string;
  requireFeature?: string; // RPC: is_feature_enabled(p_user_id, p_feature)

  // Behavior
  redirectToAuth?: string; // default depends on path
  bypassForNosAdmin?: boolean; // default true
}

interface AccessCheckResult {
  moduleOk: boolean;
  featureOk: boolean;
}

export function AccessGate({
  children,
  requireAuth = true,
  allowedUserTypes,
  allowedRoles,
  requireApp,
  requireModule,
  requireFeature,
  redirectToAuth,
  bypassForNosAdmin = true,
}: AccessGateProps) {
  // Support both requireApp and deprecated requireModule
  const effectiveRequireApp = requireApp || requireModule;
  const location = useLocation();
  const { user, loading, isReady, role, userType, isNosAdmin, tenant, userModulesAllowed } = useAuth();
  const { getAllowedHomeRoute } = useAccessControl();

  // Determine auth redirect path
  const authPath = redirectToAuth ?? '/auth';

  // 1) Loading inicial do auth
  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verificando autenticação..." />
      </div>
    );
  }

  // 2) Auth required
  if (requireAuth && !user) {
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  // 3) NOS admin bypass (useful for maintenance)
  if (bypassForNosAdmin && isNosAdmin()) {
    return <>{children}</>;
  }

  // Compute the user's allowed home for redirects
  const userHome = getAllowedHomeRoute();

  // 4) userType gate
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    if (!userType || !allowedUserTypes.includes(userType)) {
      return (
        <AccessDenied
          title="Tipo de usuário não permitido"
          description="Seu tipo de conta não tem acesso a esta área."
          backTo={userHome}
        />
      );
    }
  }

  // 5) role gate
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return (
        <AccessDenied
          title="Permissão insuficiente"
          description="Você não possui o nível de permissão necessário para esta ação."
          backTo={userHome}
        />
      );
    }
  }

  // 6) Module gate - LOCAL CHECK (instantâneo, sem RPC)
  if (effectiveRequireApp) {
    // Fail-safe: if auth is ready and tenant is missing, don't lock user in infinite loading
    if (!tenant) {
      return (
        <AccessDenied
          title="Permissões incompletas"
          description="Não foi possível carregar as permissões da sua organização."
          details="Faça login novamente. Se o problema persistir, contate o administrador."
          backTo="/auth"
        />
      );
    }
    
    const tenantHasApp = tenant?.modules_enabled?.includes(effectiveRequireApp);
    const userHasAccess = !userModulesAllowed || userModulesAllowed.includes(effectiveRequireApp);
    
    if (!tenantHasApp) {
      return (
        <AccessDenied
          title="Aplicativo não habilitado"
          description={`O aplicativo "${effectiveRequireApp}" não está disponível para sua organização.`}
          details="Entre em contato com o administrador para habilitar este aplicativo."
          backTo={userHome}
        />
      );
    }
    
    if (!userHasAccess) {
      return (
        <AccessDenied
          title="Acesso ao aplicativo restrito"
          description={`Você não tem permissão para acessar o aplicativo "${effectiveRequireApp}".`}
          details="Entre em contato com o administrador para solicitar acesso."
          backTo={userHome}
        />
      );
    }
  }

  // Check if we need governance validation (only for features now)
  const shouldCheckGovernance = Boolean(user && requireFeature);

  // 7) Feature check with short cache (TanStack Query) - mantido para features específicas
  const accessQuery = useQuery({
    queryKey: [
      "access-check",
      user?.id ?? null,
      requireFeature ?? null,
    ],
    enabled: shouldCheckGovernance,
    staleTime: 60_000, // 60s cache to avoid RPC spam
    queryFn: async (): Promise<AccessCheckResult> => {
      if (!user || !requireFeature) return { moduleOk: true, featureOk: true };

      const { data, error } = await supabase.rpc("is_feature_enabled", {
        p_user_id: user.id,
        p_feature: requireFeature,
      });

      if (error) {
        throw new Error(
          `Falha ao verificar feature "${requireFeature}". Verifique se a RPC is_feature_enabled existe. Detalhe: ${error.message}`
        );
      }

      return { moduleOk: true, featureOk: Boolean(data) };
    },
  });

  // If no governance check needed (no requireFeature), render children
  if (!shouldCheckGovernance) {
    return <>{children}</>;
  }

  // Loading governance check
  if (accessQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verificando permissões..." />
      </div>
    );
  }

  // Error in governance check
  if (accessQuery.isError) {
    const message =
      accessQuery.error instanceof Error ? accessQuery.error.message : "Erro desconhecido";

    toast.error("Falha na validação de acesso");

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ErrorState
          title="Erro de validação"
          message={message}
          onRetry={() => accessQuery.refetch()}
        />
      </div>
    );
  }

  const { featureOk } = accessQuery.data ?? { featureOk: true };

  // Feature not enabled
  if (!featureOk) {
    return (
      <AccessDenied
        title="Recurso não disponível"
        description={`O recurso "${requireFeature}" não está habilitado no seu plano.`}
        details="Entre em contato com o suporte para mais informações sobre este recurso."
        backTo="/portal"
      />
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component version for route protection
 */
export function withAccessGate<P extends object>(
  Component: React.ComponentType<P>,
  gateProps: Omit<AccessGateProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <AccessGate {...gateProps}>
        <Component {...props} />
      </AccessGate>
    );
  };
}

export default AccessGate;
