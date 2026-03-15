import { useUserDepartmentRole, getAccessLevel } from "@/hooks/useUserDepartmentRole";
import { useUserDepartment } from "@/hooks/useUserDepartmentRole";
import { useUserHierarchy } from "@/hooks/useUserDepartmentRole";
import type { Department } from "@/hooks/useUserDepartmentRole";

/**
 * NexusDesk profile types — determines the entire UX.
 */
export type HWProfile = 'diretor' | 'chefe' | 'colaborador' | 'secretaria';

/**
 * Maps department_role → HW profile.
 */
export function resolveHWProfile(departmentRole: string | undefined | null, isDelegate?: boolean): HWProfile {
  if (isDelegate) return 'secretaria';
  
  if (departmentRole === 'diretor') return 'diretor';
  if (departmentRole === 'secretaria') return 'secretaria';
  
  const accessLevel = getAccessLevel(departmentRole);
  
  if (accessLevel === 'gestor') {
    if (departmentRole === 'gestor_marketing' || departmentRole === 'supervisor' || departmentRole === 'gestor') {
      return 'diretor';
    }
    return 'chefe';
  }
  
  if (departmentRole === 'gerente_loja') return 'chefe';
  
  return 'colaborador';
}

/**
 * Returns the PT-BR label for the HW profile.
 */
export function getHWProfileLabel(profile: HWProfile): string {
  switch (profile) {
    case 'diretor': return 'Diretor';
    case 'chefe': return 'Chefe de Departamento';
    case 'colaborador': return 'Colaborador';
    case 'secretaria': return 'Secretária';
  }
}

/**
 * Permission helpers — now department-aware.
 */
export function canCreatePosts(profile: HWProfile): boolean {
  return profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';
}

export function canBroadcast(profile: HWProfile): boolean {
  return profile === 'diretor' || profile === 'secretaria';
}

export function canManageTeam(profile: HWProfile): boolean {
  return profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';
}

export function canAccessRecruitment(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return false;
  // Only RH department + directors/secretaries in diretoria
  return department === 'rh' || department === 'diretoria' || profile === 'secretaria';
}

export function canMessageAnyone(profile: HWProfile): boolean {
  return profile !== 'colaborador';
}

export function canAccessFinancialKPIs(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return false;
  return department === 'financeiro' || department === 'diretoria' || profile === 'secretaria';
}

export function canAccessTradeOperations(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return false;
  return department === 'trade' || department === 'diretoria' || profile === 'secretaria';
}

export function canAccessMarketingDemands(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return false;
  return department === 'marketing' || department === 'diretoria' || profile === 'secretaria';
}

export function canAccessStoreOps(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return department === 'loja';
  return department === 'loja' || department === 'diretoria' || profile === 'secretaria';
}

export function canAccessTechGovernance(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return false;
  return department === 'tecnologia' || department === 'diretoria' || profile === 'secretaria';
}

export function canAccessITSupport(profile: HWProfile, department: string | null): boolean {
  if (profile === 'colaborador') return department === 'ti';
  return department === 'ti' || department === 'diretoria' || profile === 'secretaria';
}

export function canViewCrossDeptKPIs(profile: HWProfile): boolean {
  return profile === 'diretor' || profile === 'secretaria';
}

export function canAccessApprovals(profile: HWProfile): boolean {
  return profile !== 'colaborador';
}

/**
 * Main hook — resolves current user's HW profile with department context.
 */
export function useHWProfile() {
  const { data: departmentRole, isLoading: isLoadingRole } = useUserDepartmentRole();
  const { data: deptData, isLoading: isLoadingDept } = useUserDepartment();
  const { data: hierarchyLevel, isLoading: isLoadingHierarchy } = useUserHierarchy();
  
  // Use stored hierarchy_level if available, otherwise derive from department_role
  const profile: HWProfile = hierarchyLevel && hierarchyLevel !== 'colaborador'
    ? (hierarchyLevel as HWProfile)
    : resolveHWProfile(departmentRole);
  const department = (deptData?.department as Department | null) || null;
  const isLoading = isLoadingRole || isLoadingDept || isLoadingHierarchy;
  
  return {
    profile,
    profileLabel: getHWProfileLabel(profile),
    isLoading,
    departmentRole,
    department,
    permissions: {
      canCreatePosts: canCreatePosts(profile),
      canBroadcast: canBroadcast(profile),
      canManageTeam: canManageTeam(profile),
      canAccessRecruitment: canAccessRecruitment(profile, department),
      canMessageAnyone: canMessageAnyone(profile),
      canAccessFinancialKPIs: canAccessFinancialKPIs(profile, department),
      canAccessTradeOperations: canAccessTradeOperations(profile, department),
      canAccessMarketingDemands: canAccessMarketingDemands(profile, department),
      canAccessStoreOps: canAccessStoreOps(profile, department),
      canAccessTechGovernance: canAccessTechGovernance(profile, department),
      canAccessITSupport: canAccessITSupport(profile, department),
      canViewCrossDeptKPIs: canViewCrossDeptKPIs(profile),
      canAccessApprovals: canAccessApprovals(profile),
    },
  };
}
