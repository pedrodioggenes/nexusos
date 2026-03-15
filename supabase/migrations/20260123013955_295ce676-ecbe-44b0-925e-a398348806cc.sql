-- Drop existing INSERT policy that requires tenant_id match
DROP POLICY IF EXISTS "Users can manage pages in their tenant" ON public.workspace_pages;

-- Create separate policies for better control
-- Policy for SELECT - users can view their tenant's pages or pages they created
CREATE POLICY "Users can view workspace pages"
  ON public.workspace_pages
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR tenant_id = public.get_user_tenant_id(auth.uid())
    OR tenant_id IS NULL
  );

-- Policy for INSERT - users can create pages, tenant_id will be set automatically
CREATE POLICY "Users can create workspace pages"
  ON public.workspace_pages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- Policy for UPDATE - users can update their own pages or pages in their tenant
CREATE POLICY "Users can update workspace pages"
  ON public.workspace_pages
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Policy for DELETE - users can delete their own pages or pages in their tenant  
CREATE POLICY "Users can delete workspace pages"
  ON public.workspace_pages
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Drop the old SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view pages in their tenant" ON public.workspace_pages;