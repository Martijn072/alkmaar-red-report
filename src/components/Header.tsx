
import { useState } from "react";
import { Bell, Search, Moon, Sun, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { HeaderMenu } from "./HeaderMenu";
import { SearchOverlay } from "./SearchOverlay";
import { useNotifications } from "@/hooks/useNotifications";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, isAuthenticated, logout } = useWordPressAuth();
  const isMobile = useIsMobile();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleNotificationClick = () => {
    navigate("/notificaties");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
                alt="AZ Fanpage - Officiële fansite van AZ Alkmaar" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity focus:ring-2 focus:ring-az-red rounded"
                onClick={handleLogoClick}
                role="img"
              />
            </div>

            {/* Mobile Actions - User avatar, notifications, dark mode, and hamburger menu */}
            {isMobile ? (
              <div className="flex items-center gap-3">
                {/* User Avatar on Mobile */}
                {isAuthenticated && user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full p-0"
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Uitloggen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Notifications */}
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

                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
                  aria-label={isDarkMode ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                  )}
                </button>

                {/* Hamburger Menu */}
                <HeaderMenu onSearchClick={handleSearchClick} />
              </div>
            ) : (
              /* Desktop Actions - All original actions */
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
                  aria-label={isDarkMode ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                  )}
                </button>
                {/* User Profile / Login */}
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Uitloggen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={handleLogin}
                    variant="ghost"
                    size="sm"
                    className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red dark:hover:text-az-red"
                  >
                    Inloggen
                  </Button>
                )}
                <HeaderMenu />
              </div>
            )}
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
