import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'operador' | 'leitura';
export type UserType = 'internal' | 'supplier' | 'nos_admin';

interface SupplierInfo {
  id: string;
  name: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  modules_enabled: string[];
  marketing_workforce_model: 'internal' | 'agency';
}

export type PagesAllowed = Record<string, string[] | null> | null;

export type HierarchyLevel = 'diretor' | 'chefe' | 'colaborador' | 'secretaria';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  userType: UserType | null;
  departmentRole: string | null;
  hierarchyLevel: HierarchyLevel | null;
  department: string | null;
  supplier: SupplierInfo | null;
  tenant: TenantInfo | null;
  userModulesAllowed: string[] | null;
  userPagesAllowed: PagesAllowed;
  mustChangePassword: boolean;
  loading: boolean;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  hasPermission: (requiredRoles: AppRole[]) => boolean;
  isInternal: () => boolean;
  isSupplier: () => boolean;
  isNosAdmin: () => boolean;
  isAgency: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [departmentRole, setDepartmentRole] = useState<string | null>(null);
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [userModulesAllowed, setUserModulesAllowed] = useState<string[] | null>(null);
  const [userPagesAllowed, setUserPagesAllowed] = useState<PagesAllowed>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Tracks initial auth bootstrap (prevents redirect flickers)
  const initializedRef = useRef(false);

  // Tracks whether initial auth hydration completed successfully.
  // After this, subsequent SIGNED_IN events (tab refocus) are handled silently.
  const initialAuthDoneRef = useRef(false);

  const clearAuthorizationState = () => {
    setRole(null);
    setUserType(null);
    setDepartmentRole(null);
    setHierarchyLevel(null);
    setDepartment(null);
    setSupplier(null);
    setTenant(null);
    setUserModulesAllowed(null);
    setUserPagesAllowed(null);
    setMustChangePassword(false);
  };

  type HydrateResult = {
    authorized: boolean;
    deactivated?: boolean;
    maintenance?: boolean;
    role: AppRole | null;
    userType: UserType | null;
    departmentRole: string | null;
    hierarchyLevel: HierarchyLevel | null;
    department: string | null;
    userModulesAllowed: string[] | null;
    userPagesAllowed: PagesAllowed;
    mustChangePassword: boolean;
    tenant: TenantInfo | null;
    supplier: SupplierInfo | null;
  };

  const hydrateAuthorizationForUser = async (userId: string): Promise<HydrateResult> => {
    // 0) Check maintenance mode
    const { data: maintenanceSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .maybeSingle();

    if (maintenanceSetting?.value === true || maintenanceSetting?.value === 'true') {
      return {
        authorized: false,
        maintenance: true,
        role: null,
        userType: null,
        departmentRole: null,
        hierarchyLevel: null,
        department: null,
        userModulesAllowed: null,
        userPagesAllowed: null,
        mustChangePassword: false,
        tenant: null,
        supplier: null,
      };
    }

    // 1) user_roles (role/user_type/tenant/modules_allowed)
    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role, user_type, tenant_id, modules_allowed, pages_allowed, department_role, hierarchy_level, department, is_active, must_change_password')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (roleError) {
      throw new Error(`Falha ao carregar permissões do usuário: ${roleError.message}`);
    }

    if (!roleRow) {
      // No role found - closed registration
      return {
        authorized: false,
        role: null,
        userType: null,
        departmentRole: null,
        hierarchyLevel: null,
        department: null,
        userModulesAllowed: null,
        userPagesAllowed: null,
        mustChangePassword: false,
        tenant: null,
        supplier: null,
      };
    }

    // Block inactive users
    const isActive = (roleRow as any).is_active;
    if (isActive === false) {
      return {
        authorized: false,
        deactivated: true,
        role: null,
        userType: null,
        departmentRole: null,
        hierarchyLevel: null,
        department: null,
        userModulesAllowed: null,
        userPagesAllowed: null,
        mustChangePassword: false,
        tenant: null,
        supplier: null,
      };
    }

    const resolvedRole = (roleRow.role as AppRole) ?? null;
    const resolvedUserType = ((roleRow.user_type as UserType) || 'internal') as UserType;
    const resolvedDepartmentRole = (roleRow as { department_role?: string | null }).department_role ?? null;
    const resolvedHierarchyLevel = ((roleRow as any).hierarchy_level as HierarchyLevel) ?? null;
    const resolvedDepartment = ((roleRow as any).department as string) ?? null;
    const resolvedModulesAllowed = (roleRow as { modules_allowed?: string[] | null }).modules_allowed ?? null;
    const resolvedPagesAllowed: PagesAllowed = (roleRow as { pages_allowed?: PagesAllowed }).pages_allowed ?? null;
    const resolvedMustChangePassword = (roleRow as any).must_change_password === true;

    // 2) tenant
    let resolvedTenant: TenantInfo | null = null;
    if (roleRow.tenant_id) {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, slug, modules_enabled, marketing_workforce_model')
        .eq('id', roleRow.tenant_id)
        .maybeSingle();

      if (tenantError) {
        throw new Error(`Falha ao carregar dados da organização: ${tenantError.message}`);
      }

      if (tenantData) {
        resolvedTenant = {
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          modules_enabled: tenantData.modules_enabled || [],
          marketing_workforce_model: (tenantData.marketing_workforce_model as 'internal' | 'agency') || 'internal',
        };
      }
    }

    // 3) supplier
    let resolvedSupplier: SupplierInfo | null = null;
    if (resolvedUserType === 'supplier') {
      const { data: supplierData, error: supplierError } = await supabase
        .from('user_suppliers')
        .select('supplier_id, suppliers(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (supplierError) {
        throw new Error(`Falha ao carregar dados do fornecedor: ${supplierError.message}`);
      }

      if (supplierData?.suppliers) {
        const supplierInfo = supplierData.suppliers as unknown as SupplierInfo;
        resolvedSupplier = {
          id: supplierInfo.id,
          name: supplierInfo.name,
        };
      }
    }

    return {
      authorized: true,
      role: resolvedRole,
      userType: resolvedUserType,
      departmentRole: resolvedDepartmentRole,
      hierarchyLevel: resolvedHierarchyLevel,
      department: resolvedDepartment,
      userModulesAllowed: resolvedModulesAllowed,
      userPagesAllowed: resolvedPagesAllowed,
      mustChangePassword: resolvedMustChangePassword,
      tenant: resolvedTenant,
      supplier: resolvedSupplier,
    };
  };

  const applyHydratedAuthorization = (result: HydrateResult) => {
    setRole(result.role);
    setUserType(result.userType);
    setDepartmentRole(result.departmentRole);
    setHierarchyLevel(result.hierarchyLevel);
    setDepartment(result.department);
    setUserModulesAllowed(result.userModulesAllowed);
    setUserPagesAllowed(result.userPagesAllowed);
    setMustChangePassword(result.mustChangePassword);
    setTenant(result.tenant);
    setSupplier(result.supplier);
  };

  const signOutUnauthorized = async (opts?: {
    deactivated?: boolean;
    maintenance?: boolean;
    message?: string;
  }) => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearAuthorizationState();

    window.dispatchEvent(
      new CustomEvent('auth:unauthorized', {
        detail: {
          message:
            opts?.message ??
            (opts?.maintenance
              ? '🔧 Sistema em manutenção. Voltamos em instantes.'
              : opts?.deactivated
                ? 'Sua conta foi desativada. Entre em contato com o administrador.'
                : 'Acesso não autorizado. Entre em contato com o administrador.'),
        },
      })
    );
  };

  // Listen for password-changed event from ForcePasswordChangeOverlay
  useEffect(() => {
    const handler = () => setMustChangePassword(false);
    window.addEventListener('auth:password-changed', handler);
    return () => window.removeEventListener('auth:password-changed', handler);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const onSignedIn = (userId: string) => {
      // IMPORTANT: never call backend inside onAuthStateChange callback
      setTimeout(() => {
        (async () => {
          if (!isMounted) return;

          // Only show global loading on the very first sign-in.
          // Subsequent auth events (tab refocus / token refresh) are handled silently.
          const isFirstAuth = !initialAuthDoneRef.current;
          if (isFirstAuth) setLoading(true);

          try {
            const result = await hydrateAuthorizationForUser(userId);
            if (!isMounted) return;

            if (!result.authorized) {
              await signOutUnauthorized({
                deactivated: result.deactivated,
                maintenance: result.maintenance,
              });
              return;
            }

            applyHydratedAuthorization(result);
            initialAuthDoneRef.current = true;
          } catch (e) {
            if (!isMounted) return;

            // First auth must never leave user in limbo state.
            if (isFirstAuth) {
              await signOutUnauthorized({
                message:
                  e instanceof Error
                    ? e.message
                    : 'Falha ao carregar permissões. Atualize a página e tente novamente.',
              });
            }
          } finally {
            if (isMounted && isFirstAuth) setLoading(false);
          }
        })();
      }, 0);
    };

    const initializeAuth = async () => {
      try {
        // STEP 1: Restore session from storage FIRST — this ensures auth.uid() is
        // available for RLS-protected queries before any listener fires.
        const { data: { session: restoredSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(restoredSession);
        setUser(restoredSession?.user ?? null);

        // Hydrate permissions if session exists
        if (restoredSession?.user) {
          try {
            const result = await hydrateAuthorizationForUser(restoredSession.user.id);
            if (!isMounted) return;

            if (!result.authorized) {
              await signOutUnauthorized({
                deactivated: result.deactivated,
                maintenance: result.maintenance,
              });
            } else {
              applyHydratedAuthorization(result);
              initialAuthDoneRef.current = true;
            }
          } catch (e) {
            if (!isMounted) return;
            await signOutUnauthorized({
              message:
                e instanceof Error
                  ? e.message
                  : 'Falha ao carregar permissões. Atualize a página e tente novamente.',
            });
          }
        } else {
          clearAuthorizationState();
        }
      } finally {
        if (isMounted) {
          initializedRef.current = true;
          setLoading(false);
          setIsReady(true);
        }
      }

      // STEP 2: Register listener AFTER getSession() resolved.
      // Handle INITIAL_SESSION when initial hydration is not done yet.
      if (!isMounted) return;

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Clear authorization if signed out
        if (!session?.user) {
          clearAuthorizationState();
          return;
        }

        if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && !initialAuthDoneRef.current)) {
          onSignedIn(session.user.id);
          return;
        }

        // For other events (TOKEN_REFRESHED, etc.), refresh authz in the background
        setTimeout(() => {
          void (async () => {
            try {
              const result = await hydrateAuthorizationForUser(session.user!.id);
              if (!isMounted) return;
              if (!result.authorized) {
                await signOutUnauthorized({
                  deactivated: result.deactivated,
                  maintenance: result.maintenance,
                });
                return;
              }
              applyHydratedAuthorization(result);
            } catch {
              // Background refresh failure shouldn't kick the user out
            }
          })();
        }, 0);
      });

      subscription = sub;
    };

    void initializeAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check maintenance mode before attempting login
    const { data: maintenanceSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .maybeSingle();

    if (maintenanceSetting?.value === true || maintenanceSetting?.value === 'true') {
      return { error: new Error('🔧 Sistema em manutenção. Voltamos em instantes.') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearAuthorizationState();
    // Redirect to institutional domain after sign out
    window.location.href = 'https://nexus.araripe.me';
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const hasPermission = (requiredRoles: AppRole[]) => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  const isInternal = () => userType === 'internal';
  const isSupplier = () => userType === 'supplier';
  const isNosAdmin = () => userType === 'nos_admin';
  const isAgency = () => departmentRole === 'agencia';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      userType,
      departmentRole,
      hierarchyLevel,
      department,
      supplier,
      tenant,
      userModulesAllowed,
      userPagesAllowed,
      mustChangePassword,
      loading,
      isReady,
      signIn,
      signUp,
      signOut,
      resetPassword,
      hasPermission,
      isInternal,
      isSupplier,
      isNosAdmin,
      isAgency,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
