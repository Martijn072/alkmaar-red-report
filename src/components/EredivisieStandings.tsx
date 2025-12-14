import { useEredivisieStandings } from '@/hooks/useFootballApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { getCurrentActiveSeason } from '@/utils/seasonUtils';
import { useNavigate } from 'react-router-dom';

export const EredivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: standings, isLoading, error, refetch } = useEredivisieStandings();
  const navigate = useNavigate();

  const handleTeamClick = (teamId: number) => {
    navigate(`/team/${teamId}`);
  };

  if (error) {
    return (
      <div className="animate-fade-in">
        <ErrorMessage onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="card-premium animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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
    <Card className="card-premium transform transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground">Eredivisie Stand Seizoen {seasonInfo.displaySeason}</CardTitle>
      </CardHeader>
      <CardContent>
        {standings?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Geen Eredivisie data beschikbaar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-12 text-foreground font-semibold">#</TableHead>
                  <TableHead className="text-foreground font-semibold">Team</TableHead>
                  <TableHead className="text-center w-12 text-foreground font-semibold">Wed</TableHead>
                  <TableHead className="text-center w-12 text-foreground font-semibold">W</TableHead>
                  <TableHead className="text-center w-12 text-foreground font-semibold">G</TableHead>
                  <TableHead className="text-center w-12 text-foreground font-semibold">V</TableHead>
                  <TableHead className="text-center w-16 text-foreground font-semibold">Doelpunten</TableHead>
                  <TableHead className="text-center w-12 text-foreground font-semibold">Ptn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings?.map((standing, index) => {
                  const isAZ = standing.team.name.toLowerCase().includes('az') && 
                             (standing.team.name.toLowerCase().includes('alkmaar') || 
                              standing.team.name === 'AZ');
                  
                  return (
                    <TableRow 
                      key={standing.team.id}
                      onClick={() => handleTeamClick(standing.team.id)}
                      className={`${isAZ ? 'bg-az-red/10 border-b border-az-red/20 hover:bg-az-red/15' : 'hover:bg-muted/50 border-b border-border'} transition-all duration-200 animate-fade-in cursor-pointer`}
                      style={{ animationDelay: `${index * 0.02}s` }}
                    >
                      <TableCell className="font-medium">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={standing.team.logo} 
                            alt={standing.team.name}
                            className="w-6 h-6 object-contain transform transition-transform duration-200 hover:scale-110"
                          />
                          <span className={`hidden sm:block font-medium ${isAZ ? 'text-az-red font-bold' : 'text-foreground'}`}>
                            {standing.team.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.all.played}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.all.win}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.all.draw}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.all.lose}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                          {standing.all.goals.for}-{standing.all.goals.against}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isAZ ? 'text-az-red' : 'text-foreground'}`}>
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
