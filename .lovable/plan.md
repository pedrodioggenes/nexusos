
## Implemented: Enforce NOS Console User Configuration in Nexus

### Changes Applied

#### 1. AuthContext — `is_active`, `hierarchyLevel`, `department` hydrated
- Query now fetches `is_active`, `hierarchy_level`, `department` from `user_roles`
- If `is_active === false`, user is signed out with toast "Sua conta foi desativada"
- `hierarchyLevel` (HierarchyLevel type) and `department` exposed in context
- All `signOutUnauthorized` calls pass `deactivated` flag for correct messaging

#### 2. WorkspaceAuth — Smart single-module redirect
- If `userModulesAllowed` has exactly 1 entry → redirect to `APP_PATHS[module]`
- If null (inherit all) or 2+ entries → redirect to `/app/desk`
- Agency/supplier/admin special cases preserved

#### 3. Portal.tsx — Smart single-module redirect
- Same logic: single module → direct redirect, skipping portal hub
- Multiple modules → stay on portal for module selection
- Removed old hardcoded `/app/desk` redirect for all internal users

#### 4. No changes needed
- AccessGate: already enforces `modules_allowed` + `pages_allowed`
- Sidebars: already filter by `pages_allowed`
- Database: all fields already exist in `user_roles`

### Hierarchy Level Usage
`hierarchyLevel` is now available via `useAuth()` for data-scoping in queries:
- `diretor` → cross-department visibility
- `chefe` → department-scoped
- `colaborador` → own data only
- `secretaria` → inherits director-level view
