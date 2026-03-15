-- =====================================================
-- FASE 1: Bucket para arquivos do workspace
-- =====================================================

-- Criar bucket para arquivos do workspace (10MB max)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('workspace-files', 'workspace-files', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Política: usuários autenticados podem fazer upload
CREATE POLICY "Users can upload workspace files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workspace-files');

-- Política: leitura pública para exibir imagens
CREATE POLICY "Public read access for workspace files"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-files');

-- Política: usuários podem deletar seus próprios arquivos (organizados por user_id)
CREATE POLICY "Users can delete own workspace files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'workspace-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- FASE 2: Busca full-text nos documentos
-- =====================================================

-- Função de busca otimizada com extração de texto do JSONB
CREATE OR REPLACE FUNCTION public.search_workspace_pages(
  search_query TEXT,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  icon TEXT,
  content_preview TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tsquery_val TSQUERY;
BEGIN
  -- Criar tsquery a partir da busca
  tsquery_val := plainto_tsquery('portuguese', search_query);
  
  RETURN QUERY
  SELECT 
    wp.id,
    wp.title,
    wp.icon,
    LEFT(wp.content::text, 300) as content_preview,
    ts_rank(
      setweight(to_tsvector('portuguese', COALESCE(wp.title, '')), 'A') ||
      setweight(to_tsvector('portuguese', COALESCE(wp.content::text, '')), 'B'),
      tsquery_val
    ) as rank
  FROM public.workspace_pages wp
  WHERE (
    setweight(to_tsvector('portuguese', COALESCE(wp.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(wp.content::text, '')), 'B')
  ) @@ tsquery_val
    AND (p_tenant_id IS NULL OR wp.tenant_id = p_tenant_id)
  ORDER BY rank DESC
  LIMIT 20;
END;
$$;

-- =====================================================
-- FASE 3: Suporte a templates
-- =====================================================

-- Adicionar coluna is_template para marcar páginas como templates
ALTER TABLE public.workspace_pages 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- Adicionar coluna template_category para categorizar templates
ALTER TABLE public.workspace_pages 
ADD COLUMN IF NOT EXISTS template_category TEXT;

-- =====================================================
-- FASE 4: Vincular tarefas aos documentos
-- =====================================================

-- Adicionar coluna source_page_id na tabela team_tasks (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'team_tasks' 
    AND column_name = 'source_page_id'
  ) THEN
    ALTER TABLE public.team_tasks 
    ADD COLUMN source_page_id UUID REFERENCES public.workspace_pages(id) ON DELETE SET NULL;
  END IF;
END $$;