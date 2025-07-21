
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavigationMenuItems } from "./header/NavigationMenuItems";
import { AuthenticatedMenuItems } from "./header/AuthenticatedMenuItems";
import { MobileMenuUtilities } from "./header/MobileMenuUtilities";

interface HeaderMenuProps {
  onSearchClick?: () => void;
}

export const HeaderMenu = ({ onSearchClick }: HeaderMenuProps) => {
  const { isAuthenticated } = useWordPressAuth();
  const isMobile = useIsMobile();

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
          <MobileMenuUtilities onSearchClick={onSearchClick} />
        )}

        {/* Navigation items */}
        <NavigationMenuItems />
        
        {/* Authenticated user menu items */}
        {isAuthenticated && <AuthenticatedMenuItems />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
