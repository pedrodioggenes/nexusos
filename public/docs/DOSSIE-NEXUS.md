# 📋 DOSSIÊ COMPLETO: PLATAFORMA HIPERMARKETING

**Documento Técnico-Estratégico | Versão 1.0**  
**Data de Elaboração:** Janeiro de 2026  
**Classificação:** Documento Interno / Apresentação Comercial

---

## 📑 ÍNDICE

1. [Sumário Executivo](#1-sumário-executivo)
2. [Visão Geral da Plataforma](#2-visão-geral-da-plataforma)
3. [Arquitetura Técnica](#3-arquitetura-técnica)
4. [Os Módulos do Ecossistema](#4-os-módulos-do-ecossistema)
5. [Sistema de Design Aurora 3](#5-sistema-de-design-aurora-3)
6. [Modelo de Negócio e Multi-Tenancy](#6-modelo-de-negócio-e-multi-tenancy)
7. [Segurança e Compliance](#7-segurança-e-compliance)
8. [Roadmap e Evolução](#8-roadmap-e-evolução)
9. [Especificações Técnicas Detalhadas](#9-especificações-técnicas-detalhadas)

---

## 1. SUMÁRIO EXECUTIVO

### 1.1 O Que É o HiperMarketing?

O **HiperMarketing** é uma plataforma SaaS (Software as a Service) de última geração, desenvolvida especificamente para o **setor supermercadista brasileiro**. A solução integra inteligência artificial, gestão estratégica de marketing, trade marketing e automação de campanhas em um ecossistema unificado e premium.

### 1.2 Proposta de Valor

> *"Transformar dados fragmentados em decisões estratégicas, conectando a inteligência do varejo à execução no ponto de venda."*

A plataforma resolve uma dor crítica do setor: a **fragmentação de informações** entre áreas de marketing, trade, comercial e operações. Antes do HiperMarketing, redes supermercadistas operavam com:

- Planilhas Excel dispersas para controle de verbas cooperadas
- WhatsApp informal para aprovações de campanhas
- Relatórios manuais que levavam dias para consolidar
- Nenhuma visibilidade em tempo real do ROI de ações de trade

### 1.3 Números-Chave

| Métrica | Valor |
|---------|-------|
| Módulos Integrados | 5 (HiperIA, HiperGestão, HiperTrade, HiperOfertas, HiperConsole) |
| Tabelas no Banco de Dados | 45+ |
| Linhas de Código (estimativa) | 80.000+ |
| Edge Functions | 7 |
| Componentes React | 200+ |

---

## 2. VISÃO GERAL DA PLATAFORMA

### 2.1 História e Origem

O projeto nasceu sob o codinome interno **"NOS Console"** (referência ao console administrativo) e **"Aurora"** (referência ao sistema de design visual). A evolução passou por três fases distintas:

#### Fase 1: Aurora 1 (Protótipo)
- Interface tradicional com backgrounds claros
- Componentes básicos do shadcn/ui sem customização
- Foco em validar fluxos de negócio

#### Fase 2: Aurora 2 (Transição)
- Introdução do tema escuro
- Primeiros experimentos com glassmorphism
- Separação modular começando a se formar

#### Fase 3: Aurora 3 (Produção Atual)
- Sistema de design premium completo
- Micro-interações com Framer Motion
- Identidade visual por módulo
- Padrão de materialidade e profundidade

### 2.2 Público-Alvo

#### Primário: Redes Supermercadistas
- Redes regionais com 5-50 lojas
- Faturamento entre R$ 100M - R$ 1B/ano
- Equipes de marketing de 3-15 pessoas
- Relacionamento ativo com 20-100 fornecedores

#### Secundário: Fornecedores/Indústria
- Gerentes de trade marketing de indústrias
- Representantes comerciais
- Agências de trade marketing

### 2.3 Problemas Resolvidos

| Problema Anterior | Solução HiperMarketing |
|-------------------|------------------------|
| Verbas cooperadas em planilhas | Módulo Trade com tracking em tempo real |
| Aprovações via WhatsApp | Workflows de aprovação com audit trail |
| Relatórios manuais de 3 dias | Dashboards automáticos e IA generativa |
| Execução de PDV sem visibilidade | Fotos geolocalizadas com validação |
| Campanhas de oferta desorganizadas | Orquestração completa com templates |

---

## 3. ARQUITETURA TÉCNICA

### 3.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
├─────────────────────────────────────────────────────────────┤
│  React 18.3    │  TypeScript 5.x  │  Vite 5.x              │
│  Tailwind CSS  │  Framer Motion   │  TanStack Query        │
│  shadcn/ui     │  Recharts        │  React Router 6        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Lovable Cloud)                │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL  │  Row Level Security (RLS)          │
│  Supabase Auth        │  Edge Functions (Deno)             │
│  Supabase Storage     │  Realtime Subscriptions            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INTELIGÊNCIA ARTIFICIAL                │
├─────────────────────────────────────────────────────────────┤
│  Gemini 2.5 Pro/Flash    │  OpenAI GPT-4o                  │
│  Geração de Documentos   │  Insights Contextuais           │
│  Chat Conversacional     │  Análise de Performance         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estrutura de Diretórios

```
src/
├── assets/                    # Imagens e recursos estáticos
├── components/
│   ├── ui/                    # Componentes base (shadcn customizado)
│   ├── layout/                # Layouts por contexto
│   │   ├── console/           # Layout administrativo NOS Console
│   │   └── workspace/         # Layouts dos módulos de trabalho
│   ├── hipergestao/           # Componentes do HiperGestão
│   ├── hipertrade/            # Componentes do HiperTrade
│   ├── hiperia/               # Componentes do HiperIA
│   └── console/               # Componentes do NOS Console
├── contexts/                  # React Contexts (Auth, Theme)
├── hooks/                     # Custom hooks reutilizáveis
├── integrations/
│   └── supabase/              # Cliente e tipos do Supabase
├── lib/                       # Utilitários e helpers
├── pages/                     # Páginas organizadas por módulo
│   ├── console/               # Páginas administrativas
│   ├── hipergestao/           # Páginas do módulo Gestão
│   ├── hipertrade/            # Páginas do módulo Trade
│   ├── hiperofertas/          # Páginas do módulo Ofertas
│   └── hiperia/               # Páginas do módulo IA
└── types/                     # Definições TypeScript
```

### 3.3 Modelo de Dados (Simplificado)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   tenants    │──────<│ tenant_users │>──────│    users     │
│              │       │              │       │  (auth.users)│
│  - id        │       │  - tenant_id │       │              │
│  - name      │       │  - user_id   │       │  - id        │
│  - slug      │       │  - role      │       │  - email     │
│  - modules[] │       │  - user_type │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │
       │ (tenant_id em todas as tabelas de dados)
       ▼
┌──────────────────────────────────────────────────────────────┐
│                     DADOS POR TENANT                          │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  suppliers   │  campaigns   │  team_tasks  │  marketing_kpis │
│  coop_funds  │  proofs      │  workspace   │  alerts         │
│  budgets     │  checklists  │  content_cal │  goals          │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

### 3.4 Edge Functions

| Função | Propósito |
|--------|-----------|
| `hiperia-chat` | Processamento de conversas com IA (Gemini/GPT) |
| `generate-insight` | Geração de insights automáticos para dashboards |
| `generate-document` | Criação de PDFs, Word, Excel via IA |
| `generate-title` | Geração automática de títulos para conversas |
| `document-ai-assistant` | Assistente contextual para workspace |
| `create-tenant-user` | Criação segura de usuários por tenant |
| `seed-demo-data` | População de dados demo para novos tenants |

---

## 4. OS MÓDULOS DO ECOSSISTEMA

### 4.1 HiperIA — Assistente de Inteligência Artificial

**Cor Temática:** `#8B5CF6` (Violeta)  
**Rota Base:** `/app/ia`

#### Funcionalidades Principais

1. **Chat Conversacional Avançado**
   - Suporte a múltiplos modelos (Gemini, GPT)
   - Histórico persistente de conversas
   - Upload e análise de arquivos (PDF, imagens, planilhas)
   - Streaming de respostas em tempo real

2. **Geração de Documentos**
   - Relatórios executivos em PDF
   - Análises comparativas em Excel
   - Documentos formatados em Word
   - Exportação de conversas em Markdown

3. **Sugestões Contextuais**
   - Prompts inteligentes baseados no contexto
   - Análise automática de última mensagem
   - Atalhos para ações frequentes

4. **Métricas e Analytics**
   - Dashboard de uso da IA
   - Tempo médio de resposta
   - Feedback de qualidade (thumbs up/down)
   - Histórico de consultas agendadas

#### Casos de Uso

- *"Analise o ROI das campanhas de trade do último trimestre"*
- *"Gere um relatório executivo comparando performance por loja"*
- *"Quais fornecedores têm verba cooperada não utilizada?"*
- *"Crie um plano de marketing para o Dia das Mães"*

---

### 4.2 HiperGestão — Central de Comando Estratégico

**Cor Temática:** `#A855F7` (Púrpura)  
**Rota Base:** `/app/gestao`

#### Funcionalidades Principais

1. **Dashboard Executivo**
   - KPIs em tempo real (ROI, CAC, LTV, NPS)
   - Gráficos de tendência e comparativos
   - Alertas críticos priorizados
   - Metas e OKRs com tracking

2. **Workspace Notion-Like**
   - Editor de documentos com BlockNote
   - Hierarquia de páginas infinita
   - Templates pré-configurados
   - Conversão de documento em tarefa

3. **Gestão de Equipe**
   - Kanban de tarefas por especialidade
   - Fluxo de aprovação multi-nível
   - Métricas de produtividade
   - Calendário editorial integrado

4. **Orçamento e Planejamento**
   - Controle de budget anual
   - Categorias de despesa
   - Transferências entre centros de custo
   - Projeções e forecasting

5. **Calendário de Marketing**
   - Visualização mensal/semanal/agenda
   - Campanhas com timeline visual
   - Datas comemorativas automáticas
   - Sincronização com módulo Trade

#### Subpáginas por Especialidade

| Rota | Especialidade |
|------|---------------|
| `/equipe/design` | Designers e criativos |
| `/equipe/copywriter` | Redatores |
| `/equipe/social-media` | Gestores de redes sociais |
| `/equipe/trafego` | Mídia paga e performance |
| `/equipe/videomaker` | Produção audiovisual |

---

### 4.3 HiperTrade — Gestão de Trade Marketing

**Cor Temática:** `#F97316` (Laranja)  
**Rota Base:** `/app/trade`

#### Funcionalidades Principais

1. **Gestão de Fornecedores**
   - Cadastro completo com CNPJ
   - Contatos e responsáveis
   - Histórico de relacionamento
   - Score de performance

2. **Verbas Cooperadas (Coop Funds)**
   - Registro de valores negociados
   - Tracking de utilização
   - Alertas de vencimento
   - Relatórios de aproveitamento

3. **Pacotes de Trade**
   - Criação de pacotes comerciais
   - Workflow de aprovação (Kanban)
   - Checklists de execução
   - Validade e condições

4. **Comprovações de Execução**
   - Upload de fotos geolocalizadas
   - Validação por loja
   - Status de aprovação
   - Relatório de compliance

5. **Análise de ROI**
   - ROI por fornecedor
   - ROI por tipo de ação
   - Comparativo período a período
   - Insights de otimização

#### Portal do Fornecedor

Acesso externo para fornecedores visualizarem:
- Seus pacotes ativos
- Status de comprovações
- Relatórios de performance
- Upload de materiais

---

### 4.4 HiperOfertas — Campanhas e Comunicação

**Cor Temática:** `#14B8A6` (Teal/Ciano)  
**Rota Base:** `/app/ofertas`

#### Funcionalidades Principais

1. **Gestão de Campanhas**
   - Criação assistida de campanhas
   - Templates visuais
   - Agendamento de envios
   - Status em tempo real

2. **CRM de Contatos**
   - Base unificada de clientes
   - Segmentação avançada
   - Gestão de opt-out
   - Limpeza automática de inválidos

3. **Integração WhatsApp**
   - Disparo em massa (via API)
   - Templates homologados
   - Preview em tempo real
   - Métricas de entrega

4. **Tabloides Digitais**
   - Criação visual de encartes
   - Versionamento por loja
   - QR Code com tracking
   - Compartilhamento social

5. **Analytics de Campanhas**
   - Taxa de abertura
   - Cliques e conversões
   - Comparativo A/B
   - Melhores horários

---

### 4.5 NOS Console — Administração da Plataforma

**Cor Temática:** `#EC4899` (Rosa/Magenta)  
**Rota Base:** `/console`

#### Funcionalidades Principais

1. **Gestão de Tenants**
   - Criação de novos clientes
   - Ativação/desativação de módulos
   - Configurações por tenant
   - Limites e quotas

2. **Gestão de Usuários**
   - Criação com roles (Admin, Operador, Leitura)
   - Tipos (Interno, Fornecedor, NOS Admin)
   - Reset de senha
   - Ativação/desativação

3. **Auditoria e Logs**
   - Registro de todas as ações
   - Filtros por período e tipo
   - Exportação de logs
   - Detecção de anomalias

4. **Health Check**
   - Status de serviços
   - Métricas de sistema
   - Alertas de segurança
   - Verificação de integridade

---

## 5. SISTEMA DE DESIGN AURORA 3

### 5.1 Filosofia de Design

O Aurora 3 representa uma evolução significativa em relação a interfaces tradicionais de software corporativo. Os princípios fundamentais são:

#### 1. Materialidade
Cada elemento possui "peso" visual perceptível. Cards não flutuam — eles têm presença física com sombras suaves e bordas definidas.

#### 2. Profundidade Controlada
Uso de camadas visuais para criar hierarquia:
- **Background:** `#0D0D12` (quase preto)
- **Camada 1:** `rgba(32, 30, 35, 0.9)` (cards principais)
- **Camada 2:** `rgba(37, 43, 59, 0.6)` (elementos secundários)
- **Camada 3:** `rgba(255, 255, 255, 0.05)` (destaques sutis)

#### 3. Cores Intencionais
Cada módulo possui uma cor temática que permeia toda sua interface:

| Módulo | Cor | HSL |
|--------|-----|-----|
| HiperIA | Violeta | `263 70% 55%` |
| HiperGestão | Púrpura | `271 81% 56%` |
| HiperTrade | Laranja | `25 95% 53%` |
| HiperOfertas | Teal | `173 80% 40%` |
| Console | Rosa | `330 81% 60%` |

#### 4. Micro-Interações
Animações sutis que comunicam estado e feedback:

```tsx
// Padrão de hover em cards
<motion.div
  whileHover={{ y: -2 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
```

#### 5. Tipografia Consistente
- **Títulos:** Semibold, tracking mais apertado
- **Corpo:** Regular, line-height generoso
- **Labels:** Uppercase, letter-spacing expandido
- **Números:** Tabular para alinhamento em tabelas

### 5.2 Componentes Customizados

#### SolidCard
Componente base para todos os cards da interface:

```tsx
// Variantes disponíveis
variant="default"    // Fundo semi-transparente
variant="subtle"     // Mais transparente ainda
variant="strong"     // Mais opaco, para destaque
```

#### GlowCard
Card com efeito de brilho na borda ao hover:

```tsx
<GlowCard 
  glowColor="rgba(139, 92, 246, 0.3)"
  className="p-6"
>
  {/* Conteúdo */}
</GlowCard>
```

#### Aurora3Background
Background animado com gradientes orgânicos:

```tsx
<Aurora3Background 
  withNoise 
  noiseOpacity={0.03}
  withVignette
  withSpotlight
>
  {/* Conteúdo da página */}
</Aurora3Background>
```

### 5.3 Tokens de Design (CSS Variables)

```css
:root {
  /* Cores Base */
  --background: 260 20% 5%;
  --foreground: 0 0% 98%;
  
  /* Superfícies */
  --card: 260 15% 10%;
  --card-foreground: 0 0% 98%;
  
  /* Cores Semânticas */
  --primary: 263 70% 55%;
  --secondary: 260 10% 20%;
  --accent: 263 70% 55%;
  
  /* Módulos */
  --module-ia: 263 70% 55%;
  --module-gestao: 271 81% 56%;
  --module-trade: 25 95% 53%;
  --module-ofertas: 173 80% 40%;
  
  /* Utilitários */
  --border: 260 10% 15%;
  --ring: 263 70% 55%;
}
```

---

## 6. MODELO DE NEGÓCIO E MULTI-TENANCY

### 6.1 Arquitetura Multi-Tenant

O HiperMarketing opera com **isolamento lógico por tenant**:

```sql
-- Todas as tabelas de dados possuem tenant_id
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  -- ...outros campos
);

-- RLS garante isolamento automático
CREATE POLICY "tenant_isolation" ON marketing_campaigns
  USING (tenant_id = (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
```

### 6.2 Hierarquia de Acesso

```
NOS Admin (Superusuário)
    │
    ├── Acesso ao Console administrativo
    ├── Gerencia todos os tenants
    ├── Não pertence a nenhum tenant específico
    │
    ▼
Tenant Admin
    │
    ├── Acesso total ao tenant
    ├── Gerencia usuários do tenant
    ├── Configura módulos e settings
    │
    ▼
Operador
    │
    ├── Acesso a módulos habilitados
    ├── CRUD em dados do tenant
    ├── Sem acesso a configurações
    │
    ▼
Leitura
    │
    ├── Visualização apenas
    ├── Exportação de relatórios
    └── Sem edição de dados
```

### 6.3 Modelo de Precificação (Sugerido)

| Plano | Módulos | Usuários | Preço/mês |
|-------|---------|----------|-----------|
| Starter | HiperGestão + HiperOfertas | 5 | R$ 1.990 |
| Professional | Todos exceto Trade | 15 | R$ 4.990 |
| Enterprise | Todos os módulos | Ilimitado | R$ 9.990+ |

---

## 7. SEGURANÇA E COMPLIANCE

### 7.1 Autenticação e Autorização

- **Supabase Auth** para autenticação
- **JWT tokens** com expiração configurável
- **RLS (Row Level Security)** em todas as tabelas
- **RBAC** (Role-Based Access Control) customizado

### 7.2 Políticas de Segurança

```sql
-- Exemplo de política RLS complexa
CREATE POLICY "users_can_view_own_tenant_data"
ON marketing_campaigns
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM tenant_users 
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);
```

### 7.3 Audit Trail

Todas as ações críticas são registradas:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,        -- 'user_created', 'campaign_approved', etc.
  resource_type TEXT NOT NULL, -- 'campaign', 'user', 'budget', etc.
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7.4 Proteção de Dados

- Dados isolados por tenant (nunca há vazamento entre clientes)
- Backups automáticos diários
- Criptografia em trânsito (TLS 1.3)
- Criptografia em repouso no banco de dados

---

## 8. ROADMAP E EVOLUÇÃO

### 8.1 Funcionalidades Planejadas

#### Q1 2026
- [ ] Integração com ERPs (TOTVS, Linx, SAP)
- [ ] App mobile para comprovações em campo
- [ ] Notificações push em tempo real

#### Q2 2026
- [ ] Módulo de BI avançado (dashboards customizáveis)
- [ ] Integração com Meta Ads e Google Ads
- [ ] API pública para integrações

#### Q3 2026
- [ ] Marketplace de templates
- [ ] Automações no-code (tipo Zapier)
- [ ] Módulo de fidelidade

#### Q4 2026
- [ ] Análise preditiva com ML
- [ ] Recomendações automáticas de ações
- [ ] Expansão internacional (Latam)

### 8.2 Métricas de Sucesso

| KPI | Meta |
|-----|------|
| NPS de Usuários | > 50 |
| Uptime | 99.9% |
| Tempo Médio de Resposta IA | < 3s |
| Taxa de Adoção de Módulos | > 70% |
| Churn Mensal | < 2% |

---

## 9. ESPECIFICAÇÕES TÉCNICAS DETALHADAS

### 9.1 Requisitos de Sistema

#### Cliente (Browser)
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript habilitado
- Resolução mínima: 1280x720
- Conexão: 5 Mbps recomendado

#### Servidor (Lovable Cloud)
- PostgreSQL 15
- Deno Runtime (Edge Functions)
- CDN global para assets
- Auto-scaling automático

### 9.2 Limites e Quotas

| Recurso | Limite por Tenant |
|---------|-------------------|
| Usuários | Conforme plano |
| Storage | 10 GB (Starter) a Ilimitado (Enterprise) |
| Conversas IA/mês | 500 (Starter) a Ilimitado |
| Campanhas ativas | 50 (Starter) a Ilimitado |
| Retenção de logs | 90 dias (Starter) a 2 anos |

### 9.3 SLA (Service Level Agreement)

| Nível | Uptime | Suporte | Tempo Resposta |
|-------|--------|---------|----------------|
| Starter | 99.5% | Email | 48h |
| Professional | 99.9% | Email + Chat | 24h |
| Enterprise | 99.95% | Dedicado | 4h |

---

## ANEXOS

### A. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| **Tenant** | Cliente/empresa que utiliza a plataforma |
| **Verba Cooperada** | Valor disponibilizado por fornecedor para ações de marketing |
| **Trade Marketing** | Estratégias de marketing focadas no ponto de venda |
| **ROI** | Return on Investment (Retorno sobre Investimento) |
| **CAC** | Custo de Aquisição de Cliente |
| **LTV** | Lifetime Value (Valor do tempo de vida do cliente) |
| **NPS** | Net Promoter Score (métrica de satisfação) |
| **PDV** | Ponto de Venda (loja física) |
| **RLS** | Row Level Security (segurança por linha no banco) |
| **Edge Function** | Função serverless executada próxima ao usuário |

### B. Contatos e Suporte

- **Documentação:** `/docs` na aplicação
- **Suporte Técnico:** Através do módulo HiperIA
- **Emergências:** Canal prioritário para Enterprise

---

**Documento elaborado pela equipe de Produto HiperMarketing**  
**Todos os direitos reservados © 2026**

---

*Este documento é confidencial e destinado apenas a uso interno e apresentações comerciais autorizadas.*
