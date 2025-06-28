
import { Bell, Calendar, MessageSquare, MoreHorizontal, House } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: House, path: "/" },
    { id: "news", label: "Nieuws", icon: Bell, path: "/nieuws" },
    { id: "live", label: "Live", icon: Calendar, path: "#" },
    { id: "more", label: "Meer", icon: MoreHorizontal, path: "#" },
  ];

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/nieuws") return "news";
    return activeTab;
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tab: any) => {
    if (tab.path !== "#") {
      navigate(tab.path);
    }
    onTabChange(tab.id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-premium-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentActiveTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-az-red bg-red-50' 
                  : 'text-premium-gray-600 hover:text-premium-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-az-red' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-az-red' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
