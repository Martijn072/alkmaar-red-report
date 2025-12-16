import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Author {
  name: string;
  articleCount: number;
}

export const useRecentAuthors = () => {
  return useQuery({
    queryKey: ["recent-authors"],
    queryFn: async (): Promise<Author[]> => {
      // Fetch articles from last 3 months
      const { data, error } = await supabase.functions.invoke("fetch-articles", {
        body: { perPage: 100 },
      });

      if (error) throw error;

      const articles = data?.articles || [];
      
      // Count articles per author
      const authorCounts = new Map<string, number>();
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      articles.forEach((article: { author: string; date: string }) => {
        const articleDate = new Date(article.date);
        if (articleDate >= threeMonthsAgo && article.author) {
          // Filter out generic fallback names
          if (article.author !== "AZFanpage Redactie" && article.author !== "Redactie") {
            const count = authorCounts.get(article.author) || 0;
            authorCounts.set(article.author, count + 1);
          }
        }
      });

      // Convert to array and sort by article count
      const authors: Author[] = Array.from(authorCounts.entries())
        .map(([name, articleCount]) => ({ name, articleCount }))
        .sort((a, b) => b.articleCount - a.articleCount);

      return authors;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
