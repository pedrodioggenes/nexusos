## [HIPERGESTÃO] DEMANDAS — GOVERNANÇA V1 IMPLEMENTADA

### ✅ IMPLEMENTAÇÃO CONCLUÍDA

**Objetivo**: Centralizar validações de transição de status com histórico, motivos obrigatórios e timestamps consistentes.

---

### 📦 ARQUIVOS CRIADOS / MODIFICADOS

#### **1. Serviço de Transição** (`src/services/demands/transitionDemandStatus.ts`)
- Função `transitionDemandStatus()`: valida, registra história e atualiza timestamps
  - ✅ Busca status atual
  - ✅ Valida com `canTransition()` do domain
  - ✅ Pede motivo se necessário
  - ✅ Atualiza `started_at` (primeira vez em in_progress)
  - ✅ Atualiza `completed_at` (quando completa)
  - ✅ Atualiza `last_status_change_at`
  - ✅ Insere em `demand_status_history` com auditoria completa

#### **2. Modal de Motivo** (`src/components/hipergestao/demands/TransitionReasonDialog.tsx`)
- Dialog AlertDialog reutilizável
- Captura motivo com validação mínima (5 chars)
- Exibe prompt contextual baseado em `getTransitionReasonPrompt()`
- Estados: open, loading, cancel

#### **3. Integração no Kanban** (`src/components/hipergestao/demands/DemandaKanban.tsx`)
- `onDrop` agora chama `transitionDemandStatus()` com `source='kanban'`
- Se `requiresReason`, abre modal e repete com motivo
- Fallback: sem flag, comportamento antigo (direto)
- Toast: sucesso/erro com feedback claro

#### **4. Integração no DetailSheet** (`src/components/hipergestao/demands/DemandaDetailSheet.tsx`)
- Select de status chama serviço com `source='detailsheet'`
- Modal aparece se necessário
- Mantém UI consistente com o DetailSheet

#### **5. Integração na Lista** (`src/components/hipergestao/demands/DemandaList.tsx`)
- Ações rápidas (Iniciar, Marcar como concluído) passam pelo serviço
- `source='quickaction'` para auditoria
- Modal de motivo funciona igual aos outros

#### **6. Documento de Teste** (`docs/testing/DEMANDS_GOVERNANCE_V1_TEST.md`)
- Teste completo em 5 minutos
- Validações: flag OFF (antigo), flag ON (novo), histórico, regressão

---

### 🎛️ FEATURE FLAG

**Localização**: `src/config/features.ts`

```typescript
DEMANDS_GOVERNANCE_V1: false  // ← Mudar para true para ativar
```

**Comportamento**:
- `false` (padrão): transições diretas, sem validação, sem histórico
- `true`: validação completa, modal de motivo, registro em `demand_status_history`

---

### 🔐 REGRAS DE NEGÓCIO APLICADAS

| Transição | Requer Motivo? | Hard Block? | Modal? |
|-----------|----------------|------------|--------|
| open → in_progress | Não | Não | ❌ |
| in_progress → review | Não | Não | ❌ |
| review → approved | Não | Não | ❌ |
| approved → completed | Não | Não | ❌ |
| open → completed | Sim | Sim | ✅ |
| in_progress → cancelled | Sim | Sim | ✅ |
| completed → \* | Sim | Sim | ✅ |

*(Regras baseadas em `src/domain/demands/validator.ts`)*

---

### 📊 HISTÓRICO & TIMESTAMPS

**Tabela**: `demand_status_history` (criada em migração anterior)

```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "demand_id": "uuid",
  "from_status": "open",
  "to_status": "in_progress",
  "changed_by": "user-id",
  "change_reason": "Motivo da transição",
  "source": "kanban|detailsheet|quickaction",
  "created_at": "2026-02-14T..."
}
```

**Campos de Demanda Atualizados**:
- `status`: novo status
- `started_at`: preenchido primeira vez em "in_progress"
- `completed_at`: preenchido primeira vez em "completed"
- `last_status_change_at`: agora() a cada transição

---

### ⚠️ PONTOS CRÍTICOS PARA FALLBACK

1. **Sem flag**: comportamento antigo permanece 100% intacto
2. **Sem user/tenant**: toast "Sessão inválida"
3. **Erro no serviço**: toast com mensagem clara
4. **Modal cancelado**: nada muda, status permanece igual

---

### 🧪 CHECKLIST DE VALIDAÇÃO

Antes de ativar a flag em produção:

- [ ] Todos os 3 pontos (Kanban, DetailSheet, List) testados com flag OFF
- [ ] Todos os 3 pontos testados com flag ON
- [ ] Modal abre para transições restrita
- [ ] Modal não abre para transições simples
- [ ] Motivo é obrigatório quando modal abre
- [ ] `demand_status_history` tem registros
- [ ] `last_status_change_at` é atualizado
- [ ] `started_at` / `completed_at` preenchidos corretamente
- [ ] Nenhum console.error
- [ ] Rotas /demandas/nova e /demandas/editar/:id intactas

---

### 🚀 PRÓXIMOS PASSOS

1. **Executar teste** (`docs/testing/DEMANDS_GOVERNANCE_V1_TEST.md`)
2. **Ativar flag**: `DEMANDS_GOVERNANCE_V1: true` em `src/config/features.ts`
3. **Recarregar app** e validar comportamento
4. **Hard-block**: Se tudo OK, esta versão está pronta para produção

---

**Status**: ✅ Pronto para testes | Sem breaking changes | Fallback seguro
