import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisqusPost {
  id: string;
  message: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatar: {
      permalink: string;
    };
  };
  likes: number;
  dislikes: number;
  parent?: number;
}

interface DisqusResponse {
  response: DisqusPost[];
  cursor?: {
    hasNext: boolean;
    next: string;
  };
}

// Try to find thread using different identifier formats
async function findThread(apiKey: string, forum: string, articleIdentifier: string, articleUrl?: string): Promise<string | null> {
  const identifierFormats = [
    articleIdentifier,                    // Plain ID: "38524"
    `post-${articleIdentifier}`,          // WordPress format: "post-38524"
    `${articleIdentifier} ${articleUrl}`, // Combined format
  ];

  // Method 1: Try URL-based lookup first (most reliable for WordPress)
  if (articleUrl) {
    console.log(`[Method 1] Trying URL lookup: ${articleUrl}`);
    const urlLookup = new URL('https://disqus.com/api/3.0/threads/details.json');
    urlLookup.searchParams.set('api_key', apiKey);
    urlLookup.searchParams.set('forum', forum);
    urlLookup.searchParams.set('thread:link', articleUrl);
    
    const urlResponse = await fetch(urlLookup.toString());
    const urlData = await urlResponse.json();
    console.log(`[Method 1] Response code: ${urlData.code}, message: ${urlData.response?.message || JSON.stringify(urlData.response)}`);
    
    if (urlData.code === 0 && urlData.response?.id) {
      console.log(`✅ Found thread via URL: ${urlData.response.id}`);
      return urlData.response.id;
    }
  }

  // Method 2: Try different identifier formats
  for (const ident of identifierFormats) {
    console.log(`[Method 2] Trying identifier: "${ident}"`);
    const identLookup = new URL('https://disqus.com/api/3.0/threads/details.json');
    identLookup.searchParams.set('api_key', apiKey);
    identLookup.searchParams.set('forum', forum);
    identLookup.searchParams.set('thread:ident', ident);
    
    const identResponse = await fetch(identLookup.toString());
    const identData = await identResponse.json();
    console.log(`[Method 2] Response code: ${identData.code}, message: ${identData.response?.message || JSON.stringify(identData.response)}`);
    
    if (identData.code === 0 && identData.response?.id) {
      console.log(`✅ Found thread via identifier "${ident}": ${identData.response.id}`);
      return identData.response.id;
    }
  }

  // Method 3: List recent threads and search
  console.log(`[Method 3] Listing recent threads to search...`);
  const listUrl = new URL('https://disqus.com/api/3.0/threads/list.json');
  listUrl.searchParams.set('api_key', apiKey);
  listUrl.searchParams.set('forum', forum);
  listUrl.searchParams.set('limit', '100');
  
  const listResponse = await fetch(listUrl.toString());
  const listData = await listResponse.json();
  
  console.log(`[Method 3] Response code: ${listData.code}`);
  
  if (listData.code !== 0) {
    console.log(`[Method 3] Error: ${JSON.stringify(listData.response)}`);
    return null;
  }
  
  if (listData.response) {
    console.log(`[Method 3] Found ${listData.response.length} threads in forum`);
    
    // Log first few threads for debugging
    listData.response.slice(0, 5).forEach((t: any, i: number) => {
      console.log(`  Thread ${i}: id=${t.id}, link=${t.link}, identifiers=${JSON.stringify(t.identifiers)}`);
    });
    
    // Search for matching thread
    const matchingThread = listData.response.find((t: any) => {
      const identMatch = t.identifiers?.some((id: string) => 
        id === articleIdentifier || 
        id === `post-${articleIdentifier}` ||
        id.includes(articleIdentifier)
      );
      const urlMatch = articleUrl && (t.link === articleUrl || t.link?.includes(articleUrl.split('/').pop()?.replace(/\/$/, '')));
      return identMatch || urlMatch;
    });
    
    if (matchingThread) {
      console.log(`✅ Found thread via list search: ${matchingThread.id}`);
      return matchingThread.id;
    }
  }

  console.log('❌ No thread found with any method');
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleIdentifier, articleUrl } = await req.json();
    
    if (!articleIdentifier) {
      return new Response(
        JSON.stringify({ error: 'articleIdentifier is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('DISQUS_API_KEY');
    if (!apiKey) {
      console.error('DISQUS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Disqus API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const forum = 'azfanpage';
    
    console.log(`🔍 Fetching Disqus comments for article:`);
    console.log(`   Identifier: ${articleIdentifier}`);
    console.log(`   URL: ${articleUrl}`);
    console.log(`   API Key length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}...`);
    
    // Quick API validation test
    const testUrl = new URL('https://disqus.com/api/3.0/forums/details.json');
    testUrl.searchParams.set('api_key', apiKey);
    testUrl.searchParams.set('forum', forum);
    const testResponse = await fetch(testUrl.toString());
    const testData = await testResponse.json();
    console.log(`🔑 API Key validation: code=${testData.code}, forum exists: ${!!testData.response?.id}`);
    if (testData.code !== 0) {
      console.error(`API Error: ${JSON.stringify(testData)}`);
    }
    
    console.log(`🔍 Fetching Disqus comments for article:`);
    console.log(`   Identifier: ${articleIdentifier}`);
    console.log(`   URL: ${articleUrl}`);

    const threadId = await findThread(apiKey, forum, articleIdentifier, articleUrl);
    
    if (!threadId) {
      return new Response(
        JSON.stringify({ comments: [], totalComments: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return await fetchComments(apiKey, threadId, corsHeaders);

  } catch (error) {
    console.error('Error in disqus-comments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchComments(apiKey: string, threadId: string, corsHeaders: Record<string, string>) {
  // Fetch posts for the thread
  const postsUrl = new URL('https://disqus.com/api/3.0/threads/listPosts.json');
  postsUrl.searchParams.set('api_key', apiKey);
  postsUrl.searchParams.set('thread', threadId);
  postsUrl.searchParams.set('limit', '100');
  postsUrl.searchParams.set('order', 'desc'); // Newest first
  
  console.log(`Fetching posts for thread ${threadId}...`);
  const postsResponse = await fetch(postsUrl.toString());
  const postsData = await postsResponse.json();
  
  console.log(`Posts API response code: ${postsData.code}`);
  console.log(`Posts response type: ${typeof postsData.response}, isArray: ${Array.isArray(postsData.response)}`);
  
  if (postsData.code !== 0) {
    console.error(`Posts API error: ${JSON.stringify(postsData)}`);
    return new Response(
      JSON.stringify({ comments: [], totalComments: 0, error: postsData.response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (!postsData.response || !Array.isArray(postsData.response)) {
    console.log('No posts found or invalid response format');
    return new Response(
      JSON.stringify({ comments: [], totalComments: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Transform to our format
  const comments = postsData.response.map((post: any) => ({
    id: post.id,
    content: post.message,
    createdAt: post.createdAt,
    author: {
      name: post.author?.name || 'Anoniem',
      username: post.author?.username || '',
      avatarUrl: post.author?.avatar?.permalink || '',
    },
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    parentId: post.parent ? String(post.parent) : null,
  }));

  console.log(`✅ Returning ${comments.length} comments`);
  
  return new Response(
    JSON.stringify({ 
      comments, 
      totalComments: comments.length,
      threadId 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
