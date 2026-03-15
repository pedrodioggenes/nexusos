# Nexus: O Sistema Operacional de uma Rede Varejista

## Documento Fundacional — Material de Referência para Construção de PRD

---

## I. CONTEXTO E ORIGEM

### A Empresa

A HiperSenna é uma rede varejista de supermercados com múltiplas unidades (lojas físicas) e um Centro de Distribuição (CD) centralizado. Sua operação abrange desde a negociação com fornecedores e compra de mercadorias, passando pelo recebimento logístico, armazenagem, separação, expedição, até a chegada do produto na gôndola e a venda final ao consumidor. Como toda rede varejista de médio-grande porte, a HiperSenna opera simultaneamente nos domínios comercial, logístico, financeiro, de marketing, recursos humanos e tecnologia.

### A Dor Original

Antes deste projeto, a operação da HiperSenna era sustentada por uma constelação fragmentada de ferramentas desconectadas:

- **Winthor (TOTVS):** ERP legado que concentra dados transacionais — vendas, estoque, fiscal, financeiro. É o "repositório de verdade" dos dados brutos, mas oferece interfaces arcaicas, relatórios limitados e nenhuma camada de inteligência analítica.
- **Planilhas Excel:** Usado extensivamente para planejamento de campanhas, controle orçamentário de marketing, acompanhamento de demandas, gestão de equipe e praticamente qualquer necessidade não coberta pelo ERP.
- **WhatsApp:** Canal primário de comunicação operacional — pedidos de demanda entre departamentos, alinhamentos sobre campanhas, cobranças de entrega, aprovações informais. Zero rastreabilidade, zero governança.
- **E-mail:** Comunicação formal esporádica, sem integração com fluxos de trabalho.
- **Papel:** Checklists de loja, conferências de recebimento, registros de perdas, formulários de avaliação — tudo em papel físico, sem digitalização, sem auditoria, sem dados.

**O resultado:** Informação pulverizada, decisões baseadas em intuição ao invés de dados, retrabalho constante, zero rastreabilidade de processos, impossibilidade de auditoria, comunicação caótica sem confirmação de recebimento, e uma gestão executiva que operava no escuro — sem dashboards, sem KPIs em tempo real, sem visão consolidada da operação.

### A Visão Fundadora

O projeto nasce de uma visão clara: **criar uma plataforma digital unificada que substitua todas essas ferramentas fragmentadas por um ecossistema integrado, onde informação, decisão e ação fluam sem atrito entre todos os níveis da organização.**

Não se trata de construir "mais um ERP" ou "mais um SaaS departamental". A visão é de um **Sistema Operacional Empresarial** — uma camada de inteligência e operação que se posiciona acima do ERP legado, consumindo seus dados brutos e os transformando em inteligência acionável, ao mesmo tempo que digitaliza e automatiza os processos que antes existiam apenas em papel, WhatsApp e planilhas.

---

## II. FILOSOFIA E PRINCÍPIOS FUNDAMENTAIS

### 1. Princípio da Unificação

Todo dado, toda decisão, toda comunicação e toda ação operacional deve existir em um único lugar. Não há "o sistema de marketing", "o sistema de compras" e "o sistema de RH" — há **um sistema** com múltiplas dimensões. Cada dimensão é especializada, mas todas compartilham o mesmo tecido de dados, identidade, permissões e comunicação.

### 2. Princípio da Hierarquia Inteligente

A informação certa deve chegar à pessoa certa, no nível certo de detalhe, no momento certo. Um colaborador de loja precisa ver tarefas e comunicados do seu departamento. Um chefe de departamento precisa ver KPIs da sua área e gerenciar sua equipe. Um diretor precisa de visão consolidada da rede. A plataforma se adapta automaticamente ao perfil hierárquico e funcional do usuário.

### 3. Princípio do Zero-Papel

Todo processo que hoje existe em papel — checklists, conferências, formulários, aprovações — deve ser digitalizado com ganho de rastreabilidade e auditoria. Isso não é apenas conveniência; é fundamento de governança e economia operacional.

### 4. Princípio da Inteligência Progressiva

O sistema começa como ferramenta de organização e visualização. Evolui para ferramenta de inteligência analítica (KPIs, alertas, projeções). E caminha para inteligência preditiva e prescritiva (IA sugerindo ações baseadas em padrões de dados). Essa progressão é deliberada e planejada em horizontes.

### 5. Princípio da Economia Operacional

Cada funcionalidade deve gerar economia mensurável — seja em tempo (menos retrabalho), em dinheiro (menos desperdício, melhor negociação), em papel (digitalização), ou em qualidade de decisão (dados ao invés de intuição).

---

## III. ARQUITETURA CONCEITUAL — O NEXUS

