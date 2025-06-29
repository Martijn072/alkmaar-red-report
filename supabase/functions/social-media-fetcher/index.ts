
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Twitter API credentials
const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

// Instagram API credentials (to be added later)
const INSTAGRAM_ACCESS_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN")?.trim();
const INSTAGRAM_USER_ID = Deno.env.get("INSTAGRAM_USER_ID")?.trim();

function validateTwitterCredentials() {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    console.log('⚠️ Twitter credentials not configured, skipping Twitter fetch');
    return false;
  }
  return true;
}

function validateInstagramCredentials() {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.log('⚠️ Instagram credentials not configured, skipping Instagram fetch');
    return false;
  }
  return true;
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  return signature;
}

function generateOAuthHeader(method: string, url: string, queryParams: Record<string, string> = {}): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  // Combine OAuth params with query params for signature generation
  const allParams = { ...oauthParams, ...queryParams };

  const signature = generateOAuthSignature(
    method,
    url.split('?')[0], // Remove query string from URL for signature
    allParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function fetchTwitterPosts(): Promise<any[]> {
  if (!validateTwitterCredentials()) {
    return [];
  }

  try {
    console.log('🐦 Fetching tweets from Twitter API...');
    
    // First, get user ID for azfanpage
    const userUrl = `https://api.x.com/2/users/by/username/azfanpage`;
    const userOauthHeader = generateOAuthHeader("GET", userUrl);
    
    const userResponse = await fetch(userUrl, {
      method: "GET",
      headers: {
        Authorization: userOauthHeader,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ Error fetching user info:', errorText);
      return [];
    }

    const userData = await userResponse.json();
    const userId = userData.data?.id;

    if (!userId) {
      console.error('❌ User azfanpage not found');
      return [];
    }

    console.log('✅ Found user ID:', userId);

    // Now get the user's recent tweets
    const tweetsUrl = `https://api.x.com/2/users/${userId}/tweets`;
    const queryParams = {
      'max_results': '10',
      'tweet.fields': 'created_at,text,public_metrics,attachments',
      'expansions': 'attachments.media_keys',
      'media.fields': 'url,preview_image_url,type'
    };
    
    const tweetsUrlWithParams = `${tweetsUrl}?${new URLSearchParams(queryParams).toString()}`;
    const tweetsOauthHeader = generateOAuthHeader("GET", tweetsUrl, queryParams);

    const tweetsResponse = await fetch(tweetsUrlWithParams, {
      method: "GET",
      headers: {
        Authorization: tweetsOauthHeader,
        "Content-Type": "application/json",
      },
    });

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error('❌ Error fetching tweets:', errorText);
      return [];
    }

    const tweetsData = await tweetsResponse.json();
    console.log('✅ Fetched tweets data:', JSON.stringify(tweetsData, null, 2));

    return tweetsData.data || [];
  } catch (error) {
    console.error('❌ Error in fetchTwitterPosts:', error);
    return [];
  }
}

async function fetchInstagramPosts(): Promise<any[]> {
  if (!validateInstagramCredentials()) {
    // Return mock data for now
    return [{
      id: 'ig_mock_' + Date.now(),
      caption: '🔥 Geweldige training vandaag! Het team is klaar voor de volgende wedstrijd! ⚽ #AZ #AlkmaarZaanstreek #Training',
      media_type: 'IMAGE',
      media_url: 'https://picsum.photos/600/600?random=' + Math.floor(Math.random() * 1000),
      permalink: 'https://instagram.com/p/mockpost' + Date.now(),
      timestamp: new Date().toISOString()
    }];
  }

  try {
    console.log('📷 Fetching Instagram posts...');
    
    const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error fetching Instagram posts:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('✅ Fetched Instagram posts:', data);
    
    return data.data || [];
  } catch (error) {
    console.error('❌ Error in fetchInstagramPosts:', error);
    return [];
  }
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

    // Fetch from both platforms
    const [twitterPosts, instagramPosts] = await Promise.all([
      fetchTwitterPosts(),
      fetchInstagramPosts()
    ]);

    console.log(`🐦 Found ${twitterPosts.length} tweets`);
    console.log(`📷 Found ${instagramPosts.length} Instagram posts`);

    // Check for existing notifications to avoid duplicates
    const { data: existingNotifications } = await supabaseClient
      .from('notifications')
      .select('social_media_url')
      .in('type', ['instagram', 'twitter'])
      .order('created_at', { ascending: false })
      .limit(100)

    const existingUrls = new Set(existingNotifications?.map(n => n.social_media_url) || [])

    // Insert new Twitter posts
    let newTwitterPosts = 0;
    for (const tweet of twitterPosts) {
      const tweetUrl = `https://twitter.com/azfanpage/status/${tweet.id}`;
      
      if (!existingUrls.has(tweetUrl)) {
        console.log('🐦 Adding new tweet:', tweet.text?.substring(0, 50) + '...');
        
        const { error } = await supabaseClient
          .from('notifications')
          .insert({
            type: 'twitter',
            title: 'Nieuwe Tweet van AZ Fanpage',
            description: tweet.text?.length > 150 
              ? tweet.text.substring(0, 147) + '...'
              : tweet.text,
            icon: '🐦',
            social_media_url: tweetUrl,
            thumbnail_url: null,
            read: false
          })

        if (error) {
          console.error('❌ Error inserting tweet:', error)
        } else {
          console.log('✅ Tweet added successfully')
          newTwitterPosts++;
        }
      }
    }

    // Insert new Instagram posts
    let newInstagramPosts = 0;
    for (const post of instagramPosts) {
      const postUrl = post.permalink || `https://instagram.com/p/mockpost${post.id}`;
      
      if (!existingUrls.has(postUrl)) {
        console.log('📷 Adding new Instagram post:', post.caption?.substring(0, 50) + '...');
        
        const { error } = await supabaseClient
          .from('notifications')
          .insert({
            type: 'instagram',
            title: 'Nieuwe Instagram Post van AZ',
            description: post.caption?.length > 150 
              ? post.caption.substring(0, 147) + '...'
              : post.caption || 'Nieuwe Instagram post',
            icon: '📷',
            social_media_url: postUrl,
            thumbnail_url: post.media_url || null,
            read: false
          })

        if (error) {
          console.error('❌ Error inserting Instagram post:', error)
        } else {
          console.log('✅ Instagram post added successfully')
          newInstagramPosts++;
        }
      }
    }

    console.log('✅ Social media fetch completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Social media posts fetched successfully',
        new_twitter_posts: newTwitterPosts,
        new_instagram_posts: newInstagramPosts,
        total_twitter_checked: twitterPosts.length,
        total_instagram_checked: instagramPosts.length,
        twitter_configured: validateTwitterCredentials(),
        instagram_configured: validateInstagramCredentials()
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
