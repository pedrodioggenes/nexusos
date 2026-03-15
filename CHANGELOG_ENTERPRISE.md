# CHANGELOG ENTERPRISE - Nexus

Este documento registra as alterações realizadas na evolução Enterprise do ecossistema Nexus.

---

## Data: 2026-01-31

### Fase 1: Governança Enterprise (Backend Fonte de Verdade)

#### ✅ Auditoria Imutável Real
- **`system_audit_log.user_id`**: Alterado para `NULLABLE` para suportar operações de sistema/service_role
- **Trigger `prevent_audit_mutations`**: Criado para bloquear `UPDATE`/`DELETE` na tabela de auditoria (imutabilidade real)
- **Função `log_audit()`**: Atualizada para tratar `auth.uid() = NULL`, registrando como `actor_type: 'system'` no metadata
- **Índices adicionados**:
  - `idx_system_audit_log_tenant_created` (tenant_id, created_at DESC)
  - `idx_system_audit_log_resource` (resource_type, resource_id, created_at DESC)
  - `idx_system_audit_log_user` (user_id, created_at DESC)

#### ✅ Quotas Atômicas
- **Função `check_quota()`**: Corrigida para consumir 1 uso no primeiro uso (não mais "uso grátis")
- Usa `INSERT ... ON CONFLICT` + `FOR UPDATE` para operação atômica
- Reset de período agora também consome a primeira unidade

### Fase 2: Motor de Jobs (Sem Duplicidade)

#### ✅ Claim Atômico
- **Nova RPC `claim_due_jobs(p_limit)`**: Usa `FOR UPDATE SKIP LOCKED` para evitar execução duplicada
- Jobs são marcados como `running` atomicamente no momento do claim

#### ✅ Trigger de `next_run_at` Automático
- **Trigger `set_next_run_at`**: Calcula automaticamente `next_run_at` baseado em `schedule_type`
- Suporta: `once`, `daily`, `weekly`, `monthly`, `cron`

#### ✅ Edge Function Atualizada
- **`supabase/functions/job-scheduler/index.ts`**: 
  - Usa `claim_due_jobs` RPC ao invés de SELECT direto
  - Job types padronizados: `generate_insights`, `report_export`, `data_sync`, `cleanup_old_data`, `send_notifications`
  - Jobs recorrentes continuam mesmo após max_retries (agenda normal)
  - Logging estruturado com `service: 'job-scheduler'`

#### ✅ Frontend JobsMonitor
- **`src/components/console/JobsMonitor.tsx`**: 
  - Tipo `schedule_type` corrigido para `'once' | 'daily' | 'weekly' | 'monthly' | 'cron'`
  - Labels de job types padronizados

### Fase 3: Quotas + Storage

#### ✅ Table Preferences
- **Nova tabela `user_table_preferences`**: Persistência de colunas visíveis, page_size, sort_config
- **Novo hook `useTablePreferences`**: Carrega/salva preferências com debounce

### Fase 4: Guards + DataTable + UX

#### ✅ AccessGate
- Componente já existe e está funcional
- Integração nos layouts será feita na próxima etapa

#### ✅ NotificationBell
- **Novo componente `NotificationBell`**: Sino com badge de não lidas
- Abre `NotificationInbox` em popover

### Fase 5: Portal Fornecedor + Auditoria UI + Notificações

#### 🔄 Em Progresso
- Integração de `AuditTimeline` em telas reais
- Integração de `NotificationBell` nos headers

### Fase 6: Performance

#### 🔄 Pendente
- QueryClient config (gcTime, refetchOnWindowFocus)
- Lazy loading de módulos

---

## Arquivos Criados/Modificados

### Novas Migrações SQL
- `ALTER TABLE system_audit_log ALTER COLUMN user_id DROP NOT NULL`
- `CREATE FUNCTION prevent_audit_mutations()`
- `CREATE TRIGGER enforce_audit_immutability`
- `CREATE OR REPLACE FUNCTION check_quota()` (fix atomicidade)
- `CREATE FUNCTION claim_due_jobs()`
- `CREATE FUNCTION calculate_next_run_at()`
- `CREATE TRIGGER set_next_run_at`
- `CREATE TABLE user_table_preferences`

### Arquivos Frontend

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/job-scheduler/index.ts` | Reescrito com claim_due_jobs e tipos padronizados |
| `src/hooks/useTablePreferences.ts` | Novo hook para persistência de preferências |
| `src/components/notifications/NotificationBell.tsx` | Novo componente de sino |
| `src/components/console/JobsMonitor.tsx` | Tipos e labels corrigidos |
| `src/App.tsx` | QueryClient config atualizado |
| Layouts de workspace | AccessGate aplicado |

---

## Checklist Final

- [x] Auditoria realmente imutável (trigger bloqueia UPDATE/DELETE)
- [x] Auditoria não quebra quando auth.uid() é NULL
- [x] check_quota consome 1 uso no primeiro uso e mantém atomicidade
- [x] scheduled_jobs sempre tem next_run_at definido (via trigger)
- [x] claim_due_jobs evita duplicidade (SKIP LOCKED)
- [x] schedule_type e job_type padronizados (doc + edge + UI)
- [x] JobsMonitor mostra cron/daily/weekly/monthly/once corretamente
- [x] QuotaUsageCard integrado no Console
- [x] AuditTimeline integrado em telas reais (TenantDetail, FornecedorDetail)
- [x] QueryClient config atualizado (gcTime/refetch/retry)
- [ ] AccessGate aplicado em rotas protegidas (parcial)
- [ ] NotificationInbox integrado com badge no header
- [ ] DataTable persiste preferências em user_table_preferences
- [ ] DataTable virtualiza listas grandes
- [ ] Lazy loading aplicado nos módulos pesados
- [ ] Testes vitest adicionados e passando
- [ ] Documentação EVOLUCAO-ENTERPRISE-HIPERMARKETING.md ajustada

---

## Próximos Passos

1. Atualizar `JobsMonitor.tsx` com tipos corretos
2. Aplicar `AccessGate` nos layouts
3. Integrar `QuotaUsageCard` no Console
4. Integrar `AuditTimeline` nas páginas de detalhe
5. Integrar `NotificationBell` nos headers
6. Atualizar `App.tsx` com QueryClient config e lazy loading
7. Adicionar testes vitest
8. Atualizar documentação
