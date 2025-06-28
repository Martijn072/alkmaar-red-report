
import { useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LiveScore } from "@/components/LiveScore";
import { CategoryFilter } from "@/components/CategoryFilter";

const mockNews = [
  {
    id: 1,
    title: "AZ verslaat PSV met 2-1 in spektakelstuk",
    excerpt: "In een adembenemende wedstrijd in het AFAS Stadion wist AZ Alkmaar PSV Eindhoven te verslaan met 2-1. Een fantastische prestatie van de Alkmaarders.",
    author: "Marco van der Berg",
    publishedAt: "2 uur geleden",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    category: "Wedstrijdverslag",
    isBreaking: true,
    readTime: "4 min"
  },
  {
    id: 2,
    title: "Transfernieuws: AZ jaagt op nieuwe spits",
    excerpt: "AZ Alkmaar is actief op de transfermarkt en zoekt versterking voor de aanval. Verschillende opties worden onderzocht door technisch directeur Max Huiberts.",
    author: "Linda Hofstra",
    publishedAt: "5 uur geleden",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
    category: "Transfer",
    isBreaking: false,
    readTime: "3 min"
  },
  {
    id: 3,
    title: "Jeugdopleiding AZ opnieuw in de prijzen",
    excerpt: "De jeugdopleiding van AZ Alkmaar heeft wederom een prestigieuze prijs gewonnen. Een bewijs van de uitstekende werking van de academie.",
    author: "Peter Jansen",
    publishedAt: "1 dag geleden",
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop",
    category: "Jeugd",
    isBreaking: false,
    readTime: "2 min"
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [selectedCategory, setSelectedCategory] = useState("Alles");

  const categories = ["Alles", "Wedstrijdverslag", "Transfer", "Jeugd", "Interviews"];

  return (
    <div className="min-h-screen bg-premium-gray-50">
      <Header />
      
      {/* Live Score Widget */}
      <LiveScore />
      
      <div className="px-4 pb-20 pt-6">
        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Breaking News Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="breaking-news">🔥 Breaking</span>
            <span className="text-premium-gray-600 text-sm">Laatste nieuws</span>
          </div>
        </div>

        {/* News Feed */}
        <div className="space-y-6">
          {mockNews
            .filter(article => selectedCategory === "Alles" || article.category === selectedCategory)
            .map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="btn-secondary">
            Meer nieuws laden
          </button>
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
