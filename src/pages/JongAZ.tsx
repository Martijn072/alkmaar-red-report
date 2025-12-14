
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FixtureCard } from "@/components/FixtureCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Shield, Trophy } from "lucide-react";
import { getCurrentActiveSeason } from "@/utils/seasonUtils";
import { useLeagueIdByName } from "@/hooks/useLeagueId";
import { 
  useJongAZTeamId, 
  useJongAZFixtures, 
  useJongAZNextFixtures, 
  useJongAZStatistics,
  useEersteDivisieStandings 
} from "@/hooks/useJongAZHooks";

const JongAZ = () => {
  const [activeTab, setActiveTab] = useState("eredivisie");
  const seasonInfo = getCurrentActiveSeason();

  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useLeagueIdByName('Netherlands', 'Eerste Divisie');
  const { data: teamId, isLoading: teamIdLoading, error: teamIdError, refetch: refetchTeamId } = useJongAZTeamId();
  const { data: recentFixtures, isLoading: recentLoading, error: recentError, refetch: refetchRecent } = useJongAZFixtures(teamId, 5);
  const { data: upcomingFixtures, isLoading: upcomingLoading, error: upcomingError, refetch: refetchUpcoming } = useJongAZNextFixtures(teamId, 3);
  const { data: statistics, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useJongAZStatistics(teamId);
  const { data: standings, isLoading: standingsLoading, error: standingsError, refetch: refetchStandings } = useEersteDivisieStandings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompetitionName = (leagueId: number, leagueName: string) => {
    // Use the actual league name from the API
    return leagueData?.name || leagueName || 'Eerste Divisie';
  };

  const getCompetitionBadgeVariant = (leagueId: number) => {
    return "default" as const;
  };

  const translateRound = (round: string) => {
    const translations: { [key: string]: string } = {
      'Regular Season': 'Reguliere Competitie',
      'Playoffs': 'Play-offs'
    };
    
    if (round.includes('Round')) {
      return round.replace('Round', 'Speelronde');
    }
    
    return translations[round] || round;
  };

  const onFixtureClick = (fixtureId: number) => {
    // Navigate to fixture detail if needed
    console.log('Fixture clicked:', fixtureId);
  };

  const hasErrors = leagueError || teamIdError || recentError || upcomingError || statsError || standingsError;

  if (hasErrors) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pb-20 pt-6">
          <ErrorMessage onRetry={() => {
            refetchTeamId();
            refetchRecent();
            refetchUpcoming();
            refetchStats();
            refetchStandings();
          }} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Find Jong AZ position in standings
  const jongAZPosition = standings?.find(team => team.team.id === teamId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pb-20 pt-6 space-y-6">
        {/* Jong AZ Header */}
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-az-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">Jong AZ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-az-black dark:text-white">
                  Jong AZ
                </h1>
                <p className="text-premium-gray-600 dark:text-gray-300">
                  {leagueData?.name || 'Eerste Divisie'} Seizoen {seasonInfo.displaySeason}
                </p>
                {jongAZPosition && (
                  <Badge variant="outline" className="mt-1">
                    {jongAZPosition.rank}e plaats - {jongAZPosition.points} punten
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-300">Gespeeld / Gewonnen</p>
                    <p className="text-2xl font-bold text-az-black dark:text-white">
                      {statistics.fixtures?.played?.total || 0} / {statistics.fixtures?.wins?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-az-red" />
                  <div>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-300">Doelpunten Voor/Tegen</p>
                    <p className="text-2xl font-bold text-az-black dark:text-white">
                      {statistics.goals?.for?.total?.total || 0} / {statistics.goals?.against?.total?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-premium-gray-600 dark:text-gray-300">Clean Sheets</p>
                    <p className="text-2xl font-bold text-az-black dark:text-white">
                      {statistics.clean_sheet?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <p className="text-premium-gray-600 dark:text-gray-300">
                  Statistieken nog niet beschikbaar
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Results */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-az-black dark:text-white">Recente Resultaten</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : recentFixtures && recentFixtures.length > 0 ? (
              <div className="space-y-4">
                {recentFixtures.slice(0, 5).map((fixture) => (
                  <FixtureCard
                    key={fixture.fixture.id}
                    fixture={fixture}
                    onFixtureClick={onFixtureClick}
                    formatDate={formatDate}
                    getCompetitionName={getCompetitionName}
                    getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                    translateRound={translateRound}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-premium-gray-600 dark:text-gray-300">
                Geen recente wedstrijden beschikbaar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Fixtures */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-az-black dark:text-white">Komende Wedstrijden</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
              <div className="space-y-4">
                {upcomingFixtures.slice(0, 3).map((fixture) => (
                  <FixtureCard
                    key={fixture.fixture.id}
                    fixture={fixture}
                    onFixtureClick={onFixtureClick}
                    formatDate={formatDate}
                    getCompetitionName={getCompetitionName}
                    getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                    translateRound={translateRound}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-premium-gray-600 dark:text-gray-300">
                Geen komende wedstrijden beschikbaar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Eerste Divisie Standings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-az-black dark:text-white">
              <Trophy className="w-5 h-5" />
              {leagueData?.name || 'Eerste Divisie'} Stand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {standingsLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : standings && standings.length > 0 ? (
              <div className="space-y-2">
                {standings.slice(0, 10).map((team) => (
                  <div
                    key={team.team.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      team.team.id === teamId
                        ? 'bg-az-red/10 border-az-red dark:bg-az-red/20'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        team.team.id === teamId
                          ? 'bg-az-red text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {team.rank}
                      </div>
                      <img 
                        src={team.team.logo} 
                        alt={team.team.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className={`font-medium ${
                        team.team.id === teamId
                          ? 'text-az-red dark:text-az-red'
                          : 'text-az-black dark:text-white'
                      }`}>
                        {team.team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-premium-gray-600 dark:text-gray-300">
                        {team.all.played}
                      </span>
                      <span className={`font-bold ${
                        team.team.id === teamId
                          ? 'text-az-red'
                          : 'text-az-black dark:text-white'
                      }`}>
                        {team.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-premium-gray-600 dark:text-gray-300">
                Geen stand beschikbaar
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default JongAZ;
