import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { FixtureCard } from './FixtureCard';
import { getCurrentActiveSeason, getSeasonOptions } from '@/utils/seasonUtils';

interface AZFixturesProps {
  teamId: number | null;
  isLoadingTeamId: boolean;
}

export const AZFixtures = ({ teamId, isLoadingTeamId }: AZFixturesProps) => {
  const seasonInfo = getCurrentActiveSeason();
  const seasons = getSeasonOptions();
  const [selectedSeason, setSelectedSeason] = useState<string>(seasonInfo.currentSeason);
  const navigate = useNavigate();

  // Fetch upcoming fixtures for current season
  const { data: upcomingFixtures, isLoading: upcomingLoading, error: upcomingError } = useQuery({
    queryKey: ['az-upcoming-fixtures', teamId, selectedSeason],
    queryFn: async () => {
      if (!teamId || selectedSeason !== seasonInfo.currentSeason) return [];
      
      console.log('🔮 Fetching upcoming AZ fixtures...');
      const params: Record<string, string> = {
        team: teamId.toString(),
        next: '20',
        timezone: 'Europe/Amsterdam'
      };

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 Upcoming Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && selectedSeason === seasonInfo.currentSeason,
    staleTime: 1000 * 60 * 15,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch recent played fixtures for current season
  const { data: recentFixtures, isLoading: recentLoading, error: recentError } = useQuery({
    queryKey: ['az-recent-fixtures', teamId, selectedSeason],
    queryFn: async () => {
      if (!teamId || selectedSeason !== seasonInfo.currentSeason) return [];
      
      console.log('📊 Fetching recent AZ fixtures...');
      const params: Record<string, string> = {
        team: teamId.toString(),
        last: '20',
        timezone: 'Europe/Amsterdam'
      };

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 Recent Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && selectedSeason === seasonInfo.currentSeason,
    staleTime: 1000 * 60 * 15,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch historical fixtures for non-current seasons
  const { data: historicalFixtures, isLoading: historicalLoading, error: historicalError } = useQuery({
    queryKey: ['az-historical-fixtures', teamId, selectedSeason],
    queryFn: async () => {
      if (!teamId || selectedSeason === seasonInfo.currentSeason) return [];
      
      console.log(`🏆 Fetching AZ fixtures for season ${selectedSeason}...`);
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: selectedSeason
      };

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 Historical Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && selectedSeason !== seasonInfo.currentSeason,
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
    if (round.toLowerCase().includes('regular season')) return 'Competitie';
    if (round.toLowerCase().includes('semi-final')) return 'Halve finale';
    if (round.toLowerCase().includes('final') && !round.toLowerCase().includes('semi')) return 'Finale';
    if (round.toLowerCase().includes('quarter-final')) return 'Kwartfinale';
    if (round.toLowerCase().includes('round of 16')) return 'Achtste finale';
    if (round.toLowerCase().includes('round of 32')) return '1/16e finale';
    if (round.toLowerCase().includes('play-off')) return 'Play-offs';
    
    const roundMatch = round.match(/Regular Season - (\d+)/i);
    if (roundMatch) return `Speelronde ${roundMatch[1]}`;
    
    const matchdayMatch = round.match(/Matchday (\d+)/i);
    if (matchdayMatch) return `Speeldag ${matchdayMatch[1]}`;
    
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
      case 88: return 'default';
      case 848: return 'secondary';
      case 94: return 'destructive';
      default: return 'outline';
    }
  };

  const normalizeVenueName = (venueName: string | undefined, homeTeamName: string, awayTeamName: string) => {
    if (!venueName) {
      if (homeTeamName.toLowerCase().includes('az')) return 'AFAS Stadion';
      if (homeTeamName.toLowerCase().includes('nac')) return 'Rat Verlegh Stadion';
      if (homeTeamName.toLowerCase().includes('telstar')) return 'BUKO Stadion';
      if (homeTeamName.toLowerCase().includes('volendam')) return 'Kras Stadion';
      return 'Onbekend stadion';
    }

    if (venueName.toLowerCase() === 'afas stadio') return 'AFAS Stadion';
    
    return venueName;
  };

  const isCurrentSeason = selectedSeason === seasonInfo.currentSeason;
  const isLoading = isCurrentSeason ? (upcomingLoading || recentLoading || historicalLoading) : historicalLoading;
  const error = upcomingError || recentError || historicalError;

  const upcoming = upcomingFixtures || [];
  const played = isCurrentSeason 
    ? recentFixtures?.filter(fixture => 
        fixture.goals.home !== null && fixture.goals.away !== null
      ) || []
    : historicalFixtures || [];
  const sortedUpcoming = upcoming.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
  const sortedPlayed = played.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

  const handleFixtureClick = (fixtureId: number) => {
    navigate(`/wedstrijd/${fixtureId}`);
  };

  if (error) {
    return (
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-foreground">AZ Wedstrijdprogramma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
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
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-foreground">AZ Wedstrijdprogramma</CardTitle>
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
    <Card className="card-premium">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-foreground">AZ Wedstrijdprogramma</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isCurrentSeason && sortedUpcoming.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
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
                  normalizeVenueName={normalizeVenueName}
                />
              ))}
            </div>
          </div>
        )}

        {sortedPlayed.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
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
                  normalizeVenueName={normalizeVenueName}
                />
              ))}
            </div>
          </div>
        )}

        {!isCurrentSeason && sortedPlayed.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Geen wedstrijden gevonden voor dit seizoen
            </p>
          </div>
        )}

        {isCurrentSeason && sortedUpcoming.length === 0 && sortedPlayed.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Geen wedstrijden gevonden
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
