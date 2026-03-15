
-- Call history table
CREATE TABLE public.hw_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
  is_group BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined', 'failed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Call participants
CREATE TABLE public.hw_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.hw_calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'caller' CHECK (role IN ('caller', 'callee')),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'ringing', 'joined', 'left', 'declined', 'missed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hw_calls_tenant ON public.hw_calls(tenant_id);
CREATE INDEX idx_hw_calls_initiated_by ON public.hw_calls(initiated_by);
CREATE INDEX idx_hw_calls_status ON public.hw_calls(status);
CREATE INDEX idx_hw_call_participants_call ON public.hw_call_participants(call_id);
CREATE INDEX idx_hw_call_participants_user ON public.hw_call_participants(user_id);

-- Enable RLS
ALTER TABLE public.hw_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_call_participants ENABLE ROW LEVEL SECURITY;

-- RLS: users can see calls they participate in
CREATE POLICY "Users can view own calls"
  ON public.hw_calls FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hw_call_participants p
      WHERE p.call_id = hw_calls.id AND p.user_id = auth.uid()
    )
  );

-- RLS: authenticated users in same tenant can create calls
CREATE POLICY "Users can create calls"
  ON public.hw_calls FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND initiated_by = auth.uid()
  );

-- RLS: participants can update call status
CREATE POLICY "Participants can update calls"
  ON public.hw_calls FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hw_call_participants p
      WHERE p.call_id = hw_calls.id AND p.user_id = auth.uid()
    )
  );

-- Participants RLS
CREATE POLICY "Users can view own participations"
  ON public.hw_call_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.hw_call_participants p2
    WHERE p2.call_id = hw_call_participants.call_id AND p2.user_id = auth.uid()
  ));

CREATE POLICY "Call initiator can add participants"
  ON public.hw_call_participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hw_calls c
      WHERE c.id = hw_call_participants.call_id AND c.initiated_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Participants can update own status"
  ON public.hw_call_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Enable realtime for signaling awareness
ALTER PUBLICATION supabase_realtime ADD TABLE public.hw_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hw_call_participants;
