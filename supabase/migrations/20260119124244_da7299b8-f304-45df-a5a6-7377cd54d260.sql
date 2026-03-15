-- Tabela de preferências do usuário (memória persistente)
CREATE TABLE public.hiperia_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  preferred_tone TEXT DEFAULT 'formal',
  preferred_language TEXT DEFAULT 'pt-BR',
  favorite_topics JSONB DEFAULT '[]',
  custom_instructions TEXT,
  context_memory JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hiperia_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" 
ON public.hiperia_user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.hiperia_user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.hiperia_user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela de feedback de mensagens
CREATE TABLE public.hiperia_message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.hiperia_conversations(id) ON DELETE CASCADE,
  message_index INTEGER NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
  feedback_text TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hiperia_message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" 
ON public.hiperia_message_feedback FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" 
ON public.hiperia_message_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.hiperia_message_feedback FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" 
ON public.hiperia_message_feedback FOR DELETE 
USING (auth.uid() = user_id);

-- Tabela de conversas compartilhadas
CREATE TABLE public.hiperia_shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.hiperia_conversations(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hiperia_shared_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active shared conversations" 
ON public.hiperia_shared_conversations FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can insert their own shared conversations" 
ON public.hiperia_shared_conversations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shared conversations" 
ON public.hiperia_shared_conversations FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shared conversations" 
ON public.hiperia_shared_conversations FOR DELETE 
USING (auth.uid() = created_by);

-- Tabela de consultas agendadas
CREATE TABLE public.hiperia_scheduled_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'once')),
  schedule_time TIME,
  schedule_day INTEGER,
  next_run TIMESTAMPTZ,
  last_run TIMESTAMPTZ,
  notification_channel TEXT DEFAULT 'email',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hiperia_scheduled_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled queries" 
ON public.hiperia_scheduled_queries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled queries" 
ON public.hiperia_scheduled_queries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled queries" 
ON public.hiperia_scheduled_queries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled queries" 
ON public.hiperia_scheduled_queries FOR DELETE 
USING (auth.uid() = user_id);

-- Tabela de arquivos uploadados
CREATE TABLE public.hiperia_uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.hiperia_conversations(id) ON DELETE CASCADE,
  message_index INTEGER,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hiperia_uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" 
ON public.hiperia_uploaded_files FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" 
ON public.hiperia_uploaded_files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.hiperia_uploaded_files FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para updated_at em hiperia_user_preferences
CREATE TRIGGER update_hiperia_user_preferences_updated_at
BEFORE UPDATE ON public.hiperia_user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();