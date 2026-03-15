-- =============================================
-- HYPERWORKS: Workspace Colaborativo
-- =============================================

-- Canais de comunicação
CREATE TABLE public.hyperworks_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Membros de canais (para canais privados)
CREATE TABLE public.hyperworks_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.hyperworks_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- admin, member
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Mensagens
CREATE TABLE public.hyperworks_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.hyperworks_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  thread_parent_id UUID REFERENCES public.hyperworks_messages(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reações às mensagens
CREATE TABLE public.hyperworks_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.hyperworks_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Mensagens Diretas
CREATE TABLE public.hyperworks_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Status do usuário
CREATE TABLE public.hyperworks_user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  status_text TEXT,
  status_emoji TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menções em mensagens
CREATE TABLE public.hyperworks_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.hyperworks_messages(id) ON DELETE CASCADE NOT NULL,
  mentioned_user_id UUID NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, mentioned_user_id)
);

-- Mensagens salvas (bookmarks)
CREATE TABLE public.hyperworks_saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID REFERENCES public.hyperworks_messages(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Últimos canais/DMs acessados (para ordenação recente)
CREATE TABLE public.hyperworks_last_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES public.hyperworks_channels(id) ON DELETE CASCADE,
  dm_user_id UUID,
  last_message_id UUID REFERENCES public.hyperworks_messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id),
  UNIQUE(user_id, dm_user_id)
);

-- Índices para performance
CREATE INDEX idx_hyperworks_messages_channel ON public.hyperworks_messages(channel_id, created_at DESC);
CREATE INDEX idx_hyperworks_messages_thread ON public.hyperworks_messages(thread_parent_id) WHERE thread_parent_id IS NOT NULL;
CREATE INDEX idx_hyperworks_reactions_message ON public.hyperworks_reactions(message_id);
CREATE INDEX idx_hyperworks_dm_participants ON public.hyperworks_direct_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_hyperworks_mentions_user ON public.hyperworks_mentions(mentioned_user_id, read_at);

-- Triggers para updated_at
CREATE TRIGGER update_hyperworks_channels_updated_at
  BEFORE UPDATE ON public.hyperworks_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hyperworks_messages_updated_at
  BEFORE UPDATE ON public.hyperworks_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hyperworks_user_status_updated_at
  BEFORE UPDATE ON public.hyperworks_user_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.hyperworks_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyperworks_last_read ENABLE ROW LEVEL SECURITY;

-- RLS Policies para Canais
CREATE POLICY "Usuários podem ver canais públicos do seu tenant"
  ON public.hyperworks_channels FOR SELECT
  USING (
    NOT is_private 
    AND tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Usuários podem ver canais privados se forem membros"
  ON public.hyperworks_channels FOR SELECT
  USING (
    is_private 
    AND EXISTS (
      SELECT 1 FROM public.hyperworks_channel_members 
      WHERE channel_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem criar canais"
  ON public.hyperworks_channels FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'operador')
  );

-- RLS para Membros de Canal
CREATE POLICY "Usuários podem ver membros de canais que participam"
  ON public.hyperworks_channel_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hyperworks_channels c
      WHERE c.id = channel_id 
      AND (NOT c.is_private OR EXISTS (
        SELECT 1 FROM public.hyperworks_channel_members cm 
        WHERE cm.channel_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  );

-- RLS para Mensagens
CREATE POLICY "Usuários podem ver mensagens de canais que têm acesso"
  ON public.hyperworks_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hyperworks_channels c
      WHERE c.id = channel_id 
      AND c.tenant_id = public.get_user_tenant_id(auth.uid())
      AND (NOT c.is_private OR EXISTS (
        SELECT 1 FROM public.hyperworks_channel_members cm 
        WHERE cm.channel_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Usuários autenticados podem enviar mensagens"
  ON public.hyperworks_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.hyperworks_channels c
      WHERE c.id = channel_id 
      AND c.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

CREATE POLICY "Usuários podem editar suas próprias mensagens"
  ON public.hyperworks_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias mensagens"
  ON public.hyperworks_messages FOR DELETE
  USING (auth.uid() = user_id);

-- RLS para Reações
CREATE POLICY "Usuários podem ver todas as reações de mensagens visíveis"
  ON public.hyperworks_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hyperworks_messages m
      JOIN public.hyperworks_channels c ON c.id = m.channel_id
      WHERE m.id = message_id 
      AND c.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

CREATE POLICY "Usuários podem adicionar reações"
  ON public.hyperworks_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas reações"
  ON public.hyperworks_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS para DMs
CREATE POLICY "Usuários podem ver suas próprias DMs"
  ON public.hyperworks_direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem enviar DMs"
  ON public.hyperworks_direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Usuários podem marcar DMs como lidas"
  ON public.hyperworks_direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- RLS para Status
CREATE POLICY "Usuários podem ver status do mesmo tenant"
  ON public.hyperworks_user_status FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Usuários podem atualizar seu próprio status"
  ON public.hyperworks_user_status FOR ALL
  USING (auth.uid() = user_id);

-- RLS para Menções
CREATE POLICY "Usuários podem ver suas menções"
  ON public.hyperworks_mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Sistema pode criar menções"
  ON public.hyperworks_mentions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem marcar menções como lidas"
  ON public.hyperworks_mentions FOR UPDATE
  USING (auth.uid() = mentioned_user_id);

-- RLS para Mensagens Salvas
CREATE POLICY "Usuários podem gerenciar suas mensagens salvas"
  ON public.hyperworks_saved_messages FOR ALL
  USING (auth.uid() = user_id);

-- RLS para Last Read
CREATE POLICY "Usuários podem gerenciar seu histórico de leitura"
  ON public.hyperworks_last_read FOR ALL
  USING (auth.uid() = user_id);

-- Habilitar Realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.hyperworks_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hyperworks_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hyperworks_direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hyperworks_user_status;