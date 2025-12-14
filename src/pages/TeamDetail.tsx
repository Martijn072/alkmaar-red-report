
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTeamStatistics } from "@/hooks/useTeamStatistics";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamFixtures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FixtureCard } from "@/components/FixtureCard";
import { ArrowLeft, TrendingUp, Target, Shield } from "lucide-react";
import { useState } from "react";
import { getCurrentActiveSeason } from "@/utils/seasonUtils";

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("eredivisie");
  const seasonInfo = getCurrentActiveSeason();

  const { data: statistics, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useTeamStatistics(Number(teamId));
  const { data: recentFixtures, isLoading: recentLoading, error: recentError, refetch: refetchRecent } = useTeamFixtures(Number(teamId), 5);
  const { data: upcomingFixtures, isLoading: upcomingLoading, error: upcomingError, refetch: refetchUpcoming } = useTeamNextFixtures(Number(teamId), 3);

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
    if (leagueId === 88) return 'Eredivisie';
    if (leagueId === 94) return 'KNVB Beker';
    if (leagueId === 848) return 'Conference League';
    return leagueName;
  };

  const getCompetitionBadgeVariant = (leagueId: number) => {
    return "default" as const;
  };

  const translateRound = (round: string) => {
    const translations: { [key: string]: string } = {
      'Regular Season': 'Reguliere Competitie',
      'Playoffs': 'Play-offs',
      'Conference League': 'Conference League',
      'KNVB Beker': 'KNVB Beker'
    };
    
    // Check if it's a round number (e.g., "Round 1")
    if (round.includes('Round')) {
      return round.replace('Round', 'Speelronde');
    }
    
    return translations[round] || round;
  };

  const onFixtureClick = (fixtureId: number) => {
    navigate(`/wedstrijd/${fixtureId}`);
  };

  if (statsError || recentError || upcomingError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pb-20 pt-6">
          <ErrorMessage onRetry={() => {
            refetchStats();
            refetchRecent();
            refetchUpcoming();
          }} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pb-20 pt-6 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 px-0 text-az-red hover:text-az-red/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar stand
        </Button>

        {/* Team Header */}
        {statsLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : statistics ? (
          <Card className="bg-card border border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img 
                  src={statistics.team.logo} 
                  alt={statistics.team.name}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-az-black dark:text-white">
                    {statistics.team.name}
                  </h1>
                  <p className="text-premium-gray-600 dark:text-gray-300">
                    Eredivisie Seizoen {seasonInfo.displaySeason}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

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
                      {statistics.fixtures.played.total} / {statistics.fixtures.wins.total}
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
                      {statistics.goals.for.total.total} / {statistics.goals.against.total.total}
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
                      {statistics.clean_sheet.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

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
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default TeamDetail;
