
import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchArticles } from "@/hooks/useSearchArticles";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useSearchArticles(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById("search-input");
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }, [isOpen]);

  const handleArticleClick = (articleId: number) => {
    navigate(`/artikel/${articleId}`);
    onClose();
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setDebouncedQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="flex items-start justify-center min-h-screen p-4 pt-20 bg-transparent">
        <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-border bg-card">
            <Search className="w-6 h-6 text-muted-foreground" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek in alle AZ nieuws..."
              className="flex-1 text-lg bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
            />
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto bg-card">
            {isLoading && debouncedQuery && (
              <div className="flex items-center justify-center py-8 bg-card">
                <Loader2 className="w-6 h-6 animate-spin text-az-red" />
                <span className="ml-2 text-muted-foreground">Zoeken...</span>
              </div>
            )}

            {!isLoading && debouncedQuery && searchResults?.length === 0 && (
              <div className="py-8 text-center bg-card">
                <p className="text-muted-foreground">
                  Geen artikelen gevonden voor "{debouncedQuery}"
                </p>
              </div>
            )}

            {!debouncedQuery && (
              <div className="py-8 text-center bg-card">
                <p className="text-muted-foreground">
                  Begin met typen om te zoeken in alle AZ nieuws
                </p>
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="divide-y divide-border bg-card">
                {searchResults.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="w-full p-4 text-left hover:bg-muted transition-colors bg-card"
                  >
                    <div className="flex gap-4">
                      {article.imageUrl && (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
