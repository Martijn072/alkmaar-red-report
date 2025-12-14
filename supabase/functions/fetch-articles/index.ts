import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchWordPressCategories, fetchWordPressArticles, fetchSingleWordPressArticle } from './wordpress-api.ts';
import { getCategoryIdByName } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { articleId, articleSlug, page = 1, perPage = 20, search = '', category = '', mode } = body;

    // Handle notifications mode - check for new articles and create notifications
    // This mode requires service role authentication (internal use only)
    if (mode === 'notifications') {
      // Validate service role key for internal notification operations
      const authHeader = req.headers.get('Authorization');
      const expectedServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!authHeader || !authHeader.includes(expectedServiceKey || '')) {
        console.log('🚫 Unauthorized attempt to access notifications mode');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Service role required for notifications mode' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('🔔 Running in notifications mode - checking for new articles...');
      console.log('🕐 Timestamp:', new Date().toISOString());
      
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Fetch recent articles from WordPress (last 24 hours worth)
      console.log('📡 Fetching articles from WordPress API...');
      const result = await fetchWordPressArticles(1, perPage, '', undefined);
      const articles = result.articles;

      console.log(`📰 Found ${articles.length} recent articles to check`);
      console.log('🔍 Article IDs:', articles.map(a => a.id).join(', '));

      // Check which articles we haven't processed yet
      const { data: processedArticles } = await supabaseClient
        .from('processed_articles')
        .select('article_id')
        .in('article_id', articles.map(a => a.id));

      const processedIds = new Set(processedArticles?.map(p => p.article_id) || []);
      const newArticles = articles.filter(article => !processedIds.has(article.id));

      console.log(`✨ Found ${newArticles.length} new articles to create notifications for`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Create notifications for new articles
      for (const article of newArticles) {
        console.log(`📝 Creating notification for article: ${article.title}`);

        try {
          // Create notification - always use article title without prefix
          const { error: notificationError } = await supabaseClient
            .from('notifications')
            .insert({
              type: article.isBreaking ? 'breaking' : 'article',
              title: article.title, // No prefix, just the clean title
              description: article.excerpt.length > 150 
                ? article.excerpt.substring(0, 147) + '...'
                : article.excerpt,
              icon: article.isBreaking ? '🚨' : '📰',
              article_id: article.id.toString(),
              thumbnail_url: article.imageUrl,
              read: false
            });

          if (notificationError) {
            console.error(`❌ Error creating notification for article ${article.id}:`, notificationError);
            errorCount++;
            errors.push(`Article ${article.id}: ${notificationError.message}`);
          } else {
            console.log(`✅ Notification created for article: ${article.title}`);
            successCount++;
          }

          // Mark article as processed
          const { error: trackingError } = await supabaseClient
            .from('processed_articles')
            .insert({
              article_id: article.id,
              article_title: article.title,
              article_url: `/artikel/${article.id}`
            });

          if (trackingError) {
            console.error(`❌ Error tracking article ${article.id}:`, trackingError);
          }
        } catch (articleError) {
          console.error(`❌ Unexpected error processing article ${article.id}:`, articleError);
          errorCount++;
          errors.push(`Article ${article.id}: ${articleError.message}`);
        }
      }

      console.log(`📊 Processing Summary:`);
      console.log(`   ✅ Successful notifications: ${successCount}`);
      console.log(`   ❌ Failed notifications: ${errorCount}`);
      console.log(`   📰 Total articles checked: ${articles.length}`);
      console.log(`   🆕 New articles found: ${newArticles.length}`);

      return new Response(
        JSON.stringify({ 
          success: errorCount === 0,
          message: `Processed ${articles.length} articles, created ${successCount} new notifications`,
          newArticles: newArticles.length,
          totalChecked: articles.length,
          successfulNotifications: successCount,
          failedNotifications: errorCount,
          errors: errors
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // If articleId or articleSlug is provided, fetch single article
    if (articleId || articleSlug) {
      const article = await fetchSingleWordPressArticle(articleId || articleSlug);

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
    
    let categoryId: number | undefined;

    // Handle category filtering with proper WordPress API integration
    if (category && category !== 'Alle' && category !== '') {
      console.log(`Category filter requested: ${category}`);
      
      // Fetch categories to get the correct ID
      const categories = await fetchWordPressCategories();
      const foundCategoryId = getCategoryIdByName(categories, category);
      
      if (foundCategoryId) {
        categoryId = foundCategoryId;
        console.log(`Using category ID ${categoryId} for category "${category}"`);
      } else {
        console.log(`Category "${category}" not found in WordPress, proceeding without category filter`);
      }
    }

    const result = await fetchWordPressArticles(page, perPage, search, categoryId);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-articles function:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Er is een fout opgetreden. Probeer het later opnieuw.'
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
