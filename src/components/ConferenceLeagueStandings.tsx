
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
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

export const ConferenceLeagueStandings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conference-league-standings'],
    queryFn: async () => {
      console.log('🏆 Fetching Conference League standings...');
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '848', // Conference League ID
        season: '2024'
      });
      
      console.log('📊 Conference League Standings Response:', response);
      return response.response[0]?.league.standings || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
              Fout bij het laden van de Conference League stand
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

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Flatten all groups for display
  const allStandings = data?.flat() || [];

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <CardTitle className="text-az-black dark:text-white">Conference League Stand Seizoen 2024-2025</CardTitle>
      </CardHeader>
      <CardContent>
        {allStandings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen Conference League data beschikbaar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white border-b border-gray-200">
                  <TableHead className="w-12 text-gray-900 dark:text-white font-semibold">#</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Team</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-white font-semibold">Wed</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-white font-semibold">W</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-white font-semibold">G</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-white font-semibold">V</TableHead>
                  <TableHead className="text-center w-16 text-gray-900 dark:text-white font-semibold">Doelpunten</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-white font-semibold">Ptn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {allStandings.map((standing) => {
                  const isAZ = standing.team.name.toLowerCase().includes('az') && 
                             standing.team.name.toLowerCase().includes('alkmaar');
                  
                  return (
                    <TableRow 
                      key={`${standing.group}-${standing.team.id}`}
                      className={isAZ ? 'bg-white hover:bg-gray-50 border-b border-gray-100 border-l-4 border-l-az-red' : 'bg-white hover:bg-gray-50 border-b border-gray-100'}
                    >
                      <TableCell className="font-medium">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={standing.team.logo} 
                            alt={standing.team.name}
                            className="w-6 h-6 object-contain"
                          />
                          {/* Hide team name on mobile, show on larger screens */}
                          <span className={`hidden sm:block font-medium ${isAZ ? 'text-az-red font-bold' : 'text-az-black dark:text-white'}`}>
                            {standing.team.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.played}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.win}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.draw}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.lose}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.goals.for}-{standing.all.goals.against}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isAZ ? 'text-az-red' : ''}`}>
                          {standing.points}
                        </span>
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
