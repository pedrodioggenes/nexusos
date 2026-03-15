# Evolução Enterprise do Ecossistema HiperMarketing
## Relatório Técnico das 6 Fases de Implementação

---

## Sumário Executivo

Este documento detalha a evolução do sistema HiperMarketing de uma aplicação funcional para uma plataforma enterprise-grade com governança corporativa, auditoria imutável, controle de acesso granular e experiência de usuário premium. As melhorias foram implementadas em 6 fases sequenciais, preservando toda a funcionalidade existente enquanto adicionavam camadas de segurança, confiabilidade e qualidade.

---

## Fase 1: Fundação de Governança Enterprise

### Objetivo
Estabelecer a infraestrutura base para RBAC (Role-Based Access Control), auditoria e gestão de quotas no backend, garantindo que o servidor seja a fonte de verdade para todas as verificações de permissão.

### Implementações

#### 1.1 Sistema de Auditoria Imutável (`system_audit_log`)

Foi criada uma tabela de auditoria append-only que registra todas as ações críticas do sistema:

```sql
CREATE TABLE public.system_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  user_type TEXT,
  tenant_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

A tabela possui políticas RLS que permitem apenas inserção (nunca update ou delete), garantindo imutabilidade dos registros. Triggers automáticos foram configurados nas tabelas críticas (`marketing_campaigns`, `suppliers`, `trade_packages`, `trade_proofs`) para registrar automaticamente todas as operações.

#### 1.2 Gestão de Quotas por Tenant (`tenant_quotas`)

Implementado sistema de quotas que controla:
- **Consultas de IA**: Limite mensal com reset automático
- **Campanhas**: Limite mensal de criação
- **Storage**: Limite em bytes para armazenamento
- **Feature Flags**: Controle granular de funcionalidades habilitadas

A função `check_quota()` verifica e incrementa atomicamente o uso, retornando `false` quando o limite é atingido:

```sql
CREATE FUNCTION check_quota(p_tenant_id UUID, p_quota_type TEXT)
RETURNS BOOLEAN AS $$
  -- Verifica limite, reseta se período expirou, incrementa uso
  -- Retorna TRUE se pode usar, FALSE se limite atingido
$$;
```

#### 1.3 Funções de Verificação Server-Side

Três funções críticas com `SECURITY DEFINER` para verificações seguras:

- `is_module_enabled(user_id, module)`: Verifica se módulo está habilitado para o tenant do usuário
- `is_feature_enabled(user_id, feature)`: Verifica feature flags específicas
- `log_audit(...)`: Função padronizada para registro de auditoria

#### 1.4 Infraestrutura para Integrações Futuras

Criada tabela `integration_configs` e providers stub para:
- **WhatsApp Provider** (`src/providers/whatsappProvider.ts`): Interface completa para futura integração com API do WhatsApp Business
- **ERP Provider** (`src/providers/erpProvider.ts`): Contratos para integração com Winthor/Protheus (TOTVS)

---

## Fase 2: Motor de Jobs e Agendamentos

### Objetivo
Implementar sistema confiável de execução de tarefas agendadas com suporte a retries, logs e proteção contra duplicidade.

### Implementações

#### 2.1 Tabela de Jobs (`scheduled_jobs`)

```sql
CREATE TABLE public.scheduled_jobs (
  id UUID PRIMARY KEY,
  job_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  job_config JSONB DEFAULT '{}',
  schedule_type TEXT NOT NULL, -- 'once', 'daily', 'weekly', 'monthly', 'cron'
  cron_expression TEXT,
  scheduled_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  last_result JSONB,
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES tenants(id)
);
```

#### 2.2 Edge Function `job-scheduler`

Função serverless que:
1. Busca jobs pendentes (`next_run_at <= now()`)
2. Executa cada job conforme seu `job_type`
3. Implementa retry com backoff exponencial
4. Registra resultado e calcula próxima execução
5. Trata erros graciosamente

Tipos de jobs suportados:
- `generate_insights`: Geração periódica de insights de IA
- `sync_erp`: Sincronização com ERP (stub)
- `cleanup_old_data`: Limpeza de dados antigos
- `send_notifications`: Envio de notificações em lote

#### 2.3 Componente de Monitoramento (`JobsMonitor`)

Interface administrativa para visualizar:
- Jobs ativos e seus próximos agendamentos
- Histórico de execuções
- Status de erros e retries
- Ações de pause/resume/cancel

---

## Fase 3: Quotas, Limites e Pipeline de Storage

### Objetivo
Implementar enforcement real de limites de uso e padronizar todo o pipeline de upload de arquivos.

### Implementações

#### 3.1 Hook `useQuotaCheck`

```typescript
export function useQuotaCheck() {
  return useMutation({
    mutationFn: async (quotaType: QuotaType) => {
      const { data } = await supabase.rpc('check_quota', {
        p_tenant_id: tenant.id,
        p_quota_type: quotaType,
      });
      if (!data) throw new Error('Quota limit reached');
      return true;
    },
    onError: () => {
      toast.error('Limite de uso atingido');
    },
  });
}
```

#### 3.2 Componente `QuotaUsageCard`

Visualização em tempo real do consumo de quotas com:
- Barras de progresso por tipo de recurso
- Indicadores de warning (75%) e critical (90%)
- Data de reset do período
- Feature flags habilitadas

#### 3.3 Pipeline de Storage Aprimorado (`useEnhancedStorageUpload`)

Hook unificado que oferece:
- **Validação**: Tipo de arquivo, tamanho máximo, dimensões de imagem
- **Isolamento por Tenant**: Paths estruturados como `{tenant_id}/{category}/{filename}`
- **Progress Tracking**: Callback de progresso para UI
- **URLs Assinadas**: Geração de URLs temporárias para arquivos privados
- **Metadados**: Armazenamento de informações adicionais no upload

```typescript
const { upload, getSignedUrl, isUploading, progress } = useEnhancedStorageUpload({
  bucket: 'trade-proofs',
  maxSizeMB: 10,
  allowedTypes: ['image/*', 'application/pdf'],
  onProgress: (p) => setProgress(p),
});
```

---

## Fase 4: Guards de Rota, DataTable Padrão e UX Premium

### Objetivo
Unificar a experiência do usuário com componentes padronizados, proteção consistente de rotas e estados de UI premium.

### Implementações

#### 4.1 Componente `AccessGate`

Componente declarativo para proteção de rotas e ações:

```tsx
<AccessGate
  requireAuth
  allowedUserTypes={['internal']}
  allowedRoles={['admin', 'operador']}
  requireModule="hipergestao"
  requireFeature="advanced_analytics"
  fallback={<AccessDenied />}