O nome interno da arquitetura é **Nexus** — o ponto onde tudo se conecta. O ecossistema é organizado em quatro camadas estratégicas:

### Camada 1: Engajamento (Interface Humana)
O ponto de contato entre o ser humano e a máquina. É onde o colaborador, do operador de loja ao diretor executivo, interage com todo o ecossistema.

- **HiperWorks** — O Sistema Operacional Humano

### Camada 2: Estratégica (Inteligência e Governança)
Os motores que transformam dados brutos em inteligência estratégica e suportam decisões de alto nível.

- **HiperIA** — Motor de Inteligência Artificial
- **HiperDomínio** — Business Intelligence e Dashboards Analíticos
- **HiperFinanceiro** — Inteligência Financeira Operacional
- **HiperLoja** — Inteligência Econômica do Ponto de Venda
- **HiperTech** — Gestão de Tecnologia (Fractional CTO)

### Camada 3: Tática (Planejamento e Pessoas)
Os motores que traduzem estratégia em planos de ação e gerenciam os recursos humanos.

- **HiperMarketing** — Marketing OS (gestão de campanhas, demandas, orçamento, equipe criativa)
- **HiperRH** — Gestão de Pessoas (recrutamento, treinamento, avaliação, clima)

### Camada 4: Operacional (Execução)
Os motores que digitalizam e automatizam a operação do dia-a-dia.

- **HiperTrade** — Gestão de Trade Marketing e Verbas Comerciais
- **HiperReposição** — Reposição inteligente de gôndola
- **HiperCD** — WMS (Warehouse Management System) do Centro de Distribuição
- **HiperOfertas** — Campanhas promocionais e CRM via WhatsApp
- **HiperCompras** — Inteligência de Suprimentos e Negociação
- **HiperAcademy** — Universidade Corporativa
- **HiperCliente** — CRM e Visão 360° do Consumidor
- **HiperSorteios** — Campanhas Promocionais com Sorteios

### O Conceito de "Motor Funcional"

Cada aplicativo listado acima não é um "módulo" no sentido tradicional de ERP (uma tela dentro de um sistema monolítico). Cada um é um **motor funcional independente** — com seu próprio domínio de dados, suas próprias telas especializadas, seus próprios KPIs e sua própria lógica de negócio. Eles são aplicativos completos que podem ser acessados individualmente através de um portal de navegação.

Porém — e aqui está o diferencial da Arquitetura Nexus — esses motores também **exportam** suas funcionalidades para serem consumidas por outros motores. O principal consumidor é o HiperWorks (a Mesa de Trabalho), mas a arquitetura permite que qualquer motor consuma funcionalidades de outro.

---

## IV. HIPERWORKS — A MESA DE TRABALHO

### O que é

O HiperWorks é o coração do ecossistema. É a primeira tela que o colaborador vê ao iniciar seu dia de trabalho. Conceituado como uma **mesa de trabalho digital** (ou simplesmente "a Mesa"), ele funciona como um sistema operacional onde o usuário tem acesso a tudo que precisa sem navegar entre aplicativos diferentes.

### A Metáfora da Mesa

Imagine uma mesa de trabalho física. Sobre ela, o profissional tem seus documentos, suas ferramentas, seu telefone, seus recados. Tudo organizado do jeito que ele prefere. Ele não precisa levantar e ir a outra sala para consultar um relatório financeiro — ele o puxa para sua mesa.

O HiperWorks digitaliza essa metáfora:

- A **sidebar esquerda** é a gaveta de ferramentas — contém navegação para todas as visualizações disponíveis, incluindo páginas "puxadas" de outros aplicativos
- A **coluna central** é a superfície de trabalho — onde o conteúdo principal é exibido e manipulado
- A **sidebar direita** é o painel de widgets — informações contextuais atualizadas em tempo real
- A **barra inferior** (mobile) são atalhos rápidos — as ações mais frequentes ao alcance do polegar

### Personalização da Mesa

Cada usuário pode personalizar sua Mesa:

1. **Fixar páginas de outros apps na sidebar** — Um chefe de marketing pode fixar "Demandas" e "Campanhas" do HiperMarketing diretamente na sidebar do HiperWorks, sem precisar abrir o app completo.
2. **Arranjar widgets na Home e no painel direito** — KPIs relevantes, resumos de sprint, status de tickets, pipeline de demandas — todos renderizados como widgets compactos reorganizáveis.
3. **Configurar ações rápidas** — Botões de atalho para operações frequentes como "Nova Demanda" ou "Novo Ticket".

### Navegação Contida (Princípio Crítico)

Quando o usuário "puxa" uma funcionalidade de outro app para dentro da Mesa (ex: a tela de Demandas do HiperMarketing), essa funcionalidade roda **contida dentro do HiperWorks**. Isso significa:

