/**
 * NEXUS-SIDE EDGE FUNCTION — Deploy this in the Nexus project
 *
 * Receives instructions from NOS Console and executes them against
 * the Nexus database. Replies back to NOS Console via receive-replication.
 *
 * Required secrets in Nexus:
 *   - NOS_WEBHOOK_SECRET (shared with NOS Console)
 *   - NOS_CONSOLE_URL (e.g. https://purejrfflrkjamxmadnf.supabase.co)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-nos-instruction',
}

type InstructionType =
  | 'create_user' | 'update_user' | 'toggle_user_status' | 'revoke_admin'
  | 'reset_password' | 'create_tenant' | 'update_tenant'
  | 'create_supplier' | 'toggle_supplier_status'
  | 'activate_module' | 'deactivate_module'
  | 'update_quota' | 'update_feature_flag' | 'update_settings'
  | 'update_tenant_quotas' | 'health_check'

interface Instruction {
  type: InstructionType
  tenant_id: string
  payload: Record<string, unknown>
  issued_by?: string
  issued_at?: string
}

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const webhookSecret = req.headers.get('x-webhook-secret')
  const NOS_WEBHOOK_SECRET = Deno.env.get('NOS_WEBHOOK_SECRET') ?? ''

  if (!webhookSecret || webhookSecret !== NOS_WEBHOOK_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const NOS_CONSOLE_URL = Deno.env.get('NOS_CONSOLE_URL') ?? ''

  try {
    const instruction: Instruction = await req.json()
    const { type, tenant_id, payload } = instruction

    // Health check — respond immediately without processing
    if (instruction.type === 'health_check') {
      return new Response(
        JSON.stringify({ success: true, status: 'ok', timestamp: new Date().toISOString() }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!type || !payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid instruction — missing type or payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: Record<string, unknown> = {}

    switch (type) {
      // ─── CREATE USER ───
      case 'create_user': {
        const { email, fullName, tenantId, tenant_id: tenantIdSnake, userType, role, hierarchyLevel, department, departmentRole, supplierId, modulesAllowed, pagesAllowed, agency_lockdown } = payload as any
        const temporaryPassword = generatePassword()

        const targetTenantId = tenantId || tenantIdSnake || tenant_id
        if (!targetTenantId) {
          throw new Error('create_user: tenant_id ausente no payload/instruction')
        }

        // Agency lockdown enforcement: force modules_allowed and department_role
        const finalDepartmentRole = (agency_lockdown === true || departmentRole === 'agencia') ? 'agencia' : (departmentRole || null)
        const finalModulesAllowed = (agency_lockdown === true || departmentRole === 'agencia') ? ['hipergestao'] : (modulesAllowed || [])

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })

        if (authError) throw new Error(`Auth: ${authError.message}`)

        const userId = authUser.user.id

        // Profile
        await supabase.from('profiles').upsert({
          user_id: userId,
          email,
          full_name: fullName,
        }, { onConflict: 'user_id' })

        // User role
        await supabase.from('user_roles').insert({
          user_id: userId,
          tenant_id: targetTenantId,
          user_type: userType,
          role: role || null,
          hierarchy_level: hierarchyLevel || 'colaborador',
          department: department || null,
          department_role: finalDepartmentRole,
          modules_allowed: finalModulesAllowed,
          pages_allowed: pagesAllowed || null,
          is_active: true,
          must_change_password: true,
        })

        // Supplier link
        if (userType === 'supplier' && supplierId) {
          await supabase.from('user_suppliers').insert({
            user_id: userId,
            supplier_id: supplierId,
          })
        }

        result = { success: true, userId, email, temporaryPassword }
        break
      }

      // ─── UPDATE USER ───
      case 'update_user': {
        const { userId, fullName, role, userType, isActive, departmentRole, hierarchyLevel, department, modulesAllowed, pagesAllowed, supplierId, previousUserType, agency_lockdown, tenantId, tenant_id: tenantIdSnake } = payload as any

        if (fullName !== undefined) {
          await supabase.from('profiles').update({ full_name: fullName }).eq('user_id', userId)
        }

        const roleUpdate: Record<string, any> = {}
        if (role !== undefined) roleUpdate.role = role
        if (userType !== undefined) roleUpdate.user_type = userType
        if (isActive !== undefined) roleUpdate.is_active = isActive
        if (departmentRole !== undefined) roleUpdate.department_role = departmentRole
        if (hierarchyLevel !== undefined) roleUpdate.hierarchy_level = hierarchyLevel
        if (department !== undefined) roleUpdate.department = department
        if (modulesAllowed !== undefined) roleUpdate.modules_allowed = modulesAllowed
        if (pagesAllowed !== undefined) roleUpdate.pages_allowed = pagesAllowed

        const targetTenantId = tenantId || tenantIdSnake || tenant_id
        if (targetTenantId) {
          roleUpdate.tenant_id = targetTenantId
        }

        // Agency lockdown enforcement on update
        if (agency_lockdown === true) {
          roleUpdate.department_role = 'agencia'
          roleUpdate.modules_allowed = ['hipergestao']
        } else if (agency_lockdown !== false) {
          // If agency_lockdown is not explicitly false, check if current role is agencia
          // and prevent removal of lockdown via normal update
          if (roleUpdate.department_role === undefined && departmentRole === undefined) {
            const { data: currentRole } = await supabase.from('user_roles').select('department_role').eq('user_id', userId).maybeSingle()
            if (currentRole?.department_role === 'agencia') {
              // Preserve agency lockdown unless explicitly removed
              roleUpdate.department_role = 'agencia'
              roleUpdate.modules_allowed = ['hipergestao']
            }
          }
        }

        if (Object.keys(roleUpdate).length > 0) {
          await supabase.from('user_roles').update(roleUpdate).eq('user_id', userId)
        }

        // Supplier link management
        if (userType === 'supplier' && supplierId) {
          await supabase.from('user_suppliers').delete().eq('user_id', userId)
          await supabase.from('user_suppliers').insert({ user_id: userId, supplier_id: supplierId })
        } else if (userType !== 'supplier' && previousUserType === 'supplier') {
          await supabase.from('user_suppliers').delete().eq('user_id', userId)
        }

        result = { success: true, userId }
        break
      }

      // ─── TOGGLE USER STATUS ───
      case 'toggle_user_status': {
        const { userId, newStatus } = payload as any
        const { error } = await supabase.from('user_roles').update({ is_active: newStatus }).eq('user_id', userId)
        if (error) {
          const { error: err2 } = await supabase.from('user_roles').update({ is_active: newStatus }).eq('id', userId)
          if (err2) throw err2
        }
        result = { success: true, userId, newStatus }
        break
      }

      // ─── REVOKE ADMIN ───
      case 'revoke_admin': {
        const { userId } = payload as any
        await supabase.from('user_roles').update({ user_type: 'internal' }).eq('user_id', userId)
        result = { success: true, userId }
        break
      }

      // ─── RESET PASSWORD ───
      case 'reset_password': {
        const { userId, newPassword } = payload as any
        const password = newPassword || generatePassword()
        const { error } = await supabase.auth.admin.updateUserById(userId, { password })
        if (error) throw error
        // Force password change on next login
        await supabase.from('user_roles').update({ must_change_password: true }).eq('user_id', userId)
        result = { success: true, userId, temporaryPassword: password }
        break
      }

      // ─── CREATE TENANT ───
      case 'create_tenant': {
        const { name, slug, modules_enabled } = payload as any
        const { data: tenant, error } = await supabase.from('tenants').insert({
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          modules_enabled: modules_enabled || [],
          is_active: true,
        }).select().single()
        if (error) throw error
        result = { success: true, tenant }
        break
      }

      // ─── UPDATE TENANT ───
      case 'update_tenant': {
        const { tenantId, ...updates } = payload as any
        const targetId = tenantId || tenant_id
        const { error } = await supabase.from('tenants').update(updates).eq('id', targetId)
        if (error) throw error
        result = { success: true, tenantId: targetId }
        break
      }

      // ─── CREATE SUPPLIER ───
      case 'create_supplier': {
        const { name, tenant_id: tid, cnpj, contact_email, contact_phone } = payload as any
        const { data: supplier, error } = await supabase.from('suppliers').insert({
          name,
          tenant_id: tid || tenant_id,
          cnpj: cnpj || null,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          is_active: true,
        }).select().single()
        if (error) throw error
        result = { success: true, supplier }
        break
      }

      // ─── TOGGLE SUPPLIER STATUS ───
      case 'toggle_supplier_status': {
        const { supplierId, newStatus } = payload as any
        const { error } = await supabase.from('suppliers').update({ is_active: newStatus }).eq('id', supplierId)
        if (error) throw error
        result = { success: true, supplierId, newStatus }
        break
      }

      // ─── ACTIVATE/DEACTIVATE MODULE ───
      case 'activate_module':
      case 'deactivate_module': {
        const { tenantId: tid2, moduleKey } = payload as any
        const targetId = tid2 || tenant_id
        const { data: tenant } = await supabase.from('tenants').select('modules_enabled').eq('id', targetId).single()
        let modules = (tenant?.modules_enabled as string[]) || []
        if (type === 'activate_module') {
          if (!modules.includes(moduleKey)) modules = [...modules, moduleKey]
        } else {
          modules = modules.filter((m: string) => m !== moduleKey)
        }
        const { error } = await supabase.from('tenants').update({ modules_enabled: modules }).eq('id', targetId)
        if (error) throw error
        result = { success: true, tenantId: targetId, modules_enabled: modules }
        break
      }

      // ─── UPDATE QUOTA ───
      case 'update_quota': {
        const { tenantId: tid3, quotaKey, quotaValue } = payload as any
        const targetId = tid3 || tenant_id
        const { data: tenant } = await supabase.from('tenants').select('settings').eq('id', targetId).single()
        const settings = (tenant?.settings as Record<string, any>) || {}
        if (!settings.quotas) settings.quotas = {}
        settings.quotas[quotaKey] = quotaValue
        const { error } = await supabase.from('tenants').update({ settings }).eq('id', targetId)
        if (error) throw error
        result = { success: true, tenantId: targetId }
        break
      }

      // ─── UPDATE FEATURE FLAG ───
      case 'update_feature_flag': {
        const { tenantId: tid4, featureKey, featureValue } = payload as any
        const targetId = tid4 || tenant_id
        const { data: tenant } = await supabase.from('tenants').select('settings').eq('id', targetId).single()
        const settings = (tenant?.settings as Record<string, any>) || {}
        if (!settings.feature_flags) settings.feature_flags = {}
        settings.feature_flags[featureKey] = featureValue
        const { error } = await supabase.from('tenants').update({ settings }).eq('id', targetId)
        if (error) throw error
        result = { success: true, tenantId: targetId }
        break
      }

      // ─── UPDATE SETTINGS ───
      case 'update_settings': {
        const { key, value } = payload as any
        const { data: existing } = await supabase
          .from('system_settings')
          .select('key')
          .eq('key', key)
          .maybeSingle()

        if (existing) {
          const { error } = await supabase
            .from('system_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('system_settings')
            .insert({ key, value, updated_at: new Date().toISOString() })
          if (error) throw error
        }
        result = { success: true, key }
        break
      }

      // ─── UPDATE TENANT QUOTAS ───
      case 'update_tenant_quotas': {
        const { tenantId: tidQ, ai_queries_monthly_limit, campaigns_monthly_limit, storage_limit_bytes, features_enabled } = payload as any
        const targetId = tidQ || tenant_id

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
        if (ai_queries_monthly_limit !== undefined) updateData.ai_queries_monthly_limit = ai_queries_monthly_limit
        if (campaigns_monthly_limit !== undefined) updateData.campaigns_monthly_limit = campaigns_monthly_limit
        if (storage_limit_bytes !== undefined) updateData.storage_limit_bytes = storage_limit_bytes
        if (features_enabled !== undefined) updateData.features_enabled = features_enabled

        const { data: existing } = await supabase
          .from('tenant_quotas')
          .select('tenant_id')
          .eq('tenant_id', targetId)
          .maybeSingle()

        if (existing) {
          const { error } = await supabase.from('tenant_quotas').update(updateData).eq('tenant_id', targetId)
          if (error) throw error
        } else {
          const { error } = await supabase.from('tenant_quotas').insert({ tenant_id: targetId, ...updateData })
          if (error) throw error
        }

        result = { success: true, tenantId: targetId }
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown instruction type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // ─── Reply to NOS Console via receive-replication ───
    if (NOS_CONSOLE_URL) {
      try {
        await fetch(`${NOS_CONSOLE_URL}/functions/v1/receive-replication`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': NOS_WEBHOOK_SECRET,
          },
          body: JSON.stringify({
            event_type: type,
            table: 'instruction_result',
            record: result,
            tenant_id: tenant_id,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (replyError) {
        console.error('Failed to reply to NOS Console:', replyError)
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Instruction handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Instruction failed', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
