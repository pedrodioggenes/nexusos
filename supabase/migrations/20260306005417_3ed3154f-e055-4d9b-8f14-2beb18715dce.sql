
-- The due_date column was already added by the previous migration attempt.
-- Now insert scheduled job with correct columns.
INSERT INTO public.scheduled_jobs (
  job_type, job_name,
  job_config, schedule_type, cron_expression,
  is_active, status, next_run_at
) VALUES (
  'edge_function',
  'HW Training Reminders',
  '{"function_name": "hw-training-reminders", "description": "Envia lembretes para treinamentos com prazo em 3 dias"}'::JSONB,
  'cron',
  '0 7 * * *',
  true,
  'pending',
  now() + interval '1 day'
) ON CONFLICT DO NOTHING;