- O cabeçalho, a sidebar e o layout do HiperWorks são preservados
- A página embarcada ocupa a coluna central, com breadcrumbs indicando a origem (ex: "HiperWorks > HiperMarketing > Demandas")
- Interações internas (clicar em uma demanda para ver detalhes, por exemplo) devem acontecer **dentro do container** — o usuário nunca é "ejetado" para fora do HiperWorks
- Um link de escape permite abrir o app completo em sua interface nativa quando desejado

### Perfis e Adaptação Contextual

A Mesa se adapta ao perfil do usuário com base em dois eixos:

**Eixo Hierárquico (4 níveis):**
- **Colaborador** — Vê suas tarefas, comunicados do departamento, seus treinamentos
- **Chefe de Departamento** — Vê KPIs da sua área, gerencia equipe, acessa ferramentas departamentais
- **Diretor** — Visão consolidada da rede, KPIs executivos, aprovações estratégicas
- **Secretária** — Perfil de delegação — pode atuar em nome de diretores, com barra de contexto indicando a delegação ativa

**Eixo Funcional (Departamentos):**
- Marketing, Comercial/Trade, Tecnologia, TI (Suporte), RH, Financeiro, Operações, Logística/CD
- Cada departamento determina quais widgets, KPIs e funcionalidades são relevantes

A combinação desses eixos gera uma experiência única para cada perfil: o Chefe de Marketing vê demandas e campanhas; o Chefe de TI vê tickets e SLA; o Diretor vê o consolidado de tudo.

### Comunicação Integrada

O HiperWorks inclui um sistema de comunicação interna (o "Mural") com características específicas:

- **Feed direcional e hierárquico** — Posts podem ser direcionados a departamentos, níveis ou pessoas específicas
- **ACK (Acuse de Recebimento) obrigatório** — Comunicados importantes exigem confirmação de leitura
- **Pontes de alerta cross-módulo** — Anomalias detectadas em qualquer motor (ex: shrink rate alto no CD, margem deteriorada no Financeiro) são automaticamente publicadas como alertas no feed do HiperWorks para os usuários autorizados
- **Integração com fluxos de trabalho** — O ACK de uma notificação de demanda no HiperWorks pode automaticamente mover o status da demanda para "Fazendo" no HiperMarketing

### Funcionalidades da Mesa

- **Home** — Dashboard pessoal com widgets contextuais ao perfil
- **Mural** — Feed de comunicação hierárquico com ACK
- **Mensagens** — Chat direto entre colaboradores
- **Equipe** — Visão da equipe do departamento/rede
- **Documentos** — Repositório de documentos
- **Perfil** — Dados do colaborador
- **Recrutamento** — Vagas e candidatos (RH)
- **Treinamentos** — Trilhas de capacitação
- **Metas** — OKRs e metas individuais/departamentais
- **Aprovações** — Fila centralizada de aprovações pendentes
- **Páginas Embarcadas** — Qualquer funcionalidade exportada por qualquer motor

---

## V. O PORTAL DE NAVEGAÇÃO — HiperConsole

Paralelamente ao HiperWorks, existe o **HiperConsole** — o portal que dá acesso a cada aplicativo em sua interface completa e nativa. Pense nele como o "menu iniciar" que lista todos os aplicativos disponíveis.

O HiperConsole implementa:

- **Grade de aplicativos** com ícones e cores distintas por motor
- **Controle de acesso granular** — Cada usuário/papel tem acesso a um subconjunto de aplicativos e, dentro de cada aplicativo, a um subconjunto de páginas
- **Favoritos e recentes** — Atalhos personalizados
- **Administração** — Gestão de usuários, papéis, permissões, configurações do tenant

A relação entre HiperConsole e HiperWorks é:
- **HiperConsole** = Acesso direto aos apps completos, em suas interfaces nativas
- **HiperWorks** = Mesa unificada que puxa funcionalidades dos apps para um ambiente integrado

O usuário pode escolher como prefere trabalhar: mergulhar no app completo via Console, ou manter tudo na Mesa do HiperWorks.

---

## VI. CADA MOTOR EM DETALHE

### 1. HiperMarketing (ID interno: hipergestao)

**Função:** Marketing OS — centraliza a gestão completa do departamento de marketing como uma plataforma auditável e quantificável.

**Domínio de dados:** Demandas criativas, campanhas, orçamento de marketing, equipe interna (5 áreas: Social Media, Tráfego, Design, Copywriter, Videomaker), agência parceira.

