import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Info } from "lucide-react";
import { getCurrentActiveSeason, getSeasonOptions } from '@/utils/seasonUtils';

interface PlayerStatistics {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: [{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number;
      commited: number;
      scored: number;
      missed: number;
      saved: number;
    };
  }];
}

interface FootballApiResponse<T> {
  response: T[];
  paging: {
    current: number;
    total: number;
  };
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

const translatePosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    'Goalkeeper': 'Doelman',
    'Defender': 'Verdediger',
    'Midfielder': 'Middenvelder',
    'Attacker': 'Aanvaller'
  };
  
  return positionMap[position] || position;
};

const seasons = getSeasonOptions();

interface AZPlayerStatsProps {
  teamId: number | null;
  isLoadingTeamId: boolean;
}

export const AZPlayerStats = ({ teamId, isLoadingTeamId }: AZPlayerStatsProps) => {
  const navigate = useNavigate();
  const seasonInfo = getCurrentActiveSeason();
  const [selectedSeason, setSelectedSeason] = useState<string>(seasonInfo.currentSeason);
  const [sortBy, setSortBy] = useState<'goals' | 'assists' | 'minutes' | 'cards'>('goals');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['az-player-stats', teamId, selectedSeason, sortBy],
    queryFn: async () => {
      if (!teamId) return [];
      
      const allPlayers: PlayerStatistics[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      console.log(`👥 Fetching AZ player statistics for season ${selectedSeason}...`);
      
      do {
        const response: FootballApiResponse<PlayerStatistics> = await callFootballApi('/players', {
          team: teamId.toString(),
          season: selectedSeason,
          league: '88',
          page: currentPage.toString()
        });
        
        console.log(`📊 Player Stats Response page ${currentPage}:`, response);
        
        if (response.response && response.response.length > 0) {
          allPlayers.push(...response.response);
        }
        
        totalPages = response.paging?.total || 1;
        currentPage++;
      } while (currentPage <= totalPages);
      
      console.log(`✅ Total players fetched: ${allPlayers.length}`);
      
      const activePlayers = allPlayers.filter(player => {
        const stats = player.statistics[0];
        return stats && (
          (stats.games?.appearences && stats.games.appearences > 0) ||
          (stats.games?.minutes && stats.games.minutes > 0)
        );
      });
      
      console.log(`🔄 Active players with stats: ${activePlayers.length}`);
      return activePlayers;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const getSortedPlayers = () => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      const aStats = a.statistics[0];
      const bStats = b.statistics[0];
      
      switch (sortBy) {
        case 'goals':
          return (bStats?.goals?.total || 0) - (aStats?.goals?.total || 0);
        case 'assists':
          return (bStats?.goals?.assists || 0) - (aStats?.goals?.assists || 0);
        case 'minutes':
          return (bStats?.games?.minutes || 0) - (aStats?.games?.minutes || 0);
        case 'cards':
          return ((bStats?.cards?.yellow || 0) + (bStats?.cards?.red || 0)) - 
                 ((aStats?.cards?.yellow || 0) + (aStats?.cards?.red || 0));
        default:
          return 0;
      }
    });
  };

  const handlePlayerClick = (playerId: number) => {
    navigate(`/speler/${playerId}`);
  };

  if (error) {
    return (
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-foreground">Speler Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Fout bij het laden van speler statistieken
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
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-foreground">Speler Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(15)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedPlayers = getSortedPlayers();
  const isCurrentSeasonSelected = selectedSeason === seasonInfo.currentSeason;

  return (
    <Card className="card-premium">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-foreground">AZ Speler Statistieken</CardTitle>
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
          
          {isCurrentSeasonSelected && seasonInfo.isPreviousSeason && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {seasonInfo.displaySeason}
              </span>
            </div>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={sortBy === 'goals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('goals')}
              className={sortBy === 'goals' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : ''}
            >
              Doelpunten
            </Button>
            <Button
              variant={sortBy === 'assists' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('assists')}
              className={sortBy === 'assists' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : ''}
            >
              Assists
            </Button>
            <Button
              variant={sortBy === 'minutes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('minutes')}
              className={sortBy === 'minutes' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : ''}
            >
              Speelminuten
            </Button>
            <Button
              variant={sortBy === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('cards')}
              className={sortBy === 'cards' ? 'bg-az-red hover:bg-az-red/90 text-white border-az-red' : ''}
            >
              Kaarten
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Geen speler statistieken beschikbaar voor seizoen {seasons.find(s => s.value === selectedSeason)?.label}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Alleen spelers met speelminuten in het eerste elftal worden getoond.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-foreground font-semibold">Speler</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Pos</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Wedst</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Min</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Goals</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Assists</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">🟡</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">🟥</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((playerData) => {
                  const player = playerData.player;
                  const stats = playerData.statistics[0];
                  
                  return (
                    <TableRow 
                      key={player.id} 
                      onClick={() => handlePlayerClick(player.id)}
                      className="hover:bg-muted/50 border-b border-border cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={player.photo} 
                            alt={player.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <span className="font-medium text-foreground">
                              {player.name}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {player.age} jaar
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {stats?.games?.position ? translatePosition(stats.games.position) : '-'}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {stats?.games?.appearences || 0}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {stats?.games?.minutes || 0}
                      </TableCell>
                      <TableCell className="text-center font-bold text-az-red">
                        {stats?.goals?.total || 0}
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {stats?.goals?.assists || 0}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {stats?.cards?.yellow || 0}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {stats?.cards?.red || 0}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {stats?.games?.rating ? parseFloat(stats.games.rating).toFixed(1) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
