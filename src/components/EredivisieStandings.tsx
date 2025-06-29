
import { useEredivisieStandings } from '@/hooks/useFootballApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";

export const EredivisieStandings = () => {
  const { data: standings, isLoading, error, refetch } = useEredivisieStandings();

  if (error) {
    return <ErrorMessage onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Eredivisie Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(18)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <CardTitle className="text-az-black dark:text-white">Eredivisie Stand Seizoen 2024-2025</CardTitle>
      </CardHeader>
      <CardContent>
        {standings?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen Eredivisie data beschikbaar
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
                {standings?.map((standing) => {
                  const isAZ = standing.team.name.toLowerCase().includes('az') && 
                             (standing.team.name.toLowerCase().includes('alkmaar') || 
                              standing.team.name === 'AZ');
                  
                  return (
                    <TableRow 
                      key={standing.team.id}
                      className={isAZ ? 'bg-az-red/10 border-b border-az-red/20 hover:bg-az-red/15' : 'bg-white hover:bg-gray-50 border-b border-gray-100'}
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
