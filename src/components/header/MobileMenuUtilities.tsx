
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, User } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";

interface MobileMenuUtilitiesProps {
  onSearchClick?: () => void;
}

export const MobileMenuUtilities = ({ onSearchClick }: MobileMenuUtilitiesProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useWordPressAuth();

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <>
      {/* User info on mobile - only show if authenticated */}
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

      {/* Mobile login if not authenticated */}
      {!isAuthenticated && (
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

      <DropdownMenuSeparator />
    </>
  );
};
