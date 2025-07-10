
import { Bell, Calendar, House, Table, MessageSquare, MoreHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MoreSheet } from "./MoreSheet";

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
    { id: "programma", label: "Programma", icon: Calendar, path: "/programma" },
    { id: "eredivisie", label: "Stand", icon: Table, path: "/eredivisie" },
  ];

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/nieuws") return "news";
    if (location.pathname === "/programma") return "programma";
    if (location.pathname === "/eredivisie") return "eredivisie";
    
    // More sheet routes
    if (
      location.pathname === "/forum" ||
      location.pathname === "/spelers" || 
      location.pathname === "/conference-league" || 
      location.pathname === "/notificaties"
    ) {
      return "meer";
    }
    
    return activeTab;
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tab: any) => {
    navigate(tab.path);
    onTabChange(tab.id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-premium-gray-200 dark:border-gray-700 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentActiveTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors focus:ring-2 focus:ring-az-red ${
                isActive 
                  ? 'text-az-red bg-az-red/10 dark:bg-az-red/20' 
                  : 'text-premium-gray-600 dark:text-gray-300 hover:text-premium-gray-800 dark:hover:text-gray-100 hover:bg-premium-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-az-red' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-az-red' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        
        {/* Meer tab with sheet */}
        <MoreSheet>
          <button
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors focus:ring-2 focus:ring-az-red ${
              currentActiveTab === "meer"
                ? 'text-az-red bg-az-red/10 dark:bg-az-red/20' 
                : 'text-premium-gray-600 dark:text-gray-300 hover:text-premium-gray-800 dark:hover:text-gray-100 hover:bg-premium-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${currentActiveTab === "meer" ? 'text-az-red' : ''}`} />
            <span className={`text-xs font-medium ${currentActiveTab === "meer" ? 'text-az-red' : ''}`}>
              Meer
            </span>
          </button>
        </MoreSheet>
      </div>
    </nav>
  );
};
