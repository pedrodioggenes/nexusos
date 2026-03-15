-- Migration: sanitize_module_ids
-- Date: 2026-03-13
-- Description: Atualiza os IDs de módulo legados (prefixo "hiper*") para os novos IDs curtos
--              nas colunas modules_enabled (tabela tenants) e modules_allowed (tabela user_roles).
--
-- Mapeamento:
--   hiperia        → ia
--   hipergestao    → marketing
--   hipertrade     → trade
--   hiperrh        → rh
--   hipercd        → cd
--   hipercliente   → cliente
--   hiperofertas   → ofertas
--   hiperpmo       → pmo
--   hiperacademy   → academy
--   hiperreposicao → reposicao
--   hipercompras   → compras
--   hipersorteios  → sorteios
--   hiperdominio   → dominio
--   hiperfinanceiro → financeiro
--   hiperloja      → loja

-- ============================================================
-- Tabela: tenants — coluna: modules_enabled (text[])
-- ============================================================

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperia', 'ia')
WHERE 'hiperia' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipergestao', 'marketing')
WHERE 'hipergestao' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipertrade', 'trade')
WHERE 'hipertrade' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperrh', 'rh')
WHERE 'hiperrh' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipercd', 'cd')
WHERE 'hipercd' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipercliente', 'cliente')
WHERE 'hipercliente' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperofertas', 'ofertas')
WHERE 'hiperofertas' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperpmo', 'pmo')
WHERE 'hiperpmo' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperacademy', 'academy')
WHERE 'hiperacademy' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperreposicao', 'reposicao')
WHERE 'hiperreposicao' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipercompras', 'compras')
WHERE 'hipercompras' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hipersorteios', 'sorteios')
WHERE 'hipersorteios' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperdominio', 'dominio')
WHERE 'hiperdominio' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperfinanceiro', 'financeiro')
WHERE 'hiperfinanceiro' = ANY(modules_enabled);

UPDATE tenants
SET modules_enabled = array_replace(modules_enabled, 'hiperloja', 'loja')
WHERE 'hiperloja' = ANY(modules_enabled);

-- ============================================================
-- Tabela: user_roles — coluna: modules_allowed (text[])
-- ============================================================

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperia', 'ia')
WHERE 'hiperia' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipergestao', 'marketing')
WHERE 'hipergestao' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipertrade', 'trade')
WHERE 'hipertrade' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperrh', 'rh')
WHERE 'hiperrh' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipercd', 'cd')
WHERE 'hipercd' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipercliente', 'cliente')
WHERE 'hipercliente' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperofertas', 'ofertas')
WHERE 'hiperofertas' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperpmo', 'pmo')
WHERE 'hiperpmo' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperacademy', 'academy')
WHERE 'hiperacademy' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperreposicao', 'reposicao')
WHERE 'hiperreposicao' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipercompras', 'compras')
WHERE 'hipercompras' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hipersorteios', 'sorteios')
WHERE 'hipersorteios' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperdominio', 'dominio')
WHERE 'hiperdominio' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperfinanceiro', 'financeiro')
WHERE 'hiperfinanceiro' = ANY(modules_allowed);

UPDATE user_roles
SET modules_allowed = array_replace(modules_allowed, 'hiperloja', 'loja')
WHERE 'hiperloja' = ANY(modules_allowed);
