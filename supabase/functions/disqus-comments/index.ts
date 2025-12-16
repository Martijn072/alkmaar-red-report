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

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    console.log(`Fetching Disqus comments for identifier: ${articleIdentifier}, url: ${articleUrl}`);

    // First, get the thread by identifier
    const threadUrl = new URL('https://disqus.com/api/3.0/threads/details.json');
    threadUrl.searchParams.set('api_key', apiKey);
    threadUrl.searchParams.set('forum', forum);
    threadUrl.searchParams.set('thread:ident', articleIdentifier);
    
    // Also try with URL if identifier doesn't work
    if (articleUrl) {
      threadUrl.searchParams.set('thread:link', articleUrl);
    }

    console.log(`Fetching thread details...`);
    const threadResponse = await fetch(threadUrl.toString());
    const threadData = await threadResponse.json();
    
    if (threadData.code !== 0 || !threadData.response) {
      console.log('Thread not found, trying alternative lookup...');
      
      // Try listing threads to find the right one
      const listUrl = new URL('https://disqus.com/api/3.0/threads/list.json');
      listUrl.searchParams.set('api_key', apiKey);
      listUrl.searchParams.set('forum', forum);
      listUrl.searchParams.set('limit', '100');
      
      const listResponse = await fetch(listUrl.toString());
      const listData = await listResponse.json();
      
      if (listData.code === 0 && listData.response) {
        // Try to find thread by identifier or URL
        const matchingThread = listData.response.find((t: any) => 
          t.identifiers?.includes(articleIdentifier) || 
          t.link === articleUrl ||
          t.link?.includes(articleIdentifier)
        );
        
        if (matchingThread) {
          console.log(`Found thread via list: ${matchingThread.id}`);
          return await fetchComments(apiKey, matchingThread.id, corsHeaders);
        }
      }
      
      // No thread found - return empty comments
      console.log('No thread found for this article');
      return new Response(
        JSON.stringify({ comments: [], totalComments: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const threadId = threadData.response.id;
    console.log(`Found thread: ${threadId}`);
    
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
  postsUrl.searchParams.set('order', 'popular'); // Most liked first
  
  console.log(`Fetching posts for thread ${threadId}...`);
  const postsResponse = await fetch(postsUrl.toString());
  const postsData: DisqusResponse = await postsResponse.json();
  
  if (!postsData.response) {
    console.log('No posts found');
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

  console.log(`Returning ${comments.length} comments`);
  
  return new Response(
    JSON.stringify({ 
      comments, 
      totalComments: comments.length,
      threadId 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
