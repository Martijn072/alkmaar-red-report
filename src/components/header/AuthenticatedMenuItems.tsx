
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const AuthenticatedMenuItems = () => {
  const navigate = useNavigate();
  const { logout } = useWordPressAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile logout - only show logout for authenticated users on mobile */}
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
  );
};