**Funcionalidades principais:**
- **Kanban de Demandas** — Fluxo de trabalho com 4+ estágios, filtros avançados, bulk actions, timeline de histórico. Cada demanda tem tipo (Post, Stories, Vídeo, Impresso, etc.), prioridade, responsável, prazo, e campos específicos do varejo (lojas afetadas, tipo de ação comercial, período de vigência).
- **Gestão de Campanhas** — Planejamento e execução de campanhas multicanal com timeline, KPIs (ROI, CAC, ROAS) e análise de impacto no varejo (comparativo Antes/Durante/Depois de cada campanha).
- **Financeiro de Marketing** — Controle orçamentário completo: movimentações, orçamento anual/mensal, fechamento, conciliação bancária, relatórios.
- **Gestão de Equipe Interna** — Alocação de recursos, desempenho individual, capacitação por área.
- **Gestão de Agência Parceira** — Scorecard de avaliação, SLA com métricas de pontualidade e qualidade, briefings estruturados, aprovações de entrega com markup visual, financeiro de contrato.
- **Workspace estilo Notion** — Editor de blocos (BlockNote) para briefings e documentos internos.
- **Dashboard de Comando** — Painel executivo com Score de Urgência (0-100), radar de alertas e KPIs operacionais.
- **Ações Comerciais** — Integração com Trade Marketing, referenciando pacotes comerciais do HiperTrade.

**Grupos de páginas (9 grupos, ~30 páginas):** Principal, Planejamento, Financeiro, Documentos, Canais, Pessoas, Agência, Análise, Atividade.

---

### 2. HiperTrade (ID interno: hipertrade)

**Função:** Gestão de Trade Marketing — controla a negociação, execução e comprovação de ações comerciais com fornecedores.

**Domínio de dados:** Pacotes de trade (encartes, pontas de gôndola, ilhas, degustações), fornecedores parceiros, contratos de verba, checklists de execução, comprovações fotográficas.

**Funcionalidades principais:**
- **Gestão de Pacotes** — Cada "pacote" é uma ação comercial negociada com um fornecedor (ex: "Ponta de gôndola P&G 15 dias"). Inclui valor, período, lojas participantes, tipo de exposição.
- **Contratos de Verba** — Acordos comerciais com fornecedores, com rastreamento de valores negociados vs. executados.
- **Checklists de Execução** — Verificação de que a ação comercial foi montada corretamente na loja (ponto de gôndola montado, material aplicado, etc.). Preenchidos por operadores de loja via formulários digitais.
- **Comprovação Fotográfica** — Upload de fotos comprovando a execução para envio ao fornecedor.
- **Calendário Comercial** — Visão timeline de todas as ações ativas e planejadas.
- **Performance e ROI** — Análise de retorno de cada ação de trade.

**Grupos de páginas (4 grupos, ~10 páginas):** Principal, Gestão, Execução, Análise.

---

### 3. HiperOfertas (ID interno: hiperofertas)

**Função:** Campanhas promocionais diretas ao consumidor via WhatsApp — CRM de ofertas.

**Domínio de dados:** Base de contatos (clientes com WhatsApp), templates de mensagem, campanhas de envio, segmentos, opt-outs.

**Funcionalidades principais:**
- **Gestão de Campanhas de WhatsApp** — Criação, agendamento e envio de ofertas promocionais em massa.
- **CRM de Contatos** — Base de clientes por unidade/loja, com gestão de opt-out e segmentação.
- **Templates** — Modelos de mensagem reutilizáveis (texto + mídia).
- **Relatórios** — Taxa de entrega, engajamento, crescimento da base.
- **Segmentação por Unidade** — Campanhas podem ser direcionadas a todas as lojas ou lojas específicas.

**Grupos de páginas (5 grupos, ~14 páginas):** Principal, Campanhas, CRM, Relatórios, Sistema.

---

### 4. HiperTech (ID interno: hiperpmo)

**Função:** Módulo permanente de Gestão de Tecnologia — funciona como a ferramenta de trabalho do Fractional CTO da rede.

**Domínio de dados:** Iniciativas de tecnologia, sprints, tickets de suporte, releases, indicadores de performance, roadmap estratégico.

**Funcionalidades principais:**
- **Roadmap Estratégico** — PDI (Plano de Desenvolvimento e Inovação) organizado em três Horizontes (H1: Fundação, H2: Expansão, H3: Autonomia) e cinco Workstreams, com cronograma visual timeline/Gantt de alta precisão.
- **Gestão de Sprints** — Backlog de iniciativas, sprints ativos com velocity tracking, board kanban.
- **Suporte & SLA** — Tickets de suporte com compliance de SLA, tempos de resposta, escalonamento.
- **Releases** — Registro de entregas e versões publicadas com changelog.
- **Indicadores** — KPIs operacionais de tecnologia (uptime, velocity, throughput).
- **Governança** — Ritos formais (WBR semanal, MSR mensal, QBR trimestral, Executive Gate anual), decisões estratégicas registradas.
- **Gestão de Pessoas** — BPOs (Business Process Owners), Sponsor Executivo, capacitação técnica.
- **Reports Cockpit** — Geração contextualizada de relatórios PDF editoriais.

