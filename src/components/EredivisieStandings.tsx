
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
          <div className="overflow-x-auto bg-white dark:bg-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="w-12 text-gray-900 dark:text-gray-100 font-semibold">#</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Team</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">Wed</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">W</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">G</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">V</TableHead>
                  <TableHead className="text-center w-16 text-gray-900 dark:text-gray-100 font-semibold">Doelpunten</TableHead>
                  <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">Ptn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-800">
                {standings?.map((standing) => {
                  const isAZ = standing.team.name.toLowerCase().includes('az') && 
                             (standing.team.name.toLowerCase().includes('alkmaar') || 
                              standing.team.name === 'AZ');
                  
                  return (
                    <TableRow 
                      key={standing.team.id}
                      className={isAZ ? 'bg-az-red/10 dark:bg-az-red/20 border-b border-az-red/20 dark:border-az-red/30 hover:bg-az-red/15 dark:hover:bg-az-red/25' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600'}
                    >
                      <TableCell className="font-medium">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
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
                          <span className={`hidden sm:block font-medium ${isAZ ? 'text-az-red font-bold' : 'text-az-black dark:text-gray-100'}`}>
                            {standing.team.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                          {standing.all.played}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                          {standing.all.win}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                          {standing.all.draw}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                          {standing.all.lose}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                          {standing.all.goals.for}-{standing.all.goals.against}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isAZ ? 'text-az-red' : 'text-gray-900 dark:text-gray-100'}`}>
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
