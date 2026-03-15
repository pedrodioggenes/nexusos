-- Passo 1/2: adiciona 'nos_admin' ao enum public.user_type
-- (O UPDATE dos registros está na migration 20260313201000,
--  pois ALTER TYPE ADD VALUE não deixa o valor visível na mesma transação.)
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'nos_admin';
