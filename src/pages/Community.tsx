
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MediaUpload } from "@/components/MediaUpload";
import { MediaCard } from "@/components/MediaCard";
import { useSupporterMedia } from "@/hooks/useSupporterMedia";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Users, TrendingUp, Clock, Trophy } from "lucide-react";

const Community = () => {
  const [activeTab, setActiveTab] = useState("community");
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  
  const { data: media, isLoading, error, refetch } = useSupporterMedia(sortBy);

  console.log('Community page rendering with new media system');

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="headline-premium text-headline-lg text-az-black dark:text-white font-bold flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-az-red" />
              AZ Community
            </h1>
            <p className="text-premium-gray-600 dark:text-gray-400">
              Deel je mooiste AZ momenten met andere supporters!
            </p>
          </div>

          {/* Upload Section */}
          <div className="animate-fade-in">
            <MediaUpload />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-2 ${
                sortBy === 'recent' 
                  ? 'bg-az-red hover:bg-red-700 text-white' 
                  : 'border-premium-gray-300 hover:bg-az-red/5 hover:border-az-red/30 hover:text-az-red'
              }`}
            >
              <Clock className="w-4 h-4" />
              Nieuwste
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-2 ${
                sortBy === 'popular' 
                  ? 'bg-az-red hover:bg-red-700 text-white' 
                  : 'border-premium-gray-300 hover:bg-az-red/5 hover:border-az-red/30 hover:text-az-red'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Populair
            </Button>
          </div>

          {/* Media Gallery */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-premium-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Fout bij laden van media
                  </h3>
                  <p className="text-red-500 dark:text-red-400 mb-4">
                    {error.message}
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Probeer opnieuw
                  </Button>
                </div>
              </div>
            ) : !media || media.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-premium-gray-100 dark:bg-gray-800 rounded-lg p-8">
                  <Trophy className="w-12 h-12 text-premium-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-premium-gray-600 dark:text-gray-300 mb-2">
                    Nog geen media gedeeld
                  </h3>
                  <p className="text-premium-gray-500 dark:text-gray-400">
                    Wees de eerste om je AZ moment te delen!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {media.map((item, index) => (
                  <div 
                    key={item.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <MediaCard media={item} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Info */}
          <div className="mt-8 bg-az-red/5 dark:bg-az-red/10 border border-az-red/20 dark:border-az-red/30 rounded-lg p-4">
            <h4 className="font-semibold text-az-red dark:text-az-red mb-2">
              🏆 Foto van de Week
            </h4>
            <p className="text-sm text-premium-gray-700 dark:text-gray-300">
              De foto/video met de meeste stemmen wordt wekelijks uitgelicht als "Foto van de Week"!
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Community;
