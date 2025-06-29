
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Starting diagnostic test...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check if cron jobs exist
    console.log('📋 Checking cron jobs...')
    const { data: cronJobs, error: cronError } = await supabaseClient
      .from('pg_cron.job')
      .select('*')
    
    if (cronError) {
      console.error('❌ Error checking cron jobs:', cronError)
    } else {
      console.log('✅ Cron jobs found:', cronJobs?.length || 0)
      cronJobs?.forEach(job => {
        console.log(`  - Job: ${job.jobname}, Schedule: ${job.schedule}`)
      })
    }

    // 2. Test environment variables
    console.log('🔑 Checking Twitter API credentials...')
    const twitterKeys = {
      API_KEY: Deno.env.get("TWITTER_CONSUMER_KEY") ? '✅ Set' : '❌ Missing',
      API_SECRET: Deno.env.get("TWITTER_CONSUMER_SECRET") ? '✅ Set' : '❌ Missing',
      ACCESS_TOKEN: Deno.env.get("TWITTER_ACCESS_TOKEN") ? '✅ Set' : '❌ Missing',
      ACCESS_TOKEN_SECRET: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") ? '✅ Set' : '❌ Missing'
    }
    console.log('Twitter credentials status:', twitterKeys)

    // 3. Test social media fetcher function
    console.log('🧪 Testing social-media-fetcher function...')
    const { data: fetcherResult, error: fetcherError } = await supabaseClient.functions.invoke('social-media-fetcher')
    
    if (fetcherError) {
      console.error('❌ Social media fetcher error:', fetcherError)
    } else {
      console.log('✅ Social media fetcher result:', fetcherResult)
    }

    // 4. Check recent notifications
    console.log('📱 Checking recent notifications...')
    const { data: notifications, error: notifError } = await supabaseClient
      .from('notifications')
      .select('*')
      .in('type', ['twitter', 'instagram'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (notifError) {
      console.error('❌ Error checking notifications:', notifError)
    } else {
      console.log(`✅ Found ${notifications?.length || 0} social media notifications:`)
      notifications?.forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.title} (${notif.created_at})`)
      })
    }

    const diagnosticResult = {
      cronJobsCount: cronJobs?.length || 0,
      twitterCredentials: twitterKeys,
      socialMediaFetcherTest: fetcherResult ? 'Success' : 'Failed',
      socialMediaNotificationsCount: notifications?.length || 0,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(diagnosticResult, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Diagnostic test error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
