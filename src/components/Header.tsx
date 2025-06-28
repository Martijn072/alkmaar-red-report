
import { Bell, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-premium-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" 
              alt="AZ Fanpage Logo" 
              className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-premium-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-premium-gray-600" />
            </button>
            <button className="p-2 hover:bg-premium-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-premium-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-az-red rounded-full"></div>
            </button>
            <button className="p-2 hover:bg-premium-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-premium-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
