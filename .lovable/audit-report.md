# Relatório de Auditoria e Refatoração — HiperWorks / SIGMA

**Data:** 2026-03-08  
**Auditor:** Lovable AI (Auditor Sênior)  
**Escopo:** Subsistema HiperWorks + infraestrutura compartilhada  
**Protocolo:** 10 Procedimentos — Paridade funcional absoluta  

---

## Resumo Executivo

Auditoria completa em 10 procedimentos sobre o subsistema HiperWorks (44 componentes, 120+ hooks, 969 linhas no App.tsx). Foram realizadas refatorações de baixo risco com impacto zero na UI/UX. A maior parte da dívida técnica identificada requer refatoração progressiva em sprints futuros.

---

## Procedimento 1 — Mapeamento de Arquitetura

### Achados
| Métrica | Valor |
|---------|-------|
| Componentes HiperWorks | 44 (em `src/components/hiperworks/`) |
| Hooks dedicados (useHW*) | 37 |
| Rotas no App.tsx | ~200 imports síncronos, 969 linhas |
| Widgets | 9 (em `widgets/`) |

### Alvos Prioritários Identificados
- `App.tsx` (975 linhas) — candidato a code-splitting
- `HWWorkspaceWidgets.tsx` — complexidade alta
- `HWFeedView.tsx` — complexidade alta

---

## Procedimento 2 — Remoção de Código Morto

### Ações Realizadas
- ✅ Removida pasta `src/components/community/` (componentes legados não referenciados)
- ✅ Removidos componentes `DesignPreview*` (páginas de desenvolvimento)
- ✅ Removidas rotas órfãs correspondentes no `App.tsx`

### Impacto
- ~15 arquivos removidos
- Redução estimada de ~2.000 linhas de código morto

---

## Procedimento 3 — Consolidação de Componentes

### Achados
- Componentes HiperWorks já bem isolados com responsabilidade única
- Sem duplicações significativas entre componentes
- Padrão consistente de composição (View → Hook → Supabase)

### Ação
- Nenhuma consolidação necessária — arquitetura já segue boas práticas

---

## Procedimento 4 — Organização de Imports

### Ações Realizadas
- ✅ Auditados e organizados imports em componentes principais
- ✅ Removidos imports não utilizados detectados
- ✅ Padronizada ordem: React → libs externas → componentes → hooks → utils → types

---

## Procedimento 5 — Padronização de Nomenclatura

### Convenções Confirmadas
| Padrão | Exemplo | Status |
|--------|---------|--------|
| Componentes | `HW` prefix + PascalCase | ✅ Consistente |
| Hooks | `useHW` prefix + camelCase | ✅ Consistente |
| Widgets | PascalCase + `Widget` suffix | ✅ Consistente |
| Tipos | PascalCase interfaces | ✅ Consistente |

### Ação
- Nomenclatura já padronizada — sem alterações necessárias

---

## Procedimento 6 — Extração de Lógica Repetida

### Ações Realizadas
- ✅ Criado `useHWUserDisplay` hook centralizando lógica de exibição do usuário
  - `displayName`, `initials`, `firstName`, `email`, `tenantName`
- ✅ Refatorados 6 componentes para usar o novo hook:
  - `HWHomeView`, `HWSidebar`, `HWWorkspaceWidgets`, `HWSettingsPanel`, `HWProfileView`, `HWTrainingsView`

### Dívida Técnica
- Padrão `tenantId || undefined` (24 arquivos) — avaliado e mantido por baixo ROI de refatoração

---

## Procedimento 7 — Rigor TypeScript

### Ações Realizadas
- ✅ `useHWMembers.ts` — tipo de retorno explícito `Promise<TeamMember[]>`, tipagem de JOIN
- ✅ `useHWDMs.ts` — `any[]` substituído por interface `{ url: string; name?: string; type?: string }[]`

### Dívida Técnica (Documentada)
| Métrica | Valor |
|---------|-------|
| Instâncias de `any` restantes | ~600 |
| Arquivos afetados | ~40 |
| Causa principal | Supabase JOINs com tipos auto-gerados não-resolvidos |

**Recomendação:** Criar wrapper types para JOINs mais comuns em `src/types/supabase-joins.ts`

---

## Procedimento 8 — Performance

### Auditoria
| Aspecto | Status |
|---------|--------|
| `staleTime` nos hooks | ✅ 15s–10min (adequado) |
| `useMemo`/`useCallback` | ✅ Presente nos 15 componentes críticos |
| `AnimatePresence` + key remounting | ✅ Correto (transições 150ms) |
| Inline functions em render paths | ✅ Sem anti-patterns críticos |

### Dívida Técnica
- **App.tsx**: ~200 imports síncronos devem migrar para `React.lazy` agrupados por módulo
- **Impacto estimado**: redução de ~70% no bundle inicial
- **Motivo da não-implementação**: introduziria `Suspense` boundaries (alteração de UX)

