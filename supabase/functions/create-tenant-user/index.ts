import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  fullName: string;
  tenantId: string;
  userType: 'internal' | 'supplier';
  role?: 'admin' | 'operador' | 'leitura';
  departmentRole?: string;
  hierarchyLevel?: string;
  department?: string;
  supplierId?: string;
  password?: string;
  modulesAllowed?: string[] | null;
  pagesAllowed?: Record<string, string[] | null> | null;
}

/**
 * Normalize a potential array of strings
 */
function normalizeStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const arr = v
    .filter((x) => typeof x === 'string')
    .map((s) => (s as string).trim())
    .filter(Boolean);
  // Return [] if empty array was provided, null if nothing provided
  return arr.length ? Array.from(new Set(arr)) : [];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is a nos_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error('Invalid authorization token');
    }

    // Check if requesting user is nos_admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('user_type')
      .eq('user_id', requestingUser.id)
      .single();

    if (roleError || userRole?.user_type !== 'nos_admin') {
      throw new Error('Unauthorized: Only NOS Console admins can create users');
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, fullName, tenantId, userType, role, departmentRole, hierarchyLevel, department, supplierId, password, pagesAllowed } = body;
    const modulesAllowed = normalizeStringArray(body.modulesAllowed);

    // Validate required fields
    if (!email || !fullName || !tenantId || !userType) {
      throw new Error('Missing required fields: email, fullName, tenantId, userType');
    }

    if (userType === 'internal' && !role) {
      throw new Error('Role is required for internal users');
    }

    if (userType === 'supplier' && !supplierId) {
      throw new Error('Supplier ID is required for supplier users');
    }

    // Generate a temporary password if not provided
    const userPassword = password || Math.random().toString(36).slice(-12) + 'A1!';

    console.log(`Creating ${userType} user: ${email} for tenant: ${tenantId}`);

    // Create user in auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    const userId = newUser.user.id;
    console.log(`Auth user created with ID: ${userId}`);

    // Handle profile - trigger may have already created it
    // Use select-then-update/insert to avoid race condition with trigger
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists (trigger created it), update with correct data
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ email, full_name: fullName })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
      console.log('Profile updated');
    } else {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ user_id: userId, email, full_name: fullName });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
      console.log('Profile created');
    }

    // Delete any existing user_role created by trigger, then insert correct one
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        user_type: userType,
        role: userType === 'internal' ? role : 'leitura',
        tenant_id: tenantId,
        department_role: userType === 'internal' && departmentRole ? departmentRole : null,
        hierarchy_level: userType === 'internal' && hierarchyLevel ? hierarchyLevel : 'colaborador',
        department: userType === 'internal' && department ? department : null,
        modules_allowed: modulesAllowed,
        pages_allowed: pagesAllowed ?? null,
      });

    if (roleInsertError) {
      console.error('Error creating user_role:', roleInsertError);
      await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create user role: ${roleInsertError.message}`);
    }

    console.log('User role created');

    // If supplier, create user_supplier link
    if (userType === 'supplier' && supplierId) {
      const { error: supplierLinkError } = await supabaseAdmin
        .from('user_suppliers')
        .insert({
          user_id: userId,
          supplier_id: supplierId,
        });

      if (supplierLinkError) {
        console.error('Error linking supplier:', supplierLinkError);
        // Cleanup
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(`Failed to link supplier: ${supplierLinkError.message}`);
      }

      console.log('User linked to supplier');
    }

    console.log(`User ${email} created successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        email,
        temporaryPassword: userPassword,
        message: 'User created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in create-tenant-user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
