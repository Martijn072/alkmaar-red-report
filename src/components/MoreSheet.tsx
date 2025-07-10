
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, MessageSquare, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MoreSheetProps {
  children: React.ReactNode;
}

export const MoreSheet = ({ children }: MoreSheetProps) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: MessageSquare,
      label: "Forum",
      path: "/forum",
      description: "Discussie en community"
    },
    {
      icon: Bell,
      label: "Notificaties",
      path: "/notificaties",
      description: "Beheer je notificatie-instellingen"
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-bold text-az-black dark:text-white">
            Meer opties
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 hover:bg-az-red/5 dark:hover:bg-az-red/10 hover:border-az-red/20 dark:hover:border-az-red/30 transition-all duration-200 text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center group-hover:bg-az-red/15 dark:group-hover:bg-az-red/25 transition-colors">
                  <Icon className="w-5 h-5 text-az-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-az-black dark:text-white group-hover:text-az-red transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-premium-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>AZ Fanpage v1.0</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
