
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

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

const transformPost = (post: WordPressPost) => {
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
    content: post.content.rendered, // Full content for article detail
    author: author,
    publishedAt: publishedAt,
    imageUrl: featuredImage,
    category: category,
    isBreaking: isBreaking,
    readTime: `${Math.ceil(post.content.rendered.split(' ').length / 200)} min`
  };
};

const fetchWordPressCategories = async (): Promise<WordPressCategory[]> => {
  try {
    const response = await fetch('https://azfanpage.nl/wp-json/wp/v2/categories?per_page=100', {
      headers: { 'User-Agent': 'AZFanpage-App/1.0' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status);
      return [];
    }
    
    const categories: WordPressCategory[] = await response.json();
    console.log(`Fetched ${categories.length} categories from WordPress`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const getCategoryIdByName = (categories: WordPressCategory[], categoryName: string): number | null => {
  // Create mapping for common category variations
  const categoryMappings: { [key: string]: string[] } = {
    'Wedstrijdverslag': ['Wedstrijdverslag', 'Wedstrijden', 'Match Report'],
    'Transfer': ['Transfer', 'Transfers'],
    'Jeugd': ['Jeugd', 'Youth', 'Jeugdteams'],
    'Interviews': ['Interviews', 'Interview'],
    'Nieuws': ['Nieuws', 'News', 'Algemeen']
  };

  // First try exact match
  let category = categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  // If no exact match, try mapped variations
  if (!category) {
    const variations = categoryMappings[categoryName] || [categoryName];
    for (const variation of variations) {
      category = categories.find(cat => 
        cat.name.toLowerCase().includes(variation.toLowerCase()) ||
        cat.slug.toLowerCase().includes(variation.toLowerCase())
      );
      if (category) break;
    }
  }

  return category?.id || null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { articleId, page = 1, perPage = 20, search = '', category = '' } = body;

    // If articleId is provided, fetch single article
    if (articleId) {
      console.log(`Fetching single article ${articleId} from azfanpage.nl WordPress API...`);
      
      const response = await fetch(
        `https://azfanpage.nl/wp-json/wp/v2/posts/${articleId}?_embed`,
        {
          headers: {
            'User-Agent': 'AZFanpage-App/1.0',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch article from WordPress API:', response.status, response.statusText);
        throw new Error(`WordPress API returned ${response.status}`);
      }

      const post: WordPressPost = await response.json();
      console.log(`Successfully fetched article ${articleId}`);

      const article = transformPost(post);

      return new Response(
        JSON.stringify({ article }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Otherwise, fetch list of articles with pagination and search
    console.log(`Fetching articles from azfanpage.nl WordPress API... Page: ${page}, Per page: ${perPage}`);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      '_embed': 'true',
      'per_page': perPage.toString(),
      'page': page.toString(),
      'orderby': 'date',
      'order': 'desc'
    });

    // Add search parameter if provided
    if (search) {
      queryParams.append('search', search);
      console.log(`Search query: ${search}`);
    }

    // Handle category filtering with proper WordPress API integration
    if (category && category !== 'Alle' && category !== '') {
      console.log(`Category filter requested: ${category}`);
      
      // Fetch categories to get the correct ID
      const categories = await fetchWordPressCategories();
      const categoryId = getCategoryIdByName(categories, category);
      
      if (categoryId) {
        queryParams.append('categories', categoryId.toString());
        console.log(`Using category ID ${categoryId} for category "${category}"`);
      } else {
        console.log(`Category "${category}" not found in WordPress, proceeding without category filter`);
      }
    }

    const response = await fetch(
      `https://azfanpage.nl/wp-json/wp/v2/posts?${queryParams.toString()}`,
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

    // Get total count from headers
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

    const posts: WordPressPost[] = await response.json();
    console.log(`Successfully fetched ${posts.length} articles for page ${page}`);

    const articles = posts.map(transformPost);

    return new Response(
      JSON.stringify({ 
        articles,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalPosts: totalPosts,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }),
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
