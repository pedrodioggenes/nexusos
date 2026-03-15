-- Drop recursive policies
DROP POLICY IF EXISTS "Users can view own calls" ON public.hw_calls;
DROP POLICY IF EXISTS "Participants can update calls" ON public.hw_calls;
DROP POLICY IF EXISTS "Users can view own participations" ON public.hw_call_participants;
DROP POLICY IF EXISTS "Call initiator can add participants" ON public.hw_call_participants;
DROP POLICY IF EXISTS "Participants can update own status" ON public.hw_call_participants;
DROP POLICY IF EXISTS "Users can create calls" ON public.hw_calls;

-- Helper function to check call participation without RLS recursion
CREATE OR REPLACE FUNCTION public.is_call_participant(_call_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hw_call_participants
    WHERE call_id = _call_id AND user_id = _user_id
  );
$$;

-- Helper function to check call initiator
CREATE OR REPLACE FUNCTION public.is_call_initiator(_call_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hw_calls
    WHERE id = _call_id AND initiated_by = _user_id
  );
$$;

-- hw_calls policies (no recursion)
CREATE POLICY "Users can view own calls"
ON public.hw_calls FOR SELECT TO authenticated
USING (
  initiated_by = auth.uid()
  OR public.is_call_participant(id, auth.uid())
);

CREATE POLICY "Users can create calls"
ON public.hw_calls FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND initiated_by = auth.uid()
);

CREATE POLICY "Participants can update calls"
ON public.hw_calls FOR UPDATE TO authenticated
USING (public.is_call_participant(id, auth.uid()));

-- hw_call_participants policies (no recursion)
CREATE POLICY "Users can view call participants"
ON public.hw_call_participants FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_call_initiator(call_id, auth.uid())
);

CREATE POLICY "Call initiator can add participants"
ON public.hw_call_participants FOR INSERT TO authenticated
WITH CHECK (
  public.is_call_initiator(call_id, auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Participants can update own status"
ON public.hw_call_participants FOR UPDATE TO authenticated
USING (user_id = auth.uid());