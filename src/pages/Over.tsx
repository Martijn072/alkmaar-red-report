
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Heart, Users, Trophy, Calendar } from "lucide-react";

const Over = () => {
  const [activeTab, setActiveTab] = useState("meer");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pb-20 pt-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Info Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-az-red" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-az-black dark:text-white">
                    AZ Fanpage
                  </CardTitle>
                  <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                    Versie 1.0
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-premium-gray-700 dark:text-gray-300 leading-relaxed">
                De officiële fansite voor AZ Alkmaar supporters. Blijf op de hoogte van het laatste nieuws, 
                wedstrijdprogramma, statistieken en discussieer mee in onze community.
              </p>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-az-black dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-az-red" />
                Functies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-az-red" />
                  </div>
                  <div>
                    <h3 className="font-medium text-az-black dark:text-white">Live wedstrijdinfo</h3>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                      Programma, uitslagen en live scores
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-az-red" />
                  </div>
                  <div>
                    <h3 className="font-medium text-az-black dark:text-white">Competitie standen</h3>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                      Eredivisie en Conference League
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-az-red" />
                  </div>
                  <div>
                    <h3 className="font-medium text-az-black dark:text-white">Community forum</h3>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                      Discussieer met andere AZ fans
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact/Support Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-az-black dark:text-white">
                Contact & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-premium-gray-700 dark:text-gray-300">
                Deze app is gemaakt door en voor AZ fans. Voor vragen of suggesties kun je ons bereiken 
                via het forum of social media kanalen.
              </p>
              <div className="mt-4 pt-4 border-t border-premium-gray-200 dark:border-gray-600">
                <p className="text-sm text-premium-gray-500 dark:text-gray-400">
                  © 2024 AZ Fanpage - Niet officieel gelieerd aan AZ Alkmaar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Over;
