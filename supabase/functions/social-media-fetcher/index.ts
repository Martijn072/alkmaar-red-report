
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Starting social media fetch...')

    // Mock Instagram post fetching (in real implementation, you'd use Instagram Basic Display API or RSS feeds)
    const mockInstagramPosts = [
      {
        id: 'insta_' + Date.now(),
        title: 'Nieuwe Instagram post',
        description: 'Training vandaag was intensief! De spelers zijn klaar voor de volgende wedstrijd. 💪⚽',
        url: 'https://instagram.com/p/mockpost1',
        thumbnail: 'https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      }
    ]

    // Mock Twitter post fetching (in real implementation, you'd use Twitter API v2)
    const mockTwitterPosts = [
      {
        id: 'tweet_' + Date.now(),
        title: 'Nieuwe Tweet',
        description: 'MATCHDAY! AZ vs Ajax vanavond om 20:00 in het AFAS Stadion! Kom allemaal! 🔴⚪ #AZ #Alkmaar',
        url: 'https://twitter.com/azfanpage/status/mocktweet1',
        timestamp: new Date().toISOString()
      }
    ]

    // Check for existing notifications to avoid duplicates
    const { data: existingNotifications } = await supabaseClient
      .from('notifications')
      .select('social_media_url')
      .in('type', ['instagram', 'twitter'])
      .order('created_at', { ascending: false })
      .limit(50)

    const existingUrls = new Set(existingNotifications?.map(n => n.social_media_url) || [])

    // Insert new Instagram posts
    for (const post of mockInstagramPosts) {
      if (!existingUrls.has(post.url)) {
        console.log('📷 Adding new Instagram post:', post.title)
        
        const { error } = await supabaseClient
          .from('notifications')
          .insert({
            type: 'instagram',
            title: post.title,
            description: post.description,
            icon: '📷',
            social_media_url: post.url,
            thumbnail_url: post.thumbnail,
            read: false
          })

        if (error) {
          console.error('❌ Error inserting Instagram post:', error)
        } else {
          console.log('✅ Instagram post added successfully')
        }
      }
    }

    // Insert new Twitter posts
    for (const post of mockTwitterPosts) {
      if (!existingUrls.has(post.url)) {
        console.log('🐦 Adding new Twitter post:', post.title)
        
        const { error } = await supabaseClient
          .from('notifications')
          .insert({
            type: 'twitter',
            title: post.title,
            description: post.description,
            icon: '🐦',
            social_media_url: post.url,
            thumbnail_url: null,
            read: false
          })

        if (error) {
          console.error('❌ Error inserting Twitter post:', error)
        } else {
          console.log('✅ Twitter post added successfully')
        }
      }
    }

    console.log('✅ Social media fetch completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Social media posts fetched successfully',
        instagram_posts: mockInstagramPosts.length,
        twitter_posts: mockTwitterPosts.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in social media fetcher:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