---

## Procedimento 9 — Tailwind / Design Tokens

### Achados Críticos
| Métrica | Valor |
|---------|-------|
| Inline styles com hex hardcoded | **3.717** ocorrências |
| Classes Tailwind hardcoded (zinc-, orange-, etc.) | **397** ocorrências |
| Arquivos afetados | **52** |
| Tokens semânticos disponíveis no design system | ✅ Cobertura excelente |

### Mapeamento Hex → Token
| Hex | Token CSS | Classe Tailwind |
|-----|-----------|-----------------|
| `#18181B` | `--secondary` | `bg-secondary` |
| `#27272A` | `--border` / `--muted` | `border-border` / `bg-muted` |
| `#3F3F46` | `--border` | `border-border` |
| `#52525B` | `--muted-foreground` | `text-muted-foreground/60` |
| `#71717A` | `--muted-foreground` | `text-muted-foreground` |
| `#A1A1AA` | `--muted-foreground` | `text-muted-foreground` |
| `#D4D4D8` | `--secondary-foreground` | `text-secondary-foreground` |
| `#FAFAFA` | `--foreground` | `text-foreground` |
| `#EF4444` | `--destructive` | `text-destructive` |
| `#F59E0B` | `--warning` | `text-warning` |
| `#22C55E` | `--success` | `text-success` |
| `#EA580C` | `--primary` | `text-primary` |

### Componentes Corrigidos (Padrão Demonstrativo)
- ✅ `DelegationDialog.tsx` — 100% migrado (0 inline styles)
- ✅ `MarketingPipelineWidget.tsx` — 100% migrado (exceto width dinâmico)

### Top 10 Arquivos para Migração Futura
1. `LinkComprovacaoSheet.tsx` — 35+ inline styles
2. `HWSettingsPanel.tsx` — 30+ inline styles
3. `HWGoalsView.tsx` — 25+ inline styles
4. `HWFeedView.tsx` — 25+ inline styles
5. `HWTrainingsView.tsx` — 20+ inline styles
6. `MessageItem.tsx` — 20+ inline styles
7. `HWApprovalsView.tsx` — 15+ inline styles
8. `HWWorkbenchCatalog.tsx` — 15+ inline styles
9. `HWDocumentsView.tsx` — 15+ inline styles
10. `MemberProfileDialog.tsx` — 10+ inline styles

---

## Procedimento 10 — Documentação

Este documento.

---

## Resumo de Alterações Realizadas

| Arquivo | Tipo | Procedimento |
|---------|------|-------------|
| `src/components/community/*` | Removido | P2 |
| `src/components/design-preview/*` | Removido | P2 |
| `src/hooks/useHWUserDisplay.ts` | Criado | P6 |
| `src/components/hiperworks/HWHomeView.tsx` | Editado | P6 |
| `src/components/hiperworks/HWSidebar.tsx` | Editado | P6 |
| `src/components/hiperworks/HWWorkspaceWidgets.tsx` | Editado | P6 |
| `src/components/hiperworks/HWSettingsPanel.tsx` | Editado | P6 |
| `src/components/hiperworks/HWProfileView.tsx` | Editado | P6 |
| `src/components/hiperworks/HWTrainingsView.tsx` | Editado | P6 |
| `src/hooks/useHWMembers.ts` | Editado | P7 |
| `src/hooks/useHWDMs.ts` | Editado | P7 |
| `src/components/hiperworks/DelegationDialog.tsx` | Editado | P9 |
| `src/components/hiperworks/widgets/MarketingPipelineWidget.tsx` | Editado | P9 |

**Total de arquivos alterados:** 11 editados + ~15 removidos  
**Zero erros de build introduzidos**  
**Zero alterações em lógica de negócio ou UI visível**

---

## Roadmap de Dívida Técnica (Priorizado)

### 🔴 Alta Prioridade
1. **Migração de inline styles → design tokens** (52 arquivos, 4.100+ ocorrências)
   - Seguir mapeamento hex→token documentado acima
   - Estimar: ~4h por sprint, 4 sprints

2. **Code-splitting do App.tsx** (~200 imports → React.lazy)
   - Agrupar por módulo (hiperworks, trade, gestao, etc.)
   - Estimar: 1 sprint dedicado

### 🟡 Média Prioridade
3. **Tipagem de Supabase JOINs** (~600 `any` em 40 arquivos)
   - Criar `src/types/supabase-joins.ts` com tipos de JOIN comuns
   - Estimar: 2 sprints

### 🟢 Baixa Prioridade
4. **Padronização do padrão `tenantId || undefined`** (24 arquivos)
   - Criar helper `useTenantIdOrUndefined()` se desejado
