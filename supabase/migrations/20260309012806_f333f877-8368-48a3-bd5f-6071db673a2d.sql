
-- 1. Create atomic RPC to create DM conversation + participants in one go
CREATE OR REPLACE FUNCTION public.create_dm_conversation(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_conv_id UUID;
  v_existing UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_tenant_id := public.get_user_tenant_id(v_user_id);
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found';
  END IF;

  -- Check if conversation already exists between these two users
  SELECT p1.conversation_id INTO v_existing
  FROM public.hiperworks_dm_participants p1
  JOIN public.hiperworks_dm_participants p2 ON p1.conversation_id = p2.conversation_id
  WHERE p1.user_id = v_user_id AND p2.user_id = p_other_user_id
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Create conversation
  INSERT INTO public.hiperworks_dm_conversations (tenant_id)
  VALUES (v_tenant_id)
  RETURNING id INTO v_conv_id;

  -- Add both participants
  INSERT INTO public.hiperworks_dm_participants (conversation_id, user_id)
  VALUES (v_conv_id, v_user_id), (v_conv_id, p_other_user_id);

  RETURN v_conv_id;
END;
$$;

-- 2. Drop duplicate reaction policies (old ones that use public role instead of authenticated)
DROP POLICY IF EXISTS "Participants can view DM reactions" ON public.hiperworks_dm_reactions;
DROP POLICY IF EXISTS "Users can add DM reactions" ON public.hiperworks_dm_reactions;
DROP POLICY IF EXISTS "Users can remove own DM reactions" ON public.hiperworks_dm_reactions;
