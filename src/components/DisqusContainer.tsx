
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, ArrowRight } from 'lucide-react';

interface DisqusContainerProps {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  currentIdentifier: string;
  onLoadDisqus: () => void;
  onResetDisqus: () => void;
  isDarkMode: boolean;
}

export const DisqusContainer = ({
  isLoaded,
  isLoading,
  error,
  currentIdentifier,
  onLoadDisqus,
  onResetDisqus,
  isDarkMode
}: DisqusContainerProps) => {
  return (
    <>
      <h3 className="headline-premium text-headline-sm mb-4 text-az-black dark:text-white flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-az-red" />
        Reacties (Legacy Disqus)
        {currentIdentifier && (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
            ID: {currentIdentifier}
          </span>
        )}
      </h3>
      
      {/* Migration Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="headline-premium text-headline-sm text-blue-900 dark:text-blue-100 mb-2">
              Nieuw Comment Systeem Beschikbaar
            </h4>
            <p className="body-premium text-body-sm text-blue-800 dark:text-blue-200 mb-3">
              We hebben een nieuw, sneller comment systeem ontwikkeld dat beter integreert met onze app. 
              Het oude Disqus systeem blijft beschikbaar maar wordt binnenkort vervangen.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              size="sm"
            >
              Probeer Nieuwe Comments
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {!isLoaded && !isLoading && !error && (
        <div className="text-center py-8">
          <p className="body-premium text-body-md text-premium-gray-600 dark:text-gray-300 mb-4">
            Deel je mening over dit artikel met je medesupporters en doe dat op respectvolle wijze.
          </p>
          <Button 
            onClick={onLoadDisqus} 
            className="bg-az-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
          >
            <MessageCircle className="w-4 h-4" />
            Legacy Reacties laden
          </Button>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="body-premium text-body-md text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
          <Button 
            onClick={onResetDisqus} 
            variant="outline" 
            className="px-6 py-3 border-az-red text-az-red hover:bg-az-red hover:text-white transition-all duration-200"
          >
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Enhanced Disqus container with filter-based dark mode support */}
      {(isLoading || isLoaded) && (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-100 dark:border-gray-700 overflow-hidden ${isDarkMode ? 'disqus-dark-theme disqus-inverted' : 'disqus-light-theme'}`}>
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-az-red mx-auto mb-4" />
              <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-300">
                Legacy Disqus comments laden...
              </p>
            </div>
          )}
          <div 
            id="disqus_thread" 
            className={`p-4 min-h-[200px] ${isDarkMode ? 'disqus-dark-mode disqus-inverted' : ''}`}
          ></div>
        </div>
      )}

      {/* Debug info when loaded */}
      {isLoaded && currentIdentifier && (
        <div className="text-center mt-4">
          <p className="text-xs text-premium-gray-400 dark:text-gray-500">
            Powered by Disqus (Legacy) • Werkende identifier: {currentIdentifier} • Theme: {isDarkMode ? 'Dark (Inverted)' : 'Light'}
          </p>
        </div>
      )}
    </>
  );
};
