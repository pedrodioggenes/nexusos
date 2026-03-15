import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const NOS_CONSOLE_URL = Deno.env.get('NOS_CONSOLE_URL')
    const NOS_WEBHOOK_SECRET = Deno.env.get('NOS_WEBHOOK_SECRET')

    console.log('[notify-nos-password-changed] Function invoked')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user: callerUser },
      error: userError,
    } = await userClient.auth.getUser(token)

    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { user_id } = body as { user_id?: string }

    if (!user_id || user_id !== callerUser.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: clearError } = await adminClient
      .from('user_roles')
      .update({ must_change_password: false })
      .eq('user_id', user_id)

    if (clearError) {
      console.error('[notify-nos-password-changed] clear flag error:', clearError)
      return new Response(JSON.stringify({ error: 'Failed to clear must_change_password' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let callbackOk = false
    let callbackStatus: number | null = null
    let callbackError: string | null = null

    if (NOS_CONSOLE_URL && NOS_WEBHOOK_SECRET) {
      try {
        const callbackUrl = `${NOS_CONSOLE_URL}/functions/v1/notify-password-changed`

        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': NOS_WEBHOOK_SECRET,
          },
          body: JSON.stringify({ user_id }),
        })

        callbackStatus = response.status
        const responseText = await response.text()

        if (response.ok) {
          callbackOk = true
        } else {
          callbackError = responseText || `HTTP ${response.status}`
          console.error('[notify-nos-password-changed] Console callback failed:', response.status, responseText)
        }
      } catch (err) {
        callbackError = err instanceof Error ? err.message : 'Unknown callback error'
        console.error('[notify-nos-password-changed] Console callback exception:', err)
      }
    } else {
      callbackError = 'NOS_CONSOLE_URL or NOS_WEBHOOK_SECRET not configured'
      console.warn('[notify-nos-password-changed] Missing Console secrets')
    }

    return new Response(
      JSON.stringify({
        success: true,
        flag_cleared: true,
        callback_ok: callbackOk,
        callback_status: callbackStatus,
        callback_error: callbackError,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[notify-nos-password-changed] Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})