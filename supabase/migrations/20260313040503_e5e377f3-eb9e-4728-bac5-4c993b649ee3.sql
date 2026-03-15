CREATE OR REPLACE FUNCTION export_schema_ddl()
  RETURNS json AS $$
  DECLARE
    result json;
  BEGIN
    SELECT json_build_object(
      'tables', (
        SELECT json_agg(json_build_object(
          'table_name', t.table_name,
          'columns', (
            SELECT json_agg(json_build_object(
              'column_name', c.column_name,
              'data_type', c.data_type,
              'udt_name', c.udt_name,
              'column_default', c.column_default,
              'is_nullable', c.is_nullable,
              'character_maximum_length', c.character_maximum_length
            ) ORDER BY c.ordinal_position)
            FROM information_schema.columns c
            WHERE c.table_schema = 'public' AND c.table_name = t.table_name
          ),
          'primary_keys', (
            SELECT json_agg(kcu.column_name)
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public'
              AND tc.table_name = t.table_name
              AND tc.constraint_type = 'PRIMARY KEY'
          ),
          'foreign_keys', (
            SELECT json_agg(json_build_object(
              'column_name', kcu.column_name,
              'foreign_table', ccu.table_name,
              'foreign_column', ccu.column_name,
              'constraint_name', tc.constraint_name
            ))
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
              ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_schema = 'public'
              AND tc.table_name = t.table_name
              AND tc.constraint_type = 'FOREIGN KEY'
          ),
          'indexes', (
            SELECT json_agg(json_build_object(
              'index_name', i.relname,
              'index_def', pg_get_indexdef(ix.indexrelid)
            ))
            FROM pg_index ix
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_class t2 ON t2.oid = ix.indrelid
            JOIN pg_namespace n ON n.oid = t2.relnamespace
            WHERE n.nspname = 'public' AND t2.relname = t.table_name
              AND NOT ix.indisprimary
          ),
          'rls_enabled', (
            SELECT relrowsecurity FROM pg_class
            JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
            WHERE pg_namespace.nspname = 'public' AND pg_class.relname = t.table_name
          ),
          'rls_policies', (
            SELECT json_agg(json_build_object(
              'policy_name', p.policyname,
              'command', p.cmd,
              'roles', p.roles,
              'qual', pg_get_expr(p.qual, p.polrelid),
              'with_check', pg_get_expr(p.with_check, p.polrelid)
            ))
            FROM pg_policy p
            JOIN pg_class c ON c.oid = p.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = t.table_name
          )
        ))
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      ),
      'functions', (
        SELECT json_agg(json_build_object(
          'function_name', p.proname,
          'definition', pg_get_functiondef(p.oid),
          'language', l.lanname
        ))
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        WHERE n.nspname = 'public'
          AND p.prokind = 'f'
      )
    ) INTO result;

    RETURN result;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;