
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { useEuropeanParticipation } from "@/hooks/useEuropeanParticipation";
import { ConferenceLeagueStandings } from "@/components/ConferenceLeagueStandings";
import { ConferenceLeagueFixtures } from "@/components/ConferenceLeagueFixtures";
import { Trophy, Calendar, Target, AlertCircle } from "lucide-react";

const ConferenceLeague = () => {
  const [activeTab, setActiveTab] = useState("europa");
  const { data: teamId, isLoading: teamIdLoading, error: teamIdError, refetch: refetchTeamId } = useAZTeamId();
  const { data: participation, isLoading: participationLoading, error: participationError } = useEuropeanParticipation(teamId);

  if (teamIdError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20 bg-background">
          <ErrorMessage onRetry={() => refetchTeamId()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'kwalificatie':
        return <Target className="w-5 h-5 text-yellow-500" />;
      case 'poulefase':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'knock-out':
        return <Trophy className="w-5 h-5 text-az-red" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'kwalificatie':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'poulefase':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'knock-out':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'kwalificatie':
        return 'Kwalificatieronde';
      case 'poulefase':
        return 'Poulefase';
      case 'knock-out':
        return 'Knock-outfase';
      default:
        return 'Niet deelnemend';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 pb-20 pt-6 bg-background min-h-screen">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-az-black dark:text-white">AZ in Europa</h1>
        </div>

        {/* AZ in Europa Status */}
        <div className="mb-8">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-az-black dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-az-red" />
                AZ in Europa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamIdLoading || participationLoading ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ) : participationError ? (
                <p className="text-premium-gray-600 dark:text-gray-300">
                  Kan Europese status niet laden
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  {getStatusIcon(participation?.status || 'niet-actief')}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(participation?.status || 'niet-actief')}>
                        {getStatusText(participation?.status || 'niet-actief')}
                      </Badge>
                      {participation?.competitionName && (
                        <span className="text-sm text-premium-gray-600 dark:text-gray-300">
                          {participation.competitionName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-300">
                      {participation?.active 
                        ? `AZ speelt momenteel in de ${participation.competitionName}`
                        : 'AZ neemt dit seizoen niet deel aan Europese competities'
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aankomende Europese Wedstrijden */}
        <div className="mb-8">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-az-black dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-az-red" />
                Aankomende Europese Wedstrijden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConferenceLeagueFixtures teamId={teamId} isLoadingTeamId={teamIdLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Voortgang naar Conference League / Stand */}
        <div className="mb-8">
          {participation?.status === 'poulefase' ? (
            <Card className="bg-card border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
              </CardHeader>
              <CardContent>
                <ConferenceLeagueStandings />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-az-black dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-az-red" />
                  Voortgang naar Conference League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {participation?.active ? (
                    <div>
                      <p className="text-premium-gray-600 dark:text-gray-300 mb-2">
                        AZ speelt momenteel in de {participation.status}
                      </p>
                      <p className="text-sm text-premium-gray-500 dark:text-gray-400">
                        De stand wordt zichtbaar wanneer AZ zich plaatst voor de poulefase
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-premium-gray-600 dark:text-gray-300 mb-2">
                        AZ neemt dit seizoen niet deel aan Europese competities
                      </p>
                      <p className="text-sm text-premium-gray-500 dark:text-gray-400">
                        Volg de Eredivisie stand voor kwalificatieplaatsen voor volgend seizoen
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ConferenceLeague;
