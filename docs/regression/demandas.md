# Checklist de Regressão — Demandas (HiperGestão)

> Tempo estimado: **10 minutos**
> Execute após qualquer alteração na página de Demandas ou componentes relacionados.

---

## Pré-requisitos

- [ ] Ter dois usuários de teste: um **Gestor** e um **Colaborador** (configurados em Console > Funções Departamentais)
- [ ] Ao menos 3 demandas existentes com status variados (open, in_progress, review)
- [ ] DevTools aberto na aba Console (para verificar erros)

---

## 1. Gestor — Visão Principal (`/app/gestao/demandas`)

### 1.1 Carregamento Inicial
- [ ] Página carrega sem console errors
- [ ] Cards de estatísticas (Total, Abertos, Em Progresso, Revisão, Atrasadas, Urgentes, Concluídas) exibem valores numéricos
- [ ] Scroll horizontal dos cards funciona em mobile

### 1.2 Filtros
- [ ] Busca por texto filtra demandas pelo título
- [ ] Filtro de Prioridade (Todas / Urgente / Alta / Média / Baixa) funciona
- [ ] Filtro de Tipo (Todos / Social Media / Design / Copywriting / Vídeo / Geral) funciona
- [ ] Filtro de Status (Todos Status / Em Aprovação / Em Progresso / Atrasadas) funciona
- [ ] Combinação de filtros funciona corretamente
- [ ] Limpar filtros restaura a lista completa

### 1.3 Views — Kanban
- [ ] Tab "Kanban" está selecionado por padrão
- [ ] Colunas visíveis: Aberto, Em Progresso, Revisão, Aprovado, Concluído
- [ ] Cards mostram: título, prioridade, tipo, prazo, assignee
- [ ] Drag-and-drop entre colunas atualiza o status
- [ ] Botão "+" na coluna "Aberto" navega para `/demandas/nova`

### 1.4 Views — Lista
- [ ] Tab "Lista" renderiza tabela com colunas corretas
- [ ] Clicar em uma demanda abre o DetailSheet

### 1.5 Views — Timeline
- [ ] Tab "Timeline" agrupa demandas por data
- [ ] Clicar em uma demanda abre o DetailSheet

### 1.6 DetailSheet (Lateral)
- [ ] Abre ao clicar em qualquer demanda (Kanban/Lista/Timeline)
- [ ] Exibe: título, descrição (rich text), status, prioridade, tipo, prazo, responsável
- [ ] Botão de editar navega para `/demandas/editar/:id`
- [ ] Botão de excluir pede confirmação e remove a demanda
- [ ] Botão de concluir muda status para `completed`
- [ ] Sheet fecha corretamente pelo X ou clicando fora

### 1.7 Quadros Especiais & Calendário
- [ ] Seção "Quadros Especiais" aparece abaixo do conteúdo principal
- [ ] Atalhos de tipo (Social Media, Design, etc.) filtram corretamente e scrollam ao topo
- [ ] Botão de Calendário de Postagens abre/fecha o calendário
- [ ] Calendário exibe demandas do tipo `social_media` nos dias corretos
- [ ] Clicar em "+" no calendário navega para `/demandas/nova?type=social_media&due_date=YYYY-MM-DD`

### 1.8 Criação (`/app/gestao/demandas/nova`)
- [ ] Formulário carrega sem erros
- [ ] Campos obrigatórios: título, tipo, prioridade
- [ ] Editor rich text (BlockNote) funciona
- [ ] Salvar cria a demanda e redireciona para `/demandas`
- [ ] Parâmetros de URL (`?type=...&due_date=...`) pré-preenchem o formulário

### 1.9 Edição (`/app/gestao/demandas/editar/:id`)
- [ ] Formulário carrega com dados existentes preenchidos
- [ ] Alterações são salvas e refletidas na lista
- [ ] Cancelar retorna sem salvar

---

## 2. Colaborador — Visão "Minhas Demandas" (`/app/gestao/demandas`)

### 2.1 Carregamento
- [ ] Título muda para "Minhas Demandas"
- [ ] Subtítulo: "Visualize e responda às demandas atribuídas a você"
- [ ] Somente demandas atribuídas ao colaborador aparecem
- [ ] Sem console errors

### 2.2 Tabs
- [ ] Tabs disponíveis (Pendentes / Em Progresso / Revisão / Concluídas)
- [ ] Cada tab filtra corretamente

### 2.3 Detalhe da Demanda (`/app/gestao/demandas/:id`)
- [ ] Abre a demanda individual com todas as informações
- [ ] Botão "Iniciar" muda status para `in_progress`
- [ ] Área de resposta com editor rich text funciona
- [ ] Salvar rascunho persiste sem enviar
- [ ] Enviar para revisão muda status para `review`
- [ ] Após feedback do gestor, botão de reenviar funciona
- [ ] Anexos podem ser adicionados e visualizados

---

## 3. Verificações Globais

- [ ] Nenhum `console.error` em nenhuma das rotas acima
- [ ] Nenhum `console.warn` de React (key duplicada, hook condicional, etc.)
- [ ] Nenhum request com status 4xx/5xx nas network requests
- [ ] Navegação entre rotas não causa unmount/remount do layout principal
- [ ] Sidebar do HiperGestão permanece funcional em todas as rotas

---

## 4. Feature Flags (quando aplicável)

- [ ] Com todas as flags `false`: comportamento idêntico ao baseline
- [ ] Habilitar `DEMANDS_LAYOUT_V2`: apenas mudanças visuais, sem quebra funcional
- [ ] Demais flags (`GOVERNANCE_V1`, `SERVER_FILTERS_V1`, etc.): sem efeito visível quando `false`

---

## Resultado

| Seção | Status | Observações |
|-------|--------|-------------|
| 1. Gestor | ⬜ | |
| 2. Colaborador | ⬜ | |
| 3. Globais | ⬜ | |
| 4. Flags | ⬜ | |

**Testado por:** _______________
**Data:** _______________
**Versão/Commit:** _______________