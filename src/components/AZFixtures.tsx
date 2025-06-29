
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface FootballApiResponse<T> {
  response: T[];
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

interface AZFixturesProps {
  teamId: number | null;
  isLoadingTeamId: boolean;
}

export const AZFixtures = ({ teamId, isLoadingTeamId }: AZFixturesProps) => {
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['az-all-fixtures', teamId, filter],
    queryFn: async () => {
      if (!teamId) return [];
      
      console.log('🏆 Fetching all AZ fixtures for season 2024...');
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: '2024'
      };

      // Add league filter if not 'all'
      if (filter === 'eredivisie') {
        params.league = '88'; // Eredivisie
      } else if (filter === 'europa') {
        params.league = '848'; // Conference League
      }

      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('📊 AZ Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NS': return 'Te spelen';
      case 'FT': return 'Afgelopen';
      case 'LIVE': return 'Live';
      case '1H': return '1e helft';
      case 'HT': return 'Rust';
      case '2H': return '2e helft';
      default: return status;
    }
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
      case 94: return 'outline'; // KNVB Beker
      default: return 'outline';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'FT': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'NS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'LIVE':
      case '1H':
      case 'HT':
      case '2H':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
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
            <button 
              onClick={() => refetch()}
              className="btn-primary"
            >
              Opnieuw proberen
            </button>
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

  const fixtures = data || [];
  const sortedFixtures = fixtures.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

  return (
    <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-az-black dark:text-white">AZ Wedstrijdprogramma Seizoen 2024-2025</CardTitle>
          
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : 'bg-white dark:bg-gray-800 border-premium-gray-300 hover:bg-premium-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-premium-gray-600 dark:text-gray-300'}
            >
              Alles
            </Button>
            <Button
              variant={filter === 'eredivisie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('eredivisie')}
              className={filter === 'eredivisie' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : 'bg-white dark:bg-gray-800 border-premium-gray-300 hover:bg-premium-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-premium-gray-600 dark:text-gray-300'}
            >
              Eredivisie
            </Button>
            <Button
              variant={filter === 'europa' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('europa')}
              className={filter === 'europa' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : 'bg-white dark:bg-gray-800 border-premium-gray-300 hover:bg-premium-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-premium-gray-600 dark:text-gray-300'}
            >
              Europa
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-white dark:bg-gray-800">
        {fixtures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen wedstrijden gevonden
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFixtures.map((fixture) => (
              <div 
                key={fixture.fixture.id}
                className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-premium-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(fixture.fixture.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getCompetitionBadgeVariant(fixture.league.id)}
                      className={`text-xs font-semibold ${
                        fixture.league.id === 88 
                          ? 'bg-az-red text-white hover:bg-az-red/90 border-az-red' 
                          : fixture.league.id === 848
                          ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                          : 'border-premium-gray-300 text-premium-gray-700 dark:border-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {getCompetitionName(fixture.league.id, fixture.league.name)}
                    </Badge>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(fixture.fixture.status.short)}`}>
                      {getStatusText(fixture.fixture.status.short)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <img 
                        src={fixture.teams.home.logo} 
                        alt={fixture.teams.home.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-semibold text-az-black dark:text-white">
                        {fixture.teams.home.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-6">
                    {fixture.goals.home !== null && fixture.goals.away !== null ? (
                      <div className="text-xl font-bold text-az-red">
                        {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    ) : (
                      <div className="text-premium-gray-400 dark:text-gray-500 font-medium">
                        vs
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-az-black dark:text-white">
                        {fixture.teams.away.name}
                      </span>
                      <img 
                        src={fixture.teams.away.logo} 
                        alt={fixture.teams.away.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300">
                    <MapPin className="w-3 h-3" />
                    <span>{fixture.fixture.venue.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-premium-gray-50 dark:bg-gray-700 border-premium-gray-200 dark:border-gray-600 text-premium-gray-700 dark:text-gray-300"
                  >
                    {translateRound(fixture.league.round)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
