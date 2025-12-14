import { useEersteDivisieStandings } from '@/hooks/useJongAZHooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { getCurrentActiveSeason } from '@/utils/seasonUtils';
import { useNavigate } from 'react-router-dom';

export const EersteDivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: standings, isLoading, error, refetch } = useEersteDivisieStandings();
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
      <div className="space-y-3">
        {[...Array(20)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {standings?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Geen Eerste Divisie data beschikbaar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg">
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
                const isJongAZ = standing.team.name.toLowerCase().includes('jong') && 
                               standing.team.name.toLowerCase().includes('az');
                
                return (
                  <TableRow 
                    key={standing.team.id}
                    onClick={() => handleTeamClick(standing.team.id)}
                    className={`${isJongAZ ? 'bg-az-red/10 border-b border-az-red/20 hover:bg-az-red/15' : 'hover:bg-muted/50 border-b border-border'} transition-all duration-200 animate-fade-in cursor-pointer`}
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <TableCell className="font-medium">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
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
                        <span className={`hidden sm:block font-medium ${isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}`}>
                          {standing.team.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.played}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.win}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.draw}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.lose}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.goals.for}-{standing.all.goals.against}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${isJongAZ ? 'text-az-red' : 'text-foreground'}`}>
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
    </div>
  );
};
