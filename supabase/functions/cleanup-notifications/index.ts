
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧹 Notification cleanup starting...')
    console.log('🕐 Timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)
    const cutoffISOString = cutoffDate.toISOString()

    console.log(`🗓️ Deleting notifications older than: ${cutoffISOString}`)

    // Delete notifications older than 7 days
    const { data, error, count } = await supabaseClient
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISOString)

    if (error) {
      console.error('❌ Error deleting old notifications:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const deletedCount = count || 0
    console.log(`✅ Successfully deleted ${deletedCount} old notifications`)

    const result = {
      success: true,
      deleted_count: deletedCount,
      cutoff_date: cutoffISOString,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(errorResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
