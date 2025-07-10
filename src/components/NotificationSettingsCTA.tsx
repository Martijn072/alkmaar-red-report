
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Smartphone } from "lucide-react";

const NotificationSettingsCTA = () => {
  const navigate = useNavigate();

  return (
    <Card className="border border-az-red/20 bg-gradient-to-r from-az-red/5 to-az-red/10 dark:from-az-red/10 dark:to-az-red/15">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-az-red/10 dark:bg-az-red/20 rounded-full">
              <Settings className="h-5 w-5 text-az-red" />
            </div>
            <div>
              <h3 className="headline-premium text-headline-sm text-az-black dark:text-white font-semibold mb-1">
                Personaliseer je notificaties
              </h3>
              <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-400">
                Bepaal zelf welke updates je wilt ontvangen en wanneer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-premium-gray-500 dark:text-gray-500">
              <Bell className="h-4 w-4" />
              <Smartphone className="h-4 w-4" />
            </div>
            <Button 
              onClick={() => navigate('/instellingen/notificaties')}
              className="bg-az-red hover:bg-az-red/90 text-white px-4 py-2 text-sm font-semibold"
            >
              <span className="hidden sm:inline">Instellingen bekijken</span>
              <span className="sm:hidden">Instellingen</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsCTA;
