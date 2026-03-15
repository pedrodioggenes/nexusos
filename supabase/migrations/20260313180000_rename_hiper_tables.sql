-- Migration: Rename hiperia_* tables to ia_* and hiperworks_* tables to nexusdesk_*
-- Generated: 2026-03-13

-- ============================================================
-- HIPERIA → IA
-- ============================================================
ALTER TABLE IF EXISTS public.hiperia_conversations          RENAME TO ia_conversations;
ALTER TABLE IF EXISTS public.hiperia_user_preferences       RENAME TO ia_user_preferences;
ALTER TABLE IF EXISTS public.hiperia_message_feedback       RENAME TO ia_message_feedback;
ALTER TABLE IF EXISTS public.hiperia_shared_conversations   RENAME TO ia_shared_conversations;
ALTER TABLE IF EXISTS public.hiperia_scheduled_queries      RENAME TO ia_scheduled_queries;
ALTER TABLE IF EXISTS public.hiperia_uploaded_files         RENAME TO ia_uploaded_files;

-- ============================================================
-- HIPERWORKS → NEXUSDESK
-- ============================================================
ALTER TABLE IF EXISTS public.hiperworks_channels            RENAME TO nexusdesk_channels;
ALTER TABLE IF EXISTS public.hiperworks_messages            RENAME TO nexusdesk_messages;
ALTER TABLE IF EXISTS public.hiperworks_channel_members     RENAME TO nexusdesk_channel_members;
ALTER TABLE IF EXISTS public.hiperworks_reactions           RENAME TO nexusdesk_reactions;
ALTER TABLE IF EXISTS public.hiperworks_channel_governance  RENAME TO nexusdesk_channel_governance;
ALTER TABLE IF EXISTS public.hiperworks_dm_conversations    RENAME TO nexusdesk_dm_conversations;
ALTER TABLE IF EXISTS public.hiperworks_dm_messages         RENAME TO nexusdesk_dm_messages;
ALTER TABLE IF EXISTS public.hiperworks_dm_participants     RENAME TO nexusdesk_dm_participants;
ALTER TABLE IF EXISTS public.hiperworks_last_read           RENAME TO nexusdesk_last_read;
ALTER TABLE IF EXISTS public.hiperworks_dm_reactions        RENAME TO nexusdesk_dm_reactions;
ALTER TABLE IF EXISTS public.hiperworks_saved_messages      RENAME TO nexusdesk_saved_messages;
ALTER TABLE IF EXISTS public.hiperworks_mentions            RENAME TO nexusdesk_mentions;
