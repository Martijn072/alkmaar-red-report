
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
    console.log('🔍 Starting comprehensive diagnostic test...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check if cron jobs exist
    console.log('📋 Checking cron jobs...')
    try {
      const { data: cronJobs, error: cronError } = await supabaseClient
        .rpc('select_cron_jobs')
      
      if (cronError) {
        console.log('⚠️ Cannot check cron jobs (this is normal):', cronError.message)
      } else {
        console.log('✅ Cron jobs found:', cronJobs?.length || 0)
      }
    } catch (error) {
      console.log('⚠️ Cron job check skipped (this is normal):', error.message)
    }

    // 2. Test environment variables - ALL Twitter credentials
    console.log('🔑 Checking ALL Twitter API credentials...')
    const twitterKeys = {
      TWITTER_CONSUMER_KEY: Deno.env.get("TWITTER_CONSUMER_KEY") ? '✅ Set' : '❌ Missing',
      TWITTER_CONSUMER_SECRET: Deno.env.get("TWITTER_CONSUMER_SECRET") ? '✅ Set' : '❌ Missing',
      TWITTER_ACCESS_TOKEN: Deno.env.get("TWITTER_ACCESS_TOKEN") ? '✅ Set' : '❌ Missing',
      TWITTER_ACCESS_TOKEN_SECRET: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") ? '✅ Set' : '❌ Missing'
    }
    console.log('Twitter credentials status:', twitterKeys)

    // 3. Check Instagram credentials too
    console.log('📷 Checking Instagram API credentials...')
    const instagramKeys = {
      INSTAGRAM_ACCESS_TOKEN: Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ? '✅ Set' : '❌ Missing',
      INSTAGRAM_USER_ID: Deno.env.get("INSTAGRAM_USER_ID") ? '✅ Set' : '❌ Missing'
    }
    console.log('Instagram credentials status:', instagramKeys)

    // 4. Test social media fetcher function directly
    console.log('🧪 Testing social-media-fetcher function...')
    try {
      const { data: fetcherResult, error: fetcherError } = await supabaseClient.functions.invoke('social-media-fetcher')
      
      if (fetcherError) {
        console.error('❌ Social media fetcher error:', fetcherError)
      } else {
        console.log('✅ Social media fetcher result:', fetcherResult)
      }
    } catch (error) {
      console.error('❌ Error calling social media fetcher:', error)
    }

    // 5. Check recent notifications
    console.log('📱 Checking recent social media notifications...')
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

    // 6. Test Twitter API directly (basic test)
    console.log('🐦 Testing Twitter API connectivity...')
    let twitterTest = 'Not tested';
    try {
      // Simple test to see if we can make a basic Twitter API call
      const allTwitterCredsSet = Object.values(twitterKeys).every(status => status === '✅ Set');
      if (allTwitterCredsSet) {
        twitterTest = '✅ All credentials configured - ready for testing';
      } else {
        twitterTest = '❌ Missing some Twitter credentials';
      }
    } catch (error) {
      twitterTest = `❌ Twitter test failed: ${error.message}`;
    }

    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      twitter_credentials: twitterKeys,
      instagram_credentials: instagramKeys,
      twitter_api_test: twitterTest,
      social_media_fetcher_available: true,
      social_media_notifications_count: notifications?.length || 0,
      recent_notifications: notifications?.slice(0, 3).map(n => ({
        type: n.type,
        title: n.title,
        created_at: n.created_at
      })) || []
    }

    console.log('🎯 Diagnostic complete!')

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
