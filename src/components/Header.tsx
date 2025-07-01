
import { useState } from "react";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { HeaderMenu } from "./HeaderMenu";
import { SearchOverlay } from "./SearchOverlay";
import { useNotifications } from "@/hooks/useNotifications";

export const Header = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleNotificationClick = () => {
    navigate("/notificaties");
  };

  return (
    <>      
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-premium-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" 
                alt="AZ Fanpage Logo" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity focus:ring-2 focus:ring-az-red rounded"
                onClick={handleLogoClick}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSearchClick}
                className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
                aria-label="Zoeken"
              >
                <Search className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={handleNotificationClick}
                className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative focus:ring-2 focus:ring-az-red"
                aria-label="Notificaties"
              >
                <Bell className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-az-red text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                )}
              </button>
              <HeaderMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};
