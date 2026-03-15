/**
 * GOVERNANÇA V1 — TESTE RÁPIDO (5 MINUTOS)
 * 
 * PRÉ-REQUISITO: Desabilitar a flag DEMANDS_GOVERNANCE_V1 em src/config/features.ts
 * 
 * TESTE 1: Flag DESABILITADA (comportamento antigo)
 * ─────────────────────────────────────────────────
 * [ ] 1. Abrir /app/gestao/demandas
 * [ ] 2. No Kanban, arrastar uma demanda para outro status
 *     → Esperado: Status muda IMEDIATAMENTE sem diálogo
 * [ ] 3. No DetailSheet, clicar select de status
 *     → Esperado: Status muda direto, sem motivo
 * [ ] 4. Na Lista, clicar "Iniciar" ou "Marcar como concluído"
 *     → Esperado: Ação sucede sem validação
 * [ ] 5. Verificar console.log: NENHUM erro
 * 
 * TESTE 2: Flag HABILITADA (novo comportamento)
 * ──────────────────────────────────────────────
 * [ ] 1. Em src/config/features.ts, mudar DEMANDS_GOVERNANCE_V1: false → true
 * [ ] 2. Recarregar a página
 * [ ] 3. No Kanban, arrastar demanda de "open" para "completed"
 *     → Esperado: ABRE MODAL pedindo motivo (transição restrita)
 *     → Typing motivo e clicar "Confirmar"
 *     → Status deve mudar após confirmação
 * [ ] 4. Verificar que demand_status_history foi criado:
 *     - Backend > Demand > Verificar last_status_change_at atualizado
 * [ ] 5. Arrastar demanda de "open" para "in_progress"
 *     → Esperado: Muda SEM pedir motivo (transição simples)
 * [ ] 6. Na Lista, clicar "Iniciar" (open → in_progress)
 *     → Esperado: Muda sem diálogo
 * [ ] 7. Na Lista, clicar "Marcar como concluído" (qualquer → completed)
 *     → Esperado: ABRE MODAL
 * [ ] 8. No DetailSheet, selecionar status "review" (de in_progress)
 *     → Esperado: Muda sem diálogo (transição permitida)
 * [ ] 9. No DetailSheet, selecionar status "completed" (de review)
 *     → Esperado: ABRE MODAL
 * 
 * TESTE 3: Fallback (sem contexto)
 * ────────────────────────────────
 * [ ] 1. Inspecionar Network > ver requisição à transitionDemandStatus
 *     → Esperado: POST com { demandId, toStatus, source, reason }
 * [ ] 2. Cancelar o diálogo de motivo (X ou Cancelar)
 *     → Esperado: Nada acontece, status fica igual
 * [ ] 3. Digitar motivo com menos de 5 chars + clicar Confirmar
 *     → Esperado: Botão continua desabilitado
 * 
 * TESTE 4: Histórico & Timestamps
 * ────────────────────────────────
 * [ ] 1. Após transições bem-sucedidas com flag ON:
 *     - demand_status_history deve ter registros
 *     - last_status_change_at deve ser now()
 *     - started_at deve ser preenchido na primeira vez que entra em in_progress
 *     - completed_at deve ser preenchido quando fica completed
 * 
 * TESTE 5: Regressão Completa
 * ────────────────────────────
 * [ ] 1. Com flag OFF: testar os 3 pontos (Kanban, DetailSheet, List)
 * [ ] 2. Verificar que nenhum console.error aparece
 * [ ] 3. Verificar que rotas /demandas/nova e /demandas/editar/:id ainda funcionam
 * [ ] 4. Com flag ON: refazer o teste 2
 * 
 * SE ALGUM TESTE FALHAR:
 * ─────────────────────
 * 1. Verificar console.log por erros
 * 2. Verificar Network > XHR por status 400/500
 * 3. Verificar que AuthContext.user e AuthContext.tenant estão preenchidos
 * 4. Se o modal nunca abre, verificar requiresTransitionReason() na domain
 */