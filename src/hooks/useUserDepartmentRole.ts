import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * All functional department roles supported by the system.
 */
export type DepartmentRole =
  | 'diretor'
  | 'gestor_marketing'
  | 'supervisor'
  | 'gerente_loja'
  | 'auxiliar_administrativo'
  | 'social_media'
  | 'gestor_trade'
  | 'auxiliar_trade'
  | 'secretaria'
  | 'agencia'
  | 'gestor';

/**
 * All departments supported by the system.
 */
export type Department =
  | 'rh'
  | 'marketing'
  | 'trade'
  | 'tecnologia'
  | 'ti'
  | 'financeiro'
  | 'loja'
  | 'cd'
  | 'compras'
  | 'diretoria'
  | 'comercial';

/**
 * Human-readable labels for each department (PT-BR).
 */
export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'diretoria', label: 'Diretoria' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'trade', label: 'Trade Marketing' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'ti', label: 'TI' },
  { value: 'loja', label: 'Loja' },
  { value: 'cd', label: 'Centro de Distribuição' },
  { value: 'compras', label: 'Compras' },
];

const DEPARTMENT_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map(d => [d.value, d.label])
);

/**
 * Returns the PT-BR label for a department.
 */
export function getDepartmentLabel(department: string | undefined | null): string {
  if (!department) return 'Não definido';
  return DEPARTMENT_LABEL_MAP[department] || department;
}

/**
 * Access level derived from functional role.
 */
export type AccessLevel = 'gestor' | 'colaborador' | 'agencia';

/**
 * Maps each functional role to its access level.
 */
export const CARGO_TO_ACCESS_LEVEL: Record<DepartmentRole, AccessLevel> = {
  diretor: 'gestor',
  gestor_marketing: 'gestor',
  supervisor: 'gestor',
  gerente_loja: 'colaborador',
  auxiliar_administrativo: 'colaborador',
  social_media: 'colaborador',
  gestor_trade: 'gestor',
  auxiliar_trade: 'colaborador',
  secretaria: 'gestor',
  agencia: 'agencia',
  gestor: 'gestor',
};

/**
 * Human-readable labels for each functional role (PT-BR).
 */
export const DEPARTMENT_ROLES: { value: DepartmentRole; label: string }[] = [
  { value: 'diretor', label: 'Diretor(a)' },
  { value: 'gestor_marketing', label: 'Gestor de Marketing' },
  { value: 'supervisor', label: 'Supervisor(a)' },
  { value: 'gerente_loja', label: 'Gerente de Loja' },
  { value: 'auxiliar_administrativo', label: 'Auxiliar Administrativo' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'gestor_trade', label: 'Gestor de Trade' },
  { value: 'auxiliar_trade', label: 'Auxiliar de Trade' },
  { value: 'secretaria', label: 'Secretária' },
  { value: 'agencia', label: 'Agência' },
];

const DEPARTMENT_ROLE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DEPARTMENT_ROLES.map(r => [r.value, r.label])
);

/**
 * Returns the PT-BR label for a department role.
 */
export function getDepartmentRoleLabel(role: string | undefined | null): string {
  if (!role) return 'Colaborador';
  return DEPARTMENT_ROLE_LABEL_MAP[role] || role;
}

/**
 * Resolves any department_role string to its access level.
 */
export function getAccessLevel(role: string | undefined | null): AccessLevel {
  if (!role) return 'colaborador';
  if (role in CARGO_TO_ACCESS_LEVEL) {
    return CARGO_TO_ACCESS_LEVEL[role as DepartmentRole];
  }
  if (role === 'gestor') return 'gestor';
  if (role === 'agencia') return 'agencia';
  return 'colaborador';
}

export interface UserDepartmentData {
  departmentRole: string;
  department: string | null;
}

export function useUserDepartmentRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['department-role', user?.id],
    queryFn: async (): Promise<string> => {
      if (!user?.id) return 'auxiliar_administrativo';

      const { data, error } = await supabase
        .from('user_roles')
        .select('department_role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching department role:', error);
        return 'auxiliar_administrativo';
      }

      return data?.department_role || 'auxiliar_administrativo';
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches both department_role and department for the current user.
 */
export function useUserDepartment() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-department', user?.id],
    queryFn: async (): Promise<{ departmentRole: string; department: string | null }> => {
      if (!user?.id) return { departmentRole: 'auxiliar_administrativo', department: null };

      const { data, error } = await supabase
        .from('user_roles')
        .select('department_role, department')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching department:', error);
        return { departmentRole: 'auxiliar_administrativo', department: null };
      }

      return {
        departmentRole: data?.department_role || 'auxiliar_administrativo',
        department: (data as any)?.department || null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches the hierarchy_level for the current user.
 */
export function useUserHierarchy() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-hierarchy', user?.id],
    queryFn: async (): Promise<string> => {
      if (!user?.id) return 'colaborador';

      const { data, error } = await supabase
        .from('user_roles')
        .select('hierarchy_level')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hierarchy:', error);
        return 'colaborador';
      }

      return (data as any)?.hierarchy_level || 'colaborador';
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check functions — work with both legacy and new functional roles.
 */
export function isGestor(role: string | undefined): boolean {
  return getAccessLevel(role) === 'gestor';
}

export function isColaborador(role: string | undefined): boolean {
  return getAccessLevel(role) === 'colaborador';
}

export function isAgencia(role: string | undefined): boolean {
  return getAccessLevel(role) === 'agencia';
}
