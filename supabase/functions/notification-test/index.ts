
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
    console.log('🧪 Starting notification system test...')
    console.log('📅 Test timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const testResults = {
      timestamp: new Date().toISOString(),
      social_media_test: null as any,
      articles_test: null as any,
      notifications_before: 0,
      notifications_after: 0,
      new_notifications: 0,
      cron_status: 'unknown'
    }

    // 1. Check current notifications count
    console.log('📊 Checking current notifications...')
    const { data: notificationsBefore, error: beforeError } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10)

    if (beforeError) {
      console.error('❌ Error checking notifications:', beforeError)
    } else {
      testResults.notifications_before = notificationsBefore?.length || 0
      console.log(`📋 Found ${testResults.notifications_before} existing notifications`)
      
      // Show recent notifications
      notificationsBefore?.slice(0, 3).forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.title} (${notif.created_at})`)
      })
    }

    // 2. Test social media fetcher
    console.log('🐦 Testing social media fetcher...')
    try {
      const { data: socialResult, error: socialError } = await supabaseClient.functions.invoke('social-media-fetcher')
      
      if (socialError) {
        console.error('❌ Social media fetcher error:', socialError)
        testResults.social_media_test = { error: socialError.message }
      } else {
        console.log('✅ Social media fetcher result:', socialResult)
        testResults.social_media_test = socialResult
      }
    } catch (error) {
      console.error('❌ Error calling social media fetcher:', error)
      testResults.social_media_test = { error: error.message }
    }

    // 3. Test articles fetcher
    console.log('📰 Testing articles fetcher...')
    try {
      const { data: articlesResult, error: articlesError } = await supabaseClient.functions.invoke('fetch-articles', {
        body: { mode: 'notifications', perPage: 5 }
      })
      
      if (articlesError) {
        console.error('❌ Articles fetcher error:', articlesError)
        testResults.articles_test = { error: articlesError.message }
      } else {
        console.log('✅ Articles fetcher result:', articlesResult)
        testResults.articles_test = articlesResult
      }
    } catch (error) {
      console.error('❌ Error calling articles fetcher:', error)
      testResults.articles_test = { error: error.message }
    }

    // 4. Check notifications count after tests
    console.log('📊 Checking notifications after tests...')
    const { data: notificationsAfter, error: afterError } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10)

    if (afterError) {
      console.error('❌ Error checking notifications after:', afterError)
    } else {
      testResults.notifications_after = notificationsAfter?.length || 0
      testResults.new_notifications = testResults.notifications_after - testResults.notifications_before
      
      console.log(`📊 Notifications after tests: ${testResults.notifications_after}`)
      console.log(`✨ New notifications created: ${testResults.new_notifications}`)
      
      // Show new notifications if any
      if (testResults.new_notifications > 0) {
        console.log('🆕 New notifications:')
        notificationsAfter?.slice(0, testResults.new_notifications).forEach(notif => {
          console.log(`  - ${notif.type}: ${notif.title} (${notif.created_at})`)
        })
      }
    }

    // 5. Try to check cron job status
    console.log('⏰ Checking cron job status...')
    try {
      // This might not work depending on permissions, but let's try
      const { data: cronCheck } = await supabaseClient
        .rpc('check_cron_jobs')
        .select()
      
      testResults.cron_status = cronCheck ? 'active' : 'unknown'
    } catch (error) {
      console.log('⚠️ Cannot check cron status directly (this is normal):', error.message)
      testResults.cron_status = 'unknown - cannot check directly'
    }

    // Final summary
    console.log('🎯 Test Summary:')
    console.log(`  📊 Notifications before: ${testResults.notifications_before}`)
    console.log(`  📊 Notifications after: ${testResults.notifications_after}`)
    console.log(`  ✨ New notifications: ${testResults.new_notifications}`)
    console.log(`  🐦 Social media test: ${testResults.social_media_test?.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`  📰 Articles test: ${testResults.articles_test?.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`  ⏰ Cron status: ${testResults.cron_status}`)

    return new Response(
      JSON.stringify(testResults, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Test error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
