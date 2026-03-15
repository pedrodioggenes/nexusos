-- Adicionar tipo 'video' ao check constraint de team_tasks
ALTER TABLE public.team_tasks DROP CONSTRAINT IF EXISTS team_tasks_task_type_check;

ALTER TABLE public.team_tasks ADD CONSTRAINT team_tasks_task_type_check 
CHECK (task_type IN ('social', 'traffic', 'design', 'copy', 'video'));