**Grupos de páginas (7 grupos, ~17 páginas):** Controle, Backlog, Operação, Entregas, Governança, Pessoas, Admin.

---

### 5. HiperCD (ID interno: hipercd)

**Função:** WMS (Warehouse Management System) completo — controla o fluxo logístico do Centro de Distribuição, da chegada da mercadoria à expedição para as lojas.

**Domínio de dados:** SKUs, fornecedores, localizações do armazém (ruas/corredores/níveis), lotes com validade (FEFO), ordens de recebimento, putaway, picking, expedição, perdas.

**Funcionalidades principais:**
- **Recebimento:** Agendamento de docas, conferência de mercadoria (NF vs. físico), detecção automática de divergências (Conforme/Parcial/Divergente/Bloqueado), leitura de temperatura para perecíveis, registro de não-conformidades, rejeição automática de lotes vencidos.
- **Armazenagem:** Mapa visual do armazém com zonas (Seco, Refrigerado, Congelado, Químico), algoritmo de putaway de 4 níveis (Consolidação > Primário > Secundário > Zona), contagem cíclica com aprovação de ajustes, gestão de lotes via FEFO.
- **Separação:** Geração de ordens de transferência para lojas, agrupamento em waves, picking em serpentina otimizado (S-Shape), tarefas de picking com accuracy tracking.
- **Expedição:** Romaneios (listas de carregamento), documentação de transporte.
- **Qualidade:** Registro de perdas com causa raiz, shrink rate monitoring, análise de não-conformidades.
- **KPIs formais:** RAR (Receiving Accuracy Rate), DST (Dock-to-Stock Time), SUR (Space Utilization Rate), Fill Rate, Shrink Rate.
- **Demonstrações massivas:** Sementes de dados de ~4.000 registros para demonstração realista.

**Grupos de páginas (10 grupos, ~17 páginas):** Controle, Recebimento, Armazenagem, Demanda, Separação, Expedição, Qualidade, Lojas, Executivo, Importação.

---

### 6. HiperCompras (ID interno: hipercompras)

**Função:** Inteligência estratégica de suprimentos e negociação — foca em otimização de margem e capital de giro.

**Domínio de dados:** Fornecedores com scorecard, ordens de compra (OC), SKUs com dados de giro/margem/demanda, verbas comerciais.

**Funcionalidades principais:**
- **Calculadora Inteligente de OC** — Cálculo em tempo real de PPV (Purchase Price Variance) e GMROI (Gross Margin Return on Investment) enquanto o comprador monta a ordem.
- **Matriz Giro × Margem** — Identificação de SKUs "destruidores de valor" (GMROI < 1.0) e classificação em quadrantes estratégicos.
- **Análise de Demanda** — ADD (Average Daily Demand) ponderada, sazonalidade, projeção de ruptura.
- **CTA (Custo Total de Aquisição)** — Comparativo entre custo real (incluindo frete, impostos, bonificações) e preço de tabela.
- **Verbas Comerciais** — ROI de Trade Spend, alocação de verbas por fornecedor.
- **Ciclo de Conversão de Caixa (CCC)** — PMR, PME, PMP e NCG (Necessidade de Capital de Giro).
- **Alçadas de aprovação** — Gerencial ≥R$10k, Diretor ≥R$50k.
- **Scorecard de Fornecedores** — Avaliação multidimensional (qualidade, pontualidade, preço, atendimento).

**Grupos de páginas (7 grupos, ~12 páginas):** Controle, Fornecedores, Ordens de Compra, Verba Comercial, Análise, Financeiro, Importação.

---

### 7. HiperFinanceiro (ID interno: hiperfinanceiro)

**Função:** Inteligência financeira operacional — transforma dados contábeis e transacionais em visão estratégica para tomada de decisão.

**Domínio de dados:** 10 tabelas (prefixo `fin_`) — resultados mensais, despesas, metas, verbas, categorias.

**Funcionalidades principais:**
- **DRE Gerencial** — Demonstrativo de Resultado por Rede e por Loja, com drill-down por categoria e período.
- **Dashboard C-Level** — Painel executivo com semáforos automáticos contra metas.
- **Capital de Giro** — Painel CCC (Cash Conversion Cycle) e NCG (Necessidade de Capital de Giro) com análise de tendência.
- **Margem por Categoria** — Ranking IMC (Índice de Margem por Categoria) com alertas de deterioração.
- **Projeção de Resultado** — Cenários 30/60/90 dias.
- **Custos Operacionais** — Análise de custos fixos/variáveis e Ponto de Equilíbrio.
- **ROIC** — Retorno sobre Capital Investido.
- **Motor de 42 Fórmulas** — Centralizado em arquivo TypeScript, implementando cálculos de F-01 a F-42 cobrindo DRE, Capital de Giro, Margem de Contribuição, Projeções, Custos e ROIC.
- **Regras de negócio críticas via PostgreSQL:**
  - Imutabilidade de resultados aprovados com versionamento
  - Rateio automático de despesas anuais/trimestrais
  - Avaliação automática de semáforos contra metas
  - Validação de alocação de verbas (soma = 100%)
  - Alerta de deterioração de IMC por categoria

