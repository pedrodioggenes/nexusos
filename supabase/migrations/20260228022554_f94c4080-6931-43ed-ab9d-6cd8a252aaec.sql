
-- ===========================================
-- Phase 1: Consolidate legacy hyperworks_* tables
-- All legacy tables are empty, safe to drop and recreate
-- ===========================================

-- 1. Drop duplicate legacy tables (data lives in hiperworks_*)
DROP TABLE IF EXISTS hyperworks_reactions CASCADE;
DROP TABLE IF EXISTS hyperworks_mentions CASCADE;
DROP TABLE IF EXISTS hyperworks_saved_messages CASCADE;
DROP TABLE IF EXISTS hyperworks_last_read CASCADE;
DROP TABLE IF EXISTS hyperworks_direct_messages CASCADE;
DROP TABLE IF EXISTS hyperworks_channel_members CASCADE;
DROP TABLE IF EXISTS hyperworks_channel_governance CASCADE;
DROP TABLE IF EXISTS hyperworks_messages CASCADE;
DROP TABLE IF EXISTS hyperworks_channels CASCADE;
DROP TABLE IF EXISTS hyperworks_user_status CASCADE;
-- Keep hyperworks_entity_links (cross-module, will update FK)

-- 2. Create hiperworks_channel_governance pointing to new channels table
CREATE TABLE IF NOT EXISTS public.hiperworks_channel_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.hiperworks_channels(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  allowed_types TEXT[] DEFAULT ARRAY['normal','comunicado','pedido','comprovação'],
  suggested_template TEXT,
  auto_suggest_comprovacao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, tenant_id)
);

ALTER TABLE public.hiperworks_channel_governance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view governance"
  ON public.hiperworks_channel_governance FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage governance"
  ON public.hiperworks_channel_governance FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- 3. Create hiperworks_saved_messages for bookmarks (Phase 2 ready)
CREATE TABLE IF NOT EXISTS public.hiperworks_saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.hiperworks_messages(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.hiperworks_saved_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved messages"
  ON public.hiperworks_saved_messages FOR ALL
  USING (user_id = auth.uid());

-- 4. Create hiperworks_mentions for @mentions (Phase 3 ready)
CREATE TABLE IF NOT EXISTS public.hiperworks_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.hiperworks_messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hiperworks_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view mentions"
  ON public.hiperworks_mentions FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant members can create mentions"
  ON public.hiperworks_mentions FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 5. Create hiperworks_last_read for unread counts (Phase 4 ready)
CREATE TABLE IF NOT EXISTS public.hiperworks_last_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES public.hiperworks_channels(id) ON DELETE CASCADE,
  dm_conversation_id UUID REFERENCES public.hiperworks_dm_conversations(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_id UUID,
  UNIQUE(user_id, channel_id),
  UNIQUE(user_id, dm_conversation_id)
);

ALTER TABLE public.hiperworks_last_read ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own last_read"
  ON public.hiperworks_last_read FOR ALL
  USING (user_id = auth.uid());

-- 6. Update entity_links FK: drop old FK to hyperworks_channels, keep table as-is
-- (hyperworks_entity_links has no enforced FKs based on query, so no action needed)

-- 7. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.hiperworks_saved_messages;