>
  <ProtectedContent />
</AccessGate>
```

Também disponível como:
- HOC: `withAccessGate(Component, options)`
- Hook: `useAccessCheck(options)` para verificações programáticas

#### 4.2 DataTable Enterprise

Componente padronizado com funcionalidades completas:

| Funcionalidade | Descrição |
|----------------|-----------|
| Busca | Filtro global em tempo real |
| Ordenação | Clique no header, suporte multi-coluna |
| Paginação | Navegação com controle de itens por página |
| Colunas | Visibilidade configurável, persistência por usuário |
| Export | CSV com encoding UTF-8-BOM para Excel |
| Empty State | CTA contextual quando sem dados |
| Loading | Skeletons consistentes |

```typescript
<DataTable
  data={campaigns}
  columns={[
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'status', header: 'Status', render: StatusBadge },
    { key: 'created_at', header: 'Criado em', format: 'date' },
  ]}
  searchable
  exportable
  pageSize={20}
/>
```

#### 4.3 Estados de UX Padronizados

**EmptyState**: Ilustração, título, descrição e CTA opcional
```tsx
<EmptyState
  icon={FileText}
  title="Nenhuma campanha encontrada"
  description="Crie sua primeira campanha para começar"
  action={{ label: "Nova Campanha", onClick: openWizard }}
/>
```

**ErrorState**: Mensagem de erro com ações de recuperação
```tsx
<ErrorState
  title="Erro ao carregar dados"
  description={error.message}
  onRetry={() => refetch()}
  onSupport={() => openSupport()}
/>
```

**LoadingState**: Skeletons contextuais ou spinner centralizado
```tsx
<LoadingState variant="skeleton" rows={5} />
<LoadingState variant="spinner" text="Processando..." />
```

---

## Fase 5: Portal do Fornecedor e Auditoria no UI

### Objetivo
Completar o fluxo de comprovação do fornecedor e tornar a auditoria visível para gestores.

### Implementações

#### 5.1 Fluxo de Upload de Comprovações (`ProofUploadFlow`)

Componente completo que guia o fornecedor:

1. **Seleção**: Drag & drop ou clique para selecionar arquivos
2. **Validação**: Verificação de tipo, tamanho e quantidade
3. **Preview**: Visualização de imagens/PDFs antes do envio
4. **Fila**: Lista de arquivos pendentes com status individual
5. **Upload**: Progresso em tempo real por arquivo
6. **Retry**: Opção de reenviar arquivos com falha
7. **Confirmação**: Feedback de sucesso com próximos passos

```tsx
<ProofUploadFlow
  packageId={selectedPackage.id}
  onComplete={(proofs) => {
    toast.success('Comprovações enviadas!');
    refetchProofs();
  }}
  maxFiles={10}
  maxSizeMB={10}
/>
```

#### 5.2 Tracker de Status (`ProofStatusTracker`)

Visualização do pipeline de aprovação:

```
Enviado → Em Análise → [Aprovado | Rejeitado → Correção → Em Análise]
```

Cada etapa mostra:
- Data e hora da transição
- Responsável pela ação
- Observações/motivo (em caso de rejeição)

#### 5.3 Timeline de Auditoria (`AuditTimeline`)

Componente reutilizável para exibir histórico de alterações:

```tsx
<AuditTimeline
  resourceType="marketing_campaigns"
  resourceId={campaign.id}
