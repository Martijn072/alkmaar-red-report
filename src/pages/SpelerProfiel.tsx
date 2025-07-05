import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, User, MapPin, Trophy } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse } from '@/types/footballApi';

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

const translatePosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    'Goalkeeper': 'Doelman',
    'Defender': 'Verdediger',
    'Midfielder': 'Middenvelder',
    'Attacker': 'Aanvaller'
  };
  
  return positionMap[position] || position;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const SpelerProfiel = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("speler-statistieken");

  // Fetch player career statistics across multiple seasons
  const { data: playerData, isLoading, error } = useQuery({
    queryKey: ['player-profile', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      
      console.log(`👤 Fetching career statistics for player ${playerId}...`);
      
      // Get player statistics for multiple seasons
      const seasons = ['2025', '2024', '2023', '2022', '2021', '2020'];
      const allSeasonStats: PlayerStatistics[] = [];
      
      for (const season of seasons) {
        try {
          const response: FootballApiResponse<PlayerStatistics> = await callFootballApi('/players', {
            id: playerId,
            season: season
          });
          
          if (response.response && response.response.length > 0) {
            allSeasonStats.push(...response.response);
          }
        } catch (error) {
          console.log(`No data for season ${season}:`, error);
        }
      }
      
      console.log(`📊 Career stats fetched: ${allSeasonStats.length} seasons`);
      return allSeasonStats;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  // Calculate career totals
  const getCareerTotals = () => {
    if (!playerData || playerData.length === 0) return null;
    
    let totalGames = 0;
    let totalMinutes = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    
    playerData.forEach(seasonData => {
      const stats = seasonData.statistics[0];
      if (stats) {
        totalGames += stats.games?.appearences || 0;
        totalMinutes += stats.games?.minutes || 0;
        totalGoals += stats.goals?.total || 0;
        totalAssists += stats.goals?.assists || 0;
        totalYellowCards += stats.cards?.yellow || 0;
        totalRedCards += stats.cards?.red || 0;
      }
    });
    
    return {
      games: totalGames,
      minutes: totalMinutes,
      goals: totalGoals,
      assists: totalAssists,
      yellowCards: totalYellowCards,
      redCards: totalRedCards
    };
  };

  const playerInfo = playerData?.[0]?.player;
  const careerTotals = getCareerTotals();

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
                  Fout bij het laden van speler informatie
                </p>
                <Button onClick={() => navigate(-1)} className="bg-az-red hover:bg-az-red/90 text-white">
                  Terug
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
                  Speler niet gevonden
                </p>
                <Button onClick={() => navigate(-1)} className="bg-az-red hover:bg-az-red/90 text-white">
                  Terug
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="px-4 pt-6 pb-20 space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red p-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar statistieken
        </Button>

        {/* Player Profile Header */}
        <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={playerInfo.photo} 
                  alt={playerInfo.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-az-red"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-az-black dark:text-white">
                    {playerInfo.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="bg-az-red text-white">
                      AZ Alkmaar
                    </Badge>
                    {playerData?.[0]?.statistics[0]?.games?.position && (
                      <Badge variant="outline" className="border-premium-gray-300 dark:border-gray-600">
                        {translatePosition(playerData[0].statistics[0].games.position)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-premium-gray-600 dark:text-gray-400" />
                    <span className="text-premium-gray-600 dark:text-gray-300">{playerInfo.age} jaar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-premium-gray-600 dark:text-gray-400" />
                    <span className="text-premium-gray-600 dark:text-gray-300">
                      {formatDate(playerInfo.birth.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-premium-gray-600 dark:text-gray-400" />
                    <span className="text-premium-gray-600 dark:text-gray-300">
                      {playerInfo.birth.place}, {playerInfo.birth.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-premium-gray-600 dark:text-gray-400" />
                    <span className="text-premium-gray-600 dark:text-gray-300">{playerInfo.nationality}</span>
                  </div>
                </div>
                
                {(playerInfo.height || playerInfo.weight) && (
                  <div className="flex gap-4 text-sm text-premium-gray-600 dark:text-gray-300">
                    {playerInfo.height && <span>Lengte: {playerInfo.height}</span>}
                    {playerInfo.weight && <span>Gewicht: {playerInfo.weight}</span>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Totals */}
        {careerTotals && (
          <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-az-black dark:text-white">Carrière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-az-red">{careerTotals.games}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Wedstrijden</div>
                </div>
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-az-red">{Math.round(careerTotals.minutes / 90)}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Volledige wedstrijden</div>
                </div>
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{careerTotals.goals}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Doelpunten</div>
                </div>
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{careerTotals.assists}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Assists</div>
                </div>
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-az-red">{careerTotals.yellowCards}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Gele kaarten</div>
                </div>
                <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{careerTotals.redCards}</div>
                  <div className="text-sm text-premium-gray-600 dark:text-gray-300">Rode kaarten</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season by Season Statistics */}
        <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-az-black dark:text-white">Seizoen Statistieken</CardTitle>
          </CardHeader>
          <CardContent>
            {playerData && playerData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="text-az-black dark:text-white font-semibold">Seizoen</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Competitie</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Wedst</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Min</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Goals</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Assists</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">🟡</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">🟥</TableHead>
                      <TableHead className="text-center text-az-black dark:text-white font-semibold">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerData.map((seasonData, index) => {
                      const stats = seasonData.statistics[0];
                      if (!stats || !stats.games?.appearences) return null;
                      
                      return (
                        <TableRow key={`${stats.league.season}-${index}`} className="hover:bg-premium-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                          <TableCell className="font-medium text-az-black dark:text-white">
                            {stats.league.season}-{(stats.league.season + 1).toString().slice(-2)}
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-center gap-2">
                              <img 
                                src={stats.league.logo} 
                                alt={stats.league.name}
                                className="w-4 h-4"
                              />
                              <span className="text-xs">{stats.league.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            {stats.games?.appearences || 0}
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            {stats.games?.minutes || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-green-600">
                            {stats.goals?.total || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">
                            {stats.goals?.assists || 0}
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            {stats.cards?.yellow || 0}
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            {stats.cards?.red || 0}
                          </TableCell>
                          <TableCell className="text-center text-premium-gray-600 dark:text-gray-300">
                            {stats.games?.rating ? parseFloat(stats.games.rating).toFixed(1) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-premium-gray-600 dark:text-gray-300">
                  Geen seizoen statistieken beschikbaar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SpelerProfiel;