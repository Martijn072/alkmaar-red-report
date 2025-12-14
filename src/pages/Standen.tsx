import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EredivisieStandings } from "@/components/EredivisieStandings";
import { ConferenceLeagueStandings } from "@/components/ConferenceLeagueStandings";
import { EersteDivisieStandings } from "@/components/EersteDivisieStandings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2 } from "@/components/ui/typography";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { useEuropeanParticipation } from "@/hooks/useEuropeanParticipation";
import { Trophy, Globe, Users } from "lucide-react";

const Standen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("standen");
  
  const { data: teamId } = useAZTeamId();
  const { data: europeParticipation } = useEuropeanParticipation(teamId);
  
  const currentTab = searchParams.get("tab") || "eredivisie";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-s py-m md:py-l">
          <H2 className="text-foreground mb-m animate-fade-in">
            Standen
          </H2>
          
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-m bg-card border border-border sticky top-0 z-10">
              <TabsTrigger 
                value="eredivisie" 
                className="flex items-center gap-2 data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Eredivisie</span>
                <span className="sm:hidden">ED</span>
              </TabsTrigger>
              <TabsTrigger 
                value="europa" 
                className="flex items-center gap-2 data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Europa</span>
                <span className="sm:hidden">EU</span>
              </TabsTrigger>
              <TabsTrigger 
                value="jong-az" 
                className="flex items-center gap-2 data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Jong AZ</span>
                <span className="sm:hidden">JAZ</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="eredivisie" className="mt-0 animate-fade-in">
              <EredivisieStandings />
            </TabsContent>
            
            <TabsContent value="europa" className="mt-0 animate-fade-in">
              {europeParticipation?.active ? (
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {europeParticipation.competitionName} Stand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConferenceLeagueStandings />
                  </CardContent>
                </Card>
              ) : (
                <Card className="card-premium">
                  <CardContent className="py-12 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-lg">
                      AZ speelt dit seizoen niet Europees
                    </p>
                    <p className="text-muted-foreground/70 text-sm mt-2">
                      Of de Europese competitie is nog niet gestart
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="jong-az" className="mt-0 animate-fade-in">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Eerste Divisie Stand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EersteDivisieStandings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Standen;