**Identidade visual:** Âmbar Dourado (HSL 42°).

**Grupos de páginas (8 grupos, ~12 páginas):** Dashboard, DRE Gerencial, Capital de Giro, Margem por Categoria, Projeção, Custos Operacionais, ROIC, Configuração.

---

### 8. HiperLoja (ID interno: hiperloja)

**Função:** Inteligência econômica do Ponto de Venda — analisa a rentabilidade do espaço físico da loja.

**Domínio de dados:** 11 tabelas (prefixo `loja_`) — seções/áreas, SKUs com preço e markup, perdas operacionais.

**Funcionalidades principais:**
- **Mapa de Calor de Seções** — Visualização da rentabilidade por m² (IPE — Índice de Produtividade por Espaço) de cada seção da loja.
- **Precificação** — Painel de Markup e IAP (Índice de Adequação de Preço), comparando markup praticado vs. meta por categoria.
- **Painel de SKUs PAC** — Identificação de produtos vendidos abaixo do custo (Preço Abaixo do Custo).
- **Registro de Perdas** — Digitalização do processo de registro de perdas operacionais, com custo imutável no momento do registro para auditoria.
- **Simulador de Layout** — Projeção de R$/m² em cenários de reorganização de seções.
- **Ranking e IPC** — Comparativo entre lojas com Índice de Performance Comparada.
- **Motor de 21 Fórmulas** — F-01 a F-21 para Rentabilidade por Espaço, Precificação e Perdas.
- **Motor de alertas automáticos** com escalonamento por SLA.

**Identidade visual:** Teal/Verde-Azulado (HSL 170°).

**Grupos de páginas (7 grupos, ~10 páginas):** Dashboard, Rentabilidade por Espaço, Precificação, Perdas Operacionais, Comparativo entre Lojas, Alertas, Configuração.

---

### 9. HiperRH (ID interno: hiperrh)

**Função:** Gestão completa de Recursos Humanos — do recrutamento ao clima organizacional.

**Status:** Estrutura pronta, aguardando integração de dados reais.

**Funcionalidades planejadas:**
- Recrutamento e seleção
- Onboarding
- Avaliação de desempenho
- Pesquisas de clima (anônimas)
- Gestão de benefícios
- Controle de turnos e escalas

---

### 10. HiperReposição (ID interno: hiperreposicao)

**Função:** Reposição inteligente de gôndola — garante que o produto certo esteja na prateleira certa no momento certo.

**Status:** Estrutura pronta, aguardando integração com dados de estoque de loja.

**Funcionalidades planejadas:**
- Sugestão automática de reposição baseada em velocidade de venda
- Alertas de gôndola vazia
- Otimização de facing
- Integração com HiperCD para transferências

---

### 11. HiperIA (ID interno: hiperia)

**Função:** Motor de Inteligência Artificial do ecossistema — fornece capacidades de IA contextualizada a todos os outros motores.

**Funcionalidades atuais:**
- Chat com IA contextual ao módulo ativo
- Análise de dados por linguagem natural
- Geração de insights e recomendações

**Visão futura:** Evolução para agente autônomo que monitora KPIs e sugere ações proativamente.

---

### 12. HiperDomínio (ID interno: hiperdominio)

**Função:** Business Intelligence centralizado — dashboards analíticos de alta performance com drill-down.

**Status:** Conceitual/Draft — será o repositório de análises avançadas quando os dados do Winthor estiverem integrados.

**Funcionalidades planejadas:**
- GlobalFiltersBar (unidades/períodos)
- KPIGrid com sparklines
- DataTablePro (ordenação/filtragem no servidor)
- Visões: Vendas, Financeiro, Problemas, Operacional, Inteligência
- InsightCards acionáveis
- AskAIBox para queries semânticas

---

### 13. HiperCliente (ID interno: hipercliente)

**Função:** CRM e visão 360° do consumidor — foco em LTV e experiência do cliente.

**Status:** Estrutura pronta, aguardando dados reais.

**Funcionalidades planejadas:**
- Perfis individuais de consumidor com histórico de compra
- Segmentação RFM (Recência, Frequência, Valor)
- NPS/CSAT automatizado
- Tickets de suporte/SAC
- KPIs: NPS, Churn Rate, LTV

**Identidade visual:** Magenta.

