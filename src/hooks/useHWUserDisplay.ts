import { useAuth } from "@/contexts/AuthContext";

/**
 * Extracts common user display info (displayName, initials, email, firstName)
 * from the auth context. Replaces repeated derivation logic across 6+ components.
 */
export function useHWUserDisplay() {
  const { user, tenant } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const initials = displayName.slice(0, 2).toUpperCase();
  const firstName = displayName.split(" ")[0];
  const email = user?.email || "usuario@empresa.com";
  const tenantName = tenant?.name || "Empresa";

  return { displayName, initials, firstName, email, tenantName, user, tenant };
}
