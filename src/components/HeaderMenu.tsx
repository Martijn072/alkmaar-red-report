
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, Home, Bell, Calendar, Table, MessageSquare, Users, Trophy, Settings, Search, Moon, Sun, User, LogOut } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderMenuProps {
  onSearchClick?: () => void;
}

export const HeaderMenu = ({ onSearchClick }: HeaderMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useWordPressAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isMobile = useIsMobile();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "news", label: "Nieuws", icon: Bell, path: "/nieuws" },
    { id: "programma", label: "Programma", icon: Calendar, path: "/programma" },
    { id: "forum", label: "Forum", icon: MessageSquare, path: "/forum" },
    { id: "eredivisie", label: "Eredivisie Stand", icon: Table, path: "/eredivisie" },
    { id: "spelers", label: "Speler Stats", icon: Users, path: "/spelers" },
    { id: "conference", label: "Conference League", icon: Trophy, path: "/conference-league" },
  ];

  const authMenuItems = [
    { id: "settings", label: "Instellingen", icon: Settings, path: "/instellingen/notificaties" },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
        >
          <Menu className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
      >
        {/* Mobile-only utilities */}
        {isMobile && (
          <>
            {/* User info on mobile */}
            {isAuthenticated && user && (
              <>
                <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-premium-gray-400" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-premium-gray-900 dark:text-white">
                      {user.display_name}
                    </span>
                    <span className="text-xs text-premium-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Search option for mobile */}
            <DropdownMenuItem
              onClick={handleSearchClick}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Zoeken</span>
            </DropdownMenuItem>

            {/* Dark mode toggle for mobile */}
            <DropdownMenuItem
              onClick={toggleDarkMode}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="font-medium">
                {isDarkMode ? "Lichte modus" : "Donkere modus"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        )}

        {/* Navigation items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red ${
                isActive 
                  ? 'bg-az-red/10 text-az-red dark:bg-az-red/20' 
                  : 'hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-az-red' : ''}`} />
              <span className={`font-medium ${isActive ? 'text-az-red' : ''}`}>
                {item.label}
              </span>
            </DropdownMenuItem>
          );
        })}
        
        {/* Authenticated user menu items */}
        {isAuthenticated && (
          <>
            <DropdownMenuSeparator />
            {authMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red ${
                    isActive 
                      ? 'bg-az-red/10 text-az-red dark:bg-az-red/20' 
                      : 'hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-az-red' : ''}`} />
                  <span className={`font-medium ${isActive ? 'text-az-red' : ''}`}>
                    {item.label}
                  </span>
                </DropdownMenuItem>
              );
            })}

            {/* Mobile logout */}
            {isMobile && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Uitloggen</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {/* Mobile login if not authenticated */}
        {isMobile && !isAuthenticated && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogin}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Inloggen</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
