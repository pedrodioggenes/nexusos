/**
 * useAccessControl — Centralized access control hook
 * 
 * Consumes AuthContext to provide module/page access checks.
 * Used by: AppUserMenu, Layout files, AccessDenied, ChatShell, etc.
 */
import { useAuth } from "@/contexts/AuthContext";
import { APP_PATHS } from "@/config/route-paths";

export function useAccessControl() {
  const {
    userModulesAllowed,
    userPagesAllowed,
    departmentRole,
    userType,
    hierarchyLevel,
    department,
    tenant,
  } = useAuth();

  /** Can the user access a given module (by appId key)? */
  const canAccessModule = (moduleKey: string): boolean => {
    if (!userModulesAllowed) return true; // null = unrestricted
    return userModulesAllowed.includes(moduleKey);
  };

  /** Can the user access a specific page within a module? */
  const canAccessPage = (moduleKey: string, pageKey: string): boolean => {
    if (!canAccessModule(moduleKey)) return false;
    if (!userPagesAllowed) return true; // null = all pages
    const modulePages = (userPagesAllowed as Record<string, string[] | null>)?.[moduleKey];
    if (!modulePages) return true; // null for this module = all pages
    return modulePages.includes(pageKey);
  };

  /** Filter a list of modules to only those the user can access */
  const getAvailableModules = <T extends { key: string }>(allModules: T[]): T[] => {
    if (!userModulesAllowed) return allModules;
    return allModules.filter((m) => userModulesAllowed.includes(m.key));
  };

  /** 
   * Can the user access the Portal hub?
   * true only if unrestricted (null) or has 2+ modules allowed
   */
  const canAccessPortal = !userModulesAllowed || userModulesAllowed.length >= 2;

  /**
   * Returns the "home" route for the user:
   * - Single module → that module's path
   * - Multiple/unrestricted → /app/desk
   */
  const getAllowedHomeRoute = (): string => {
    // Agency lockdown: always go to marketing
    if (isAgency) return "/app/marketing";
    if (!userModulesAllowed) return "/app/desk";
    if (userModulesAllowed.length === 1) {
      return APP_PATHS[userModulesAllowed[0]] || "/app/desk";
    }
    return "/app/desk";
  };

  const isAgency = departmentRole === "agencia";
  const isSupplier = userType === "supplier";

  return {
    canAccessModule,
    canAccessPage,
    getAvailableModules,
    canAccessPortal,
    getAllowedHomeRoute,
    isAgency,
    isSupplier,
    hierarchyLevel,
    department,
  };
}