**Grupos de páginas (5 grupos, ~8 páginas):** Controle, Clientes, Experiência, Atendimento, Relatórios.

---

### 14. HiperAcademy (ID interno: academy)

**Função:** Universidade Corporativa — trilhas de capacitação e desenvolvimento.

**Status:** Conceitual/Draft.

**Funcionalidades planejadas:**
- Trilhas de aprendizado por cargo/departamento
- Conteúdo multimídia (vídeos, quizzes, documentos)
- Certificação interna
- Integração com metas de desempenho do HiperRH

---

### 15. HiperSorteios (ID interno: hipersorteios)

**Função:** Gestão de campanhas promocionais com sorteios — compliance legal e detecção de fraude.

**Funcionalidades:**
- Criação de campanhas de sorteio
- Gestão de participantes e cupons
- Realização de sorteios auditáveis
- Logs de fraude e segurança

**Grupos de páginas (3 grupos, ~4 páginas):** Principal, Gestão, Segurança.

---

## VII. ARQUITETURA TÉCNICA

### Stack Tecnológica

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **UI Components:** shadcn/ui (Radix Primitives) + Framer Motion (animações)
- **State Management:** TanStack Query (server state), React useState/useCallback (local state), localStorage (persistência de preferências)
- **Roteamento:** React Router v6 (SPA)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **Gráficos:** Recharts
- **Editor de blocos:** BlockNote
- **Drag & Drop:** @dnd-kit
- **PDF:** jspdf + @react-pdf/renderer

### Design System

- **Paleta base:** Zinc (fundos e interfaces) — todos os motores compartilham a mesma base visual escura
- **Diferenciação por cor de acento:** Cada motor tem uma cor própria para ícones e destaques, mas nunca para fundos ou texto primário
- **Tokens semânticos CSS:** Todas as cores são definidas como variáveis CSS HSL e consumidas via Tailwind
- **Tipografia:** Sistema tipográfico padronizado
- **Responsividade:** Mobile-first, com adaptação progressiva para tablet e desktop

### Banco de Dados

- **Multi-tenant:** Todas as tabelas possuem `tenant_id` com RLS (Row Level Security) habilitado
- **Prefixos por domínio:** `cd_` (HiperCD), `fin_` (Financeiro), `loja_` (HiperLoja), etc.
- **Triggers e RPCs:** Lógica de negócio crítica implementada no PostgreSQL (imutabilidade, rateios, validações, alertas automáticos)
- **Realtime:** Suporte a subscrições em tempo real via Supabase Realtime para feeds e notificações

### Controle de Acesso

- **Autenticação:** Supabase Auth
- **Permissões:** Sistema granular de acesso por módulo e por página dentro de cada módulo
- **Perfis hierárquicos:** Colaborador, Chefe de Departamento, Diretor, Secretária
- **Delegação:** Secretárias podem atuar em nome de diretores, com auditoria completa

---

## VIII. A VISÃO DE FUTURO

### Integração com Winthor (ERP)

O próximo grande passo é a construção de um **servidor intermediário** que funciona como depósito de dados extraídos do Winthor. Este servidor será o motor de análise de dados que:

1. **Extrai** dados transacionais brutos do Winthor (vendas, estoque, fiscal, financeiro)
2. **Transforma** esses dados em estruturas otimizadas para análise
3. **Alimenta** os motores do ecossistema Nexus com dados reais

Com dados reais fluindo, os aplicativos que hoje funcionam com dados demonstrativos (seeds) passam a operar com informação viva. Isso é transformacional:

- O HiperFinanceiro deixa de exibir DREs simulados e passa a mostrar o DRE real da rede
- O HiperLoja calcula o IPE real de cada seção com dados de venda reais
- O HiperCompras projeta demanda baseada em histórico real de vendas
- O HiperCD integra ordens de compra reais com o fluxo de recebimento
- O HiperDomínio se torna o BI centralizado com dados vivos

### Economia Operacional

Cada funcionalidade do ecossistema é desenhada para gerar economia mensurável:

- **Eliminação de papel:** Checklists de trade, conferências de recebimento, registros de perda, formulários de avaliação — tudo digitalizado
- **Eliminação de WhatsApp operacional:** Comunicação rastreável com ACK substitui mensagens perdidas em grupos
- **Eliminação de planilhas:** Orçamentos, demandas, KPIs — tudo em interfaces especializadas
- **Redução de retrabalho:** Dados fluem automaticamente entre motores (ex: uma OC aprovada no HiperCompras gera automaticamente expectativa de recebimento no HiperCD)
- **Qualidade de decisão:** Dados em tempo real ao invés de relatórios mensais atrasados

### Inteligência Artificial Progressiva

A evolução da IA no ecossistema segue três horizontes:

