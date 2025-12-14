import { useEredivisieStandings } from "@/hooks/useStandingHooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ChevronRight, Trophy } from "lucide-react";
import { Standing } from "@/types/footballApi";
import { getCurrentActiveSeason } from "@/utils/seasonUtils";

const AZ_TEAM_ID = 197;

export const SidebarStandings = () => {
  const { data: standings, isLoading, error } = useEredivisieStandings();
  const seasonInfo = getCurrentActiveSeason();

  if (error) return null;

  // Determine which teams to display
  const getDisplayStandings = (): { standings: Standing[]; showSeparator: boolean; separatorIndex: number } => {
    if (!standings || standings.length === 0) {
      return { standings: [], showSeparator: false, separatorIndex: -1 };
    }

    const azStanding = standings.find(s => s.team.id === AZ_TEAM_ID);
    const azInTop5 = azStanding && azStanding.rank <= 5;

    if (azInTop5 || !azStanding) {
      // AZ in top 5 or not found → show top 5
      return { 
        standings: standings.slice(0, 5), 
        showSeparator: false, 
        separatorIndex: -1 
      };
    } else {
      // AZ outside top 5 → show top 4 + AZ with separator
      return { 
        standings: [...standings.slice(0, 4), azStanding], 
        showSeparator: true, 
        separatorIndex: 4 
      };
    }
  };

  const { standings: displayStandings, showSeparator, separatorIndex } = getDisplayStandings();

  return (
    <Card className="card-premium overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-az-red" />
          Eredivisie {seasonInfo.displaySeason}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[24px_20px_1fr_28px_28px] gap-1 text-[10px] text-muted-foreground uppercase tracking-wide mb-1 px-1">
              <span>#</span>
              <span></span>
              <span>Team</span>
              <span className="text-center">GS</span>
              <span className="text-center">Ptn</span>
            </div>

            {/* Standings Rows */}
            <div className="space-y-0.5">
              {displayStandings.map((standing, index) => {
                const isAZ = standing.team.id === AZ_TEAM_ID;
                
                return (
                  <div key={standing.team.id}>
                    {/* Separator before AZ if outside top 5 */}
                    {showSeparator && index === separatorIndex && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                        <span className="text-[9px] text-muted-foreground">···</span>
                        <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                      </div>
                    )}
                    
                    <div 
                      className={`grid grid-cols-[24px_20px_1fr_28px_28px] gap-1 items-center py-1.5 px-1 rounded-md text-xs transition-colors ${
                        isAZ 
                          ? 'bg-az-red/10 font-medium' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <span className={`font-medium ${isAZ ? 'text-az-red' : 'text-muted-foreground'}`}>
                        {standing.rank}
                      </span>
                      <img 
                        src={standing.team.logo} 
                        alt={standing.team.name}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                      />
                      <span className={`truncate ${isAZ ? 'text-az-red' : ''}`}>
                        {standing.team.name}
                      </span>
                      <span className="text-center text-muted-foreground">
                        {standing.all.played}
                      </span>
                      <span className={`text-center font-semibold ${isAZ ? 'text-az-red' : ''}`}>
                        {standing.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link to full standings */}
            <Link 
              to="/standen" 
              className="flex items-center justify-center gap-1 text-xs text-az-red hover:text-az-red/80 transition-colors mt-3 pt-2 border-t border-border"
            >
              Bekijk volledige stand
              <ChevronRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};
