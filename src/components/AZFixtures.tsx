import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { FixtureCard } from './FixtureCard';

const currentSeason = '2025';
const seasons = [
  { value: '2025', label: '2025-2026' },
  { value: '2024', label: '2024-2025' },
  { value: '2023', label: '2023-2024' },
  { value: '2022', label: '2022-2023' },
];

interface AZFixturesProps {
  teamId: number | null;
  isLoadingTeamId: boolean;
}

export const AZFixtures = ({ teamId, isLoadingTeamId }: AZFixturesProps) => {
  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason);
  const navigate = useNavigate();

  // Fetch upcoming fixtures for current season
  const { data: upcomingFixtures, isLoading: upcomingLoading, error: upcomingError } = useQuery({
    queryKey: ['az-upcoming-fixtures', teamId],
    queryFn: async () => {
      if (!teamId || selectedSeason !== currentSeason) return [];
      
      console.log('🔮 Fetching upcoming AZ fixtures...');
      const params: Record<string, string> = {
        team: teamId.toString(),
        next: '20', // Get next 20 fixtures
        timezone: 'Europe/Amsterdam'
      };

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 Upcoming Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && selectedSeason === currentSeason,
    staleTime: 1000 * 60 * 15,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch historical fixtures for non-current seasons
  const { data: historicalFixtures, isLoading: historicalLoading, error: historicalError } = useQuery({
    queryKey: ['az-historical-fixtures', teamId, selectedSeason],
    queryFn: async () => {
      if (!teamId || selectedSeason === currentSeason) return [];
      
      console.log(`🏆 Fetching AZ fixtures for season ${selectedSeason}...`);
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: selectedSeason
      };

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 Historical Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && selectedSeason !== currentSeason,
    staleTime: 1000 * 60 * 15,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translateRound = (round: string) => {
    // Handle common round terminology
    if (round.toLowerCase().includes('regular season')) return 'Competitie';
    if (round.toLowerCase().includes('semi-final')) return 'Halve finale';
    if (round.toLowerCase().includes('final') && !round.toLowerCase().includes('semi')) return 'Finale';
    if (round.toLowerCase().includes('quarter-final')) return 'Kwartfinale';
    if (round.toLowerCase().includes('round of 16')) return 'Achtste finale';
    if (round.toLowerCase().includes('round of 32')) return '1/16e finale';
    if (round.toLowerCase().includes('play-off')) return 'Play-offs';
    
    // Handle numbered rounds (e.g., "Regular Season - 15")
    const roundMatch = round.match(/Regular Season - (\d+)/i);
    if (roundMatch) return `Speelronde ${roundMatch[1]}`;
    
    // Handle "Matchday X" format
    const matchdayMatch = round.match(/Matchday (\d+)/i);
    if (matchdayMatch) return `Speeldag ${matchdayMatch[1]}`;
    
    // Return original if no translation found
    return round;
  };

  const getCompetitionName = (leagueId: number, leagueName: string) => {
    switch (leagueId) {
      case 88: return 'Eredivisie';
      case 848: return 'Conference League';
      case 94: return 'KNVB Beker';
      default: return leagueName;
    }
  };

  const getCompetitionBadgeVariant = (leagueId: number) => {
    switch (leagueId) {
      case 88: return 'default'; // Eredivisie - primary red
      case 848: return 'secondary'; // Conference League
      case 94: return 'destructive'; // KNVB Beker - orange theme
      default: return 'outline';
    }
  };

  const isCurrentSeason = selectedSeason === currentSeason;
  const isLoading = isCurrentSeason ? (upcomingLoading || historicalLoading) : historicalLoading;
  const error = upcomingError || historicalError;

  // Separate upcoming and played fixtures for current season
  const upcoming = upcomingFixtures || [];
  const played = isCurrentSeason 
    ? historicalFixtures?.filter(fixture => 
        fixture.goals.home !== null && fixture.goals.away !== null
      ) || []
    : historicalFixtures || []; // For historical seasons, show all fixtures
  const sortedUpcoming = upcoming.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
  const sortedPlayed = played.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

  const handleFixtureClick = (fixtureId: number) => {
    navigate(`/wedstrijd/${fixtureId}`);
  };

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">AZ Wedstrijdprogramma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
              Fout bij het laden van het wedstrijdprogramma
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-az-red hover:bg-az-red/90 text-white"
            >
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isLoadingTeamId) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">AZ Wedstrijdprogramma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-az-black dark:text-white">AZ Wedstrijdprogramma</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-premium-gray-600 dark:text-gray-400" />
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-premium-gray-300 dark:border-gray-600 text-az-black dark:text-white focus:ring-2 focus:ring-az-red focus:border-az-red hover:bg-premium-gray-50 dark:hover:bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-premium-gray-300 dark:border-gray-600 z-50">
                  {seasons.map((season) => (
                    <SelectItem 
                      key={season.value} 
                      value={season.value}
                      className="text-az-black dark:text-white hover:bg-premium-gray-50 dark:hover:bg-gray-700 focus:bg-az-red focus:text-white"
                    >
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-white dark:bg-gray-800">
        {isCurrentSeason && sortedUpcoming.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-az-black dark:text-white mb-4">
              Aankomende wedstrijden
            </h3>
            <div className="space-y-4">
              {sortedUpcoming.map((fixture) => (
                <FixtureCard 
                  key={`upcoming-${fixture.fixture.id}`} 
                  fixture={fixture} 
                  onFixtureClick={handleFixtureClick}
                  formatDate={formatDate}
                  getCompetitionName={getCompetitionName}
                  getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                  translateRound={translateRound}
                />
              ))}
            </div>
          </div>
        )}

        {sortedPlayed.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-az-black dark:text-white mb-4">
              {isCurrentSeason ? 'Gespeelde wedstrijden' : `Uitslagen seizoen ${seasons.find(s => s.value === selectedSeason)?.label}`}
            </h3>
            <div className="space-y-4">
              {sortedPlayed.map((fixture) => (
                <FixtureCard 
                  key={`played-${fixture.fixture.id}`} 
                  fixture={fixture} 
                  onFixtureClick={handleFixtureClick}
                  formatDate={formatDate}
                  getCompetitionName={getCompetitionName}
                  getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                  translateRound={translateRound}
                />
              ))}
            </div>
          </div>
        )}

        {!isCurrentSeason && sortedPlayed.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen wedstrijden gevonden voor dit seizoen
            </p>
          </div>
        )}

        {isCurrentSeason && sortedUpcoming.length === 0 && sortedPlayed.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen wedstrijden gevonden
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
