import { useState, useEffect, useRef } from "react";
import { MessageSquare, RefreshCw, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";

const Forum = () => {
  const [activeTab, setActiveTab] = useState("forum");
  const [isLoading, setIsLoading] = useState(true);
  const [webviewError, setWebviewError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const forumUrl = "https://www.azfanpage.nl/forum/";

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        setIsLoading(false);
        setWebviewError(false);
      };

      const handleError = () => {
        setIsLoading(false);
        setWebviewError(true);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Set a timeout to stop loading state after reasonable time
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 8000);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };
    }
  }, []);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setWebviewError(false);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInBrowser = () => {
    window.open(forumUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Forum Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-az-red" />
          <h1 className="text-lg font-bold text-az-black dark:text-white">
            AZ Forum
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={openInBrowser}
            className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Forum Content */}
      <div className="flex-1 relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-az-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-premium-gray-600 dark:text-gray-400">
                Forum laden...
              </p>
            </div>
          </div>
        )}

        {webviewError ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-premium-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-premium-gray-600 dark:text-gray-300 mb-2">
                Forum niet beschikbaar
              </h3>
              <p className="text-premium-gray-500 dark:text-gray-400 mb-6">
                Het forum kan momenteel niet worden geladen.
              </p>
              <div className="space-y-3">
                <Button onClick={handleRefresh} className="w-full bg-az-red hover:bg-red-700">
                  Opnieuw proberen
                </Button>
                <Button variant="outline" onClick={openInBrowser} className="w-full">
                  Open in browser
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={forumUrl}
            className="w-full h-full border-0"
            title="AZ Forum"
            style={{ minHeight: 'calc(100vh - 140px)' }}
            allowFullScreen
          />
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Forum;