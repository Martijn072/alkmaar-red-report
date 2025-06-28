
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  author: number;
  date: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{ name: string }>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ name: string; taxonomy: string }>>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching articles from azfanpage.nl WordPress API...');
    
    // Fetch posts with embedded author and featured media
    const response = await fetch(
      'https://azfanpage.nl/wp-json/wp/v2/posts?_embed&per_page=20&orderby=date&order=desc',
      {
        headers: {
          'User-Agent': 'AZFanpage-App/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch from WordPress API:', response.status, response.statusText);
      throw new Error(`WordPress API returned ${response.status}`);
    }

    const posts: WordPressPost[] = await response.json();
    console.log(`Successfully fetched ${posts.length} articles`);

    // Transform WordPress posts to our Article interface
    const articles = posts.map((post) => {
      const author = post._embedded?.author?.[0]?.name || 'AZFanpage Redactie';
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';
      
      // Get category name from embedded terms
      const categoryTerms = post._embedded?.['wp:term']?.find(termGroup => 
        termGroup.some(term => term.taxonomy === 'category')
      );
      const category = categoryTerms?.find(term => term.taxonomy === 'category')?.name || 'Nieuws';
      
      // Check if it's breaking news (based on tags or recent publication)
      const tagTerms = post._embedded?.['wp:term']?.find(termGroup => 
        termGroup.some(term => term.taxonomy === 'post_tag')
      );
      const tags = tagTerms?.filter(term => term.taxonomy === 'post_tag').map(term => term.name) || [];
      const isBreaking = tags.some(tag => 
        tag.toLowerCase().includes('breaking') || 
        tag.toLowerCase().includes('laatste') ||
        tag.toLowerCase().includes('urgent')
      ) || (new Date().getTime() - new Date(post.date).getTime()) < 2 * 60 * 60 * 1000; // 2 hours

      // Clean excerpt HTML
      const excerpt = post.excerpt.rendered
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, ' ') // Remove HTML entities
        .trim();

      // Format date to Dutch
      const publishedDate = new Date(post.date);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
      
      let publishedAt: string;
      if (diffHours < 1) {
        publishedAt = 'Zojuist';
      } else if (diffHours < 24) {
        publishedAt = `${diffHours} uur geleden`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        publishedAt = diffDays === 1 ? '1 dag geleden' : `${diffDays} dagen geleden`;
      }

      return {
        id: post.id,
        title: post.title.rendered.replace(/&[^;]+;/g, ' ').trim(),
        excerpt: excerpt,
        author: author,
        publishedAt: publishedAt,
        imageUrl: featuredImage,
        category: category,
        isBreaking: isBreaking,
        readTime: `${Math.ceil(post.content.rendered.split(' ').length / 200)} min`
      };
    });

    return new Response(
      JSON.stringify({ articles }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch articles',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