1. **H1 (Atual):** IA como assistente — responde perguntas, gera insights pontuais, ajuda em análises
2. **H2 (Próximo):** IA como monitor — observa KPIs continuamente, detecta anomalias, envia alertas proativos
3. **H3 (Futuro):** IA como agente — sugere ações específicas baseadas em padrões (ex: "Recomendo aumentar pedido de SKU X em 30% para as próximas 2 semanas baseado em tendência de demanda e sazonalidade histórica")

---

## IX. ESTADO ATUAL DE MATURIDADE

### Nível 1 — Produção Plena (interface completa, lógica de negócio implementada)
- HiperMarketing (hipergestao)
- HiperTrade
- HiperOfertas
- HiperIA
- HiperWorks
- HiperConsole
- HiperCD
- HiperCompras
- HiperFinanceiro
- HiperLoja

### Nível 2 — Estrutura Pronta, Sem Dados Reais
- HiperRH
- HiperReposição
- HiperCliente

### Nível 3 — Conceitual/Draft
- HiperDomínio (BI)
- HiperAcademy

### Em ativação
- HiperTech — em fase de ativação de dados piloto e evolução da inteligência analítica
- HiperSorteios — estrutura funcional para campanhas promocionais

---

## X. O QUE TORNA ISSO ÚNICO

### 1. Não é um ERP
ERPs são sistemas transacionais que registram o que aconteceu. O Nexus é uma camada de **inteligência e operação** que se posiciona acima do ERP, transformando dados em decisão e decisão em ação.

### 2. Não é uma coleção de SaaS
Ferramentas SaaS são silos especializados (um Trello para tarefas, um PowerBI para dashboards, um RD Station para marketing). O Nexus é **um ecossistema integrado** onde a informação flui naturalmente entre domínios.

### 3. O conceito de "Mesa"
Nenhuma plataforma do mercado varejista oferece o conceito de Mesa de Trabalho Personalizável onde o usuário compõe sua superfície com funcionalidades de múltiplos domínios. Isso é o que diferencia o HiperWorks de qualquer portal corporativo tradicional.

### 4. Construído para varejo
Cada fórmula, cada KPI, cada fluxo de trabalho é pensado especificamente para a realidade do varejo supermercadista brasileiro — com suas particularidades de margem apertada, alta rotatividade, sazonalidade, trade marketing, verbas comerciais, e operação de CD.

### 5. Hierarquia nativa
O sistema não implementa permissões como um add-on. A hierarquia organizacional está no DNA da arquitetura — desde a comunicação direcional do Mural até a adaptação automática da interface ao perfil do usuário.

---

## XI. NÚMEROS E ESCALA

- **16+ aplicativos** no ecossistema
- **~150+ páginas** distintas registradas no sistema de permissões
- **42 fórmulas financeiras** implementadas
- **21 fórmulas** de inteligência de loja
- **4.000+ registros** de demonstração no WMS
- **4 perfis hierárquicos** com adaptação automática
- **8+ departamentos funcionais** mapeados
- **10+ tabelas** com triggers e RPCs no PostgreSQL
- **Multi-tenant** desde o primeiro dia

---

## XII. GLOSSÁRIO DE TERMOS

| Termo | Significado |
|---|---|
| **Nexus** | Nome da arquitetura — o ponto de conexão de todo o ecossistema |
| **Mesa** | A interface personalizada do HiperWorks onde o usuário opera |
| **Motor Funcional** | Cada aplicativo do ecossistema, visto como um motor que exporta funcionalidades |
| **Navegação Contida** | Princípio de que funcionalidades embarcadas rodam dentro do HiperWorks sem ejetar o usuário |
| **ACK** | Acuse de recebimento — confirmação obrigatória de leitura de comunicados |
| **Winthor** | ERP legado (TOTVS) que é a fonte de dados transacionais |
| **Workbench** | Sistema de registro declarativo onde motores exportam páginas, widgets e ações |
| **Ponte de Alerta** | Mecanismo que replica anomalias de qualquer motor no feed do HiperWorks |
| **FEFO** | First Expired, First Out — método de gestão de validade no CD |
| **GMROI** | Gross Margin Return on Investment — retorno de margem sobre investimento em estoque |
| **CCC** | Cash Conversion Cycle — ciclo de conversão de caixa |
| **IPE** | Índice de Produtividade por Espaço — R$/m² de cada seção da loja |
| **PAC** | Preço Abaixo do Custo — SKU vendido abaixo do custo de aquisição |
| **DRE** | Demonstrativo de Resultado do Exercício |
| **NCG** | Necessidade de Capital de Giro |
| **IMC** | Índice de Margem por Categoria |

---

*Este documento representa o estado atual do ecossistema Nexus/HiperSenna em março de 2026. É material de referência para construção de documentação formal (PRD) e não deve ser tratado como especificação técnica final.*
