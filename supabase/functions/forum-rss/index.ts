import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ForumPost {
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  category?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching forum RSS feed...');
    
    const rssUrl = 'https://www.azfanpage.nl/forum/index.php?action=.xml;type=rss2';
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'AZFanpage-App/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch RSS:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ posts: [], error: 'Failed to fetch RSS feed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const xmlText = await response.text();
    console.log('RSS feed fetched, parsing...');

    // Parse XML manually (Deno doesn't have DOMParser)
    const posts: ForumPost[] = [];
    
    // Simple regex-based XML parsing for RSS items
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const itemXml of itemMatches.slice(0, 10)) {
      const getTagContent = (tag: string): string => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return match ? (match[1] || match[2] || '').trim() : '';
      };

      const title = getTagContent('title');
      const link = getTagContent('link');
      const pubDate = getTagContent('pubDate');
      const author = getTagContent('dc:creator') || getTagContent('author');
      const category = getTagContent('category');

      if (title && link) {
        posts.push({
          title: decodeHTMLEntities(title),
          link,
          pubDate,
          author: author ? decodeHTMLEntities(author) : undefined,
          category: category ? decodeHTMLEntities(category) : undefined,
        });
      }
    }

    console.log(`Parsed ${posts.length} forum posts`);

    return new Response(
      JSON.stringify({ posts }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in forum-rss function:', error);
    return new Response(
      JSON.stringify({ posts: [], error: error.message }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
