-- Migration: rename pages_allowed keys in user_roles
-- The pages_allowed JSONB column has keys that were module IDs (e.g. "hipercd", "hipergestao")
-- Rename them to the new generic IDs

UPDATE user_roles
SET pages_allowed = (
  pages_allowed
  - 'hipergestao' - 'hipertrade' - 'hiperrh' - 'hipercd' - 'hipercliente'
  - 'hiperofertas' - 'hiperpmo' - 'hiperacademy' - 'hiperreposicao' - 'hipercompras'
  - 'hipersorteios' - 'hiperdominio' - 'hiperfinanceiro' - 'hiperloja' - 'hiperia'
  || COALESCE(jsonb_build_object('marketing',    pages_allowed->'hipergestao'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('trade',        pages_allowed->'hipertrade'),      '{}'::jsonb)
  || COALESCE(jsonb_build_object('rh',           pages_allowed->'hiperrh'),         '{}'::jsonb)
  || COALESCE(jsonb_build_object('cd',           pages_allowed->'hipercd'),         '{}'::jsonb)
  || COALESCE(jsonb_build_object('cliente',      pages_allowed->'hipercliente'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('ofertas',      pages_allowed->'hiperofertas'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('pmo',          pages_allowed->'hiperpmo'),        '{}'::jsonb)
  || COALESCE(jsonb_build_object('academy',      pages_allowed->'hiperacademy'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('reposicao',    pages_allowed->'hiperreposicao'),  '{}'::jsonb)
  || COALESCE(jsonb_build_object('compras',      pages_allowed->'hipercompras'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('sorteios',     pages_allowed->'hipersorteios'),   '{}'::jsonb)
  || COALESCE(jsonb_build_object('dominio',      pages_allowed->'hiperdominio'),    '{}'::jsonb)
  || COALESCE(jsonb_build_object('financeiro',   pages_allowed->'hiperfinanceiro'), '{}'::jsonb)
  || COALESCE(jsonb_build_object('loja',         pages_allowed->'hiperloja'),       '{}'::jsonb)
  || COALESCE(jsonb_build_object('ia',           pages_allowed->'hiperia'),         '{}'::jsonb)
)
WHERE pages_allowed IS NOT NULL
  AND pages_allowed != '{}'::jsonb
  AND (
    pages_allowed ? 'hipergestao' OR pages_allowed ? 'hipertrade' OR
    pages_allowed ? 'hiperrh' OR pages_allowed ? 'hipercd' OR
    pages_allowed ? 'hipercliente' OR pages_allowed ? 'hiperofertas' OR
    pages_allowed ? 'hiperpmo' OR pages_allowed ? 'hiperacademy' OR
    pages_allowed ? 'hiperreposicao' OR pages_allowed ? 'hipercompras' OR
    pages_allowed ? 'hipersorteios' OR pages_allowed ? 'hiperdominio' OR
    pages_allowed ? 'hiperfinanceiro' OR pages_allowed ? 'hiperloja' OR
    pages_allowed ? 'hiperia'
  );
