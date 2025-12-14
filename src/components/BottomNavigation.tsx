
import { Bell, Calendar, House, Trophy, MoreHorizontal, Newspaper } from "lucide-react";
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
    { id: "nieuws", label: "Nieuws", icon: Newspaper, path: "/nieuws" },
    { id: "wedstrijden", label: "Wedstrijden", icon: Calendar, path: "/wedstrijden" },
    { id: "standen", label: "Standen", icon: Trophy, path: "/standen" },
  ];

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/nieuws" || location.pathname === "/news" || location.pathname.startsWith("/artikel/")) return "nieuws";
    if (location.pathname === "/wedstrijden" || location.pathname === "/programma" || location.pathname.startsWith("/wedstrijd/")) return "wedstrijden";
    if (location.pathname === "/standen" || location.pathname === "/eredivisie" || location.pathname === "/conference-league" || location.pathname === "/jong-az") return "standen";
    
    // More sheet routes
    if (
      location.pathname === "/forum" ||
      location.pathname === "/selectie" || 
      location.pathname === "/spelers" ||
      location.pathname.startsWith("/speler/") ||
      location.pathname.startsWith("/selectie/") ||
      location.pathname === "/notification-settings" ||
      location.pathname === "/over"
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
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
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
