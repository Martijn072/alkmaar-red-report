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
    console.log('Fetching forum Atom feed...');
    
    const feedUrl = 'https://azfanpage.nl/forum/feed';
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'AZFanpage-App/1.0',
        'Accept': 'application/atom+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch feed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ posts: [], error: 'Failed to fetch forum feed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const xmlText = await response.text();
    console.log('Atom feed fetched, parsing...');

    // Parse Atom feed format (phpBB uses Atom, not RSS 2.0)
    const posts: ForumPost[] = [];
    
    // Extract <entry> elements from Atom feed
    const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    
    for (const entryXml of entryMatches.slice(0, 10)) {
      // Extract title (with CDATA support)
      const titleMatch = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      let title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract link href attribute
      const linkMatch = entryXml.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/);
      const link = linkMatch ? linkMatch[1] : '';
      
      // Extract published or updated date
      const dateMatch = entryXml.match(/<(?:published|updated)>([^<]+)<\/(?:published|updated)>/);
      const pubDate = dateMatch ? dateMatch[1] : '';
      
      // Extract author name (nested in <author><name>)
      const authorMatch = entryXml.match(/<author>[\s\S]*?<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>[\s\S]*?<\/author>/);
      const author = authorMatch ? authorMatch[1].trim() : undefined;
      
      // Extract category label attribute
      const categoryMatch = entryXml.match(/<category[^>]*label="([^"]+)"[^>]*\/?>/);
      const category = categoryMatch ? categoryMatch[1] : undefined;

      if (title && link) {
        // Clean up title (often includes "Category • Re: Title" format)
        title = title.replace(/^[^•]+•\s*/, ''); // Remove category prefix
        
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