/>
```

Exibe cronologicamente:
- **Ação**: Criação, atualização, exclusão
- **Autor**: Nome e email do usuário
- **Quando**: Data relativa (há 2 horas) e absoluta
- **Detalhes**: Campos alterados com valores antigo/novo
- **Severidade**: Indicador visual (info, warning, error, critical)

#### 5.4 Central de Notificações (`NotificationInbox`)

Inbox completo com:
- Filtros por tipo (info, warning, success, error)
- Marcação individual e em lote como lida
- Deep links para entidades relacionadas
- Agrupamento por data
- Ações contextuais por notificação

---

## Fase 6: Performance e Otimização

### Objetivo
Otimizar performance de queries, renderização e caching para garantir fluidez mesmo com grandes volumes de dados.

### Implementações

#### 6.1 Estratégia de Cache com TanStack Query

Configuração global otimizada:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutos
      gcTime: 1000 * 60 * 30,        // 30 minutos
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

Queries específicas com cache mais longo para dados estáticos:
- Módulos e features: 10 minutos
- Configurações de tenant: 15 minutos
- Usuários e perfis: 5 minutos

#### 6.2 Memoização de Componentes

Uso estratégico de `React.memo`, `useMemo` e `useCallback`:

```typescript
const MemoizedCampaignCard = React.memo(CampaignCard, (prev, next) => {
  return prev.campaign.id === next.campaign.id 
      && prev.campaign.updated_at === next.campaign.updated_at;
});
```

#### 6.3 Virtualização de Listas

Para tabelas com muitos registros, implementação de virtualização:

```typescript
<VirtualizedList
  items={allItems}
  rowHeight={64}
  overscan={5}
  renderItem={(item) => <ItemRow item={item} />}
/>
```

#### 6.4 Lazy Loading de Módulos

Carregamento sob demanda de módulos pesados:

```typescript
const HiperGestao = lazy(() => import('./pages/hipergestao/Index'));
const HiperTrade = lazy(() => import('./pages/hipertrade/Index'));

<Suspense fallback={<LoadingState />}>
  <Route path="/hipergestao/*" element={<HiperGestao />} />
</Suspense>
```

---

## Arquitetura Final

### Estrutura de Diretórios Criados/Modificados

```
src/
├── components/
│   ├── audit/
│   │   └── AuditTimeline.tsx
│   ├── console/
│   │   ├── JobsMonitor.tsx
│   │   └── QuotaUsageCard.tsx
│   ├── guards/
│   │   ├── AccessGate.tsx
│   │   └── index.ts
│   ├── notifications/
│   │   └── NotificationInbox.tsx
│   ├── supplier/
│   │   ├── ProofUploadFlow.tsx
│   │   └── ProofStatusTracker.tsx
│   └── ui/
│       ├── data-table.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       └── LoadingState.tsx
├── hooks/
│   ├── useAuditTimeline.ts
│   ├── useEnhancedStorageUpload.ts
│   └── useGovernance.ts
├── lib/
│   ├── csv-export.ts
│   └── governance.ts
└── providers/
    ├── erpProvider.ts
    └── whatsappProvider.ts

supabase/
└── functions/
    └── job-scheduler/
        └── index.ts
```

### Tabelas de Banco Criadas

| Tabela | Propósito |
|--------|-----------|
| `system_audit_log` | Auditoria imutável de todas as ações |
| `tenant_quotas` | Quotas e feature flags por tenant |
| `scheduled_jobs` | Agendamento e execução de tarefas |
| `integration_configs` | Configurações de integrações externas |
| `user_table_preferences` | Preferências de UI por usuário |

### Funções RPC Criadas

| Função | Propósito |
|--------|-----------|
| `check_quota` | Verifica e consome quota atomicamente |
| `log_audit` | Registra entrada de auditoria |
| `is_module_enabled` | Verifica acesso a módulo |
| `is_feature_enabled` | Verifica feature flag |
| `get_usage_metrics` | Retorna métricas de uso formatadas |

---

## Checklist de Validação

### Backend
- [x] RLS em todas as tabelas sensíveis
- [x] Funções com SECURITY DEFINER para verificações
- [x] Auditoria automática via triggers
- [x] Quotas com enforcement no servidor
- [x] Jobs com retry e logging
- [x] Storage isolado por tenant

### Frontend
- [x] Guards em todas as rotas protegidas
- [x] DataTable padronizado com export
- [x] Estados de loading/empty/error consistentes
- [x] Central de notificações funcional
- [x] Portal fornecedor com fluxo completo
- [x] Timeline de auditoria visível

### Performance
- [x] Cache configurado globalmente
- [x] Componentes memoizados
- [x] Lazy loading de módulos
- [x] Queries otimizadas

---

## Próximos Passos Recomendados

1. **Integrações**: Ativar providers de WhatsApp e ERP quando contratos estiverem prontos
2. **Monitoramento**: Configurar alertas para jobs falhando ou quotas atingindo limite
3. **Analytics**: Implementar dashboard de uso para administradores da plataforma
4. **Backup**: Configurar backup automático da tabela de auditoria
5. **Testes**: Adicionar testes E2E para fluxos críticos do portal fornecedor

---

*Documento gerado em 31 de Janeiro de 2026*
*Versão do Sistema: 2.0 Enterprise*
