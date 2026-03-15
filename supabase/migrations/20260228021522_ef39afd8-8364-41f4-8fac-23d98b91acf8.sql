
-- =============================================
-- HiperWorks: Channels, Messages, DMs, Reactions
-- =============================================

-- 1. Channels
CREATE TABLE public.hiperworks_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

ALTER TABLE public.hiperworks_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view channels"
  ON public.hiperworks_channels FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admin/gestor can create channels"
  ON public.hiperworks_channels FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admin/gestor can update channels"
  ON public.hiperworks_channels FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admin can delete channels"
  ON public.hiperworks_channels FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- 2. Channel Members
CREATE TABLE public.hiperworks_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.hiperworks_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE public.hiperworks_channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view channel members"
  ON public.hiperworks_channel_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_channels c
    WHERE c.id = channel_id AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  ));

CREATE POLICY "Users can join channels"
  ON public.hiperworks_channel_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave channels"
  ON public.hiperworks_channel_members FOR DELETE
  USING (user_id = auth.uid());

-- 3. Messages (for channels)
CREATE TABLE public.hiperworks_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.hiperworks_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.hiperworks_messages(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hiperworks_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view messages"
  ON public.hiperworks_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_channels c
    WHERE c.id = channel_id AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  ));

CREATE POLICY "Authenticated users can send messages"
  ON public.hiperworks_messages FOR INSERT
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.hiperworks_channels c
    WHERE c.id = channel_id AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  ));

CREATE POLICY "Users can edit own messages"
  ON public.hiperworks_messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON public.hiperworks_messages FOR DELETE
  USING (user_id = auth.uid());

-- 4. Reactions
CREATE TABLE public.hiperworks_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.hiperworks_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.hiperworks_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view reactions"
  ON public.hiperworks_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_messages m
    JOIN public.hiperworks_channels c ON c.id = m.channel_id
    WHERE m.id = message_id AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  ));

CREATE POLICY "Users can add reactions"
  ON public.hiperworks_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON public.hiperworks_reactions FOR DELETE
  USING (user_id = auth.uid());

-- 5. DM Conversations (create table without RLS policy first)
CREATE TABLE public.hiperworks_dm_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hiperworks_dm_conversations ENABLE ROW LEVEL SECURITY;

-- 6. DM Participants (must exist before dm_conversations RLS policy)
CREATE TABLE public.hiperworks_dm_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.hiperworks_dm_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.hiperworks_dm_participants ENABLE ROW LEVEL SECURITY;

-- Now add RLS policies for dm_conversations (participants table exists)
CREATE POLICY "Participants can view DM conversations"
  ON public.hiperworks_dm_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_dm_participants p
    WHERE p.conversation_id = id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create DM conversations"
  ON public.hiperworks_dm_conversations FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- RLS for dm_participants
CREATE POLICY "Participants can view participants"
  ON public.hiperworks_dm_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_dm_participants p2
    WHERE p2.conversation_id = conversation_id AND p2.user_id = auth.uid()
  ));

CREATE POLICY "Users can add participants"
  ON public.hiperworks_dm_participants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.hiperworks_dm_conversations c
    WHERE c.id = conversation_id AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  ));

-- 7. DM Messages
CREATE TABLE public.hiperworks_dm_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.hiperworks_dm_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hiperworks_dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view DM messages"
  ON public.hiperworks_dm_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_dm_participants p
    WHERE p.conversation_id = conversation_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Participants can send DM messages"
  ON public.hiperworks_dm_messages FOR INSERT
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.hiperworks_dm_participants p
    WHERE p.conversation_id = conversation_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can edit own DM messages"
  ON public.hiperworks_dm_messages FOR UPDATE
  USING (user_id = auth.uid());

-- 8. DM Reactions
CREATE TABLE public.hiperworks_dm_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.hiperworks_dm_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.hiperworks_dm_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view DM reactions"
  ON public.hiperworks_dm_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hiperworks_dm_messages m
    JOIN public.hiperworks_dm_participants p ON p.conversation_id = m.conversation_id
    WHERE m.id = message_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can add DM reactions"
  ON public.hiperworks_dm_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own DM reactions"
  ON public.hiperworks_dm_reactions FOR DELETE
  USING (user_id = auth.uid());

-- 9. Indexes
CREATE INDEX idx_hiperworks_messages_channel ON public.hiperworks_messages(channel_id, created_at DESC);
CREATE INDEX idx_hiperworks_messages_parent ON public.hiperworks_messages(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_hiperworks_reactions_message ON public.hiperworks_reactions(message_id);
CREATE INDEX idx_hiperworks_dm_messages_conv ON public.hiperworks_dm_messages(conversation_id, created_at DESC);
CREATE INDEX idx_hiperworks_dm_reactions_message ON public.hiperworks_dm_reactions(message_id);
CREATE INDEX idx_hiperworks_dm_participants_user ON public.hiperworks_dm_participants(user_id);
CREATE INDEX idx_hiperworks_channel_members_user ON public.hiperworks_channel_members(user_id);

-- 10. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.hiperworks_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hiperworks_dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hiperworks_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hiperworks_dm_reactions;

-- 11. Updated_at triggers
CREATE TRIGGER update_hiperworks_channels_updated_at
  BEFORE UPDATE ON public.hiperworks_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hiperworks_messages_updated_at
  BEFORE UPDATE ON public.hiperworks_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hiperworks_dm_conversations_updated_at
  BEFORE UPDATE ON public.hiperworks_dm_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hiperworks_dm_messages_updated_at
  BEFORE UPDATE ON public.hiperworks_dm_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
