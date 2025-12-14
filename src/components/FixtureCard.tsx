import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { Fixture } from '@/types/footballApi';

interface FixtureCardProps {
  fixture: Fixture;
  onFixtureClick: (fixtureId: number) => void;
  formatDate: (dateString: string) => string;
  getCompetitionName: (leagueId: number, leagueName: string) => string;
  getCompetitionBadgeVariant: (leagueId: number) => "default" | "secondary" | "destructive" | "outline";
  translateRound: (round: string) => string;
  normalizeVenueName?: (venueName: string | undefined, homeTeamName: string, awayTeamName: string) => string;
}

export const FixtureCard = ({ 
  fixture, 
  onFixtureClick, 
  formatDate, 
  getCompetitionName, 
  getCompetitionBadgeVariant, 
  translateRound,
  normalizeVenueName
}: FixtureCardProps) => {
  return (
    <div 
      onClick={() => onFixtureClick(fixture.fixture.id)}
      className="card-premium p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-medium">{formatDate(fixture.fixture.date)}</span>
        </div>
        <Badge 
          variant={getCompetitionBadgeVariant(fixture.league.id)}
          className={`text-xs font-semibold ${
            fixture.league.id === 88 
              ? 'bg-az-red text-white hover:bg-az-red/90 border-az-red' 
              : fixture.league.id === 848
              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
              : fixture.league.id === 94
              ? 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600'
              : 'border-border text-muted-foreground'
          }`}
        >
          {getCompetitionName(fixture.league.id, fixture.league.name)}
        </Badge>
      </div>

      {/* Mobile-first layout: centered logos with score */}
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2">
          <img 
            src={fixture.teams.home.logo} 
            alt={fixture.teams.home.name}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          {/* Show team name only on larger screens */}
          <span className="hidden sm:block font-semibold text-foreground text-center text-sm">
            {fixture.teams.home.name}
          </span>
        </div>

        {/* Score or VS */}
        <div className="flex flex-col items-center justify-center">
          {fixture.goals.home !== null && fixture.goals.away !== null ? (
            <div className="text-2xl sm:text-3xl font-bold text-az-red">
              {fixture.goals.home} - {fixture.goals.away}
            </div>
          ) : (
            <div className="text-muted-foreground font-medium text-lg">
              vs
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2">
          <img 
            src={fixture.teams.away.logo} 
            alt={fixture.teams.away.name}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          {/* Show team name only on larger screens */}
          <span className="hidden sm:block font-semibold text-foreground text-center text-sm">
            {fixture.teams.away.name}
          </span>
        </div>
      </div>

      {/* Venue and Round info */}
      <div className="flex items-center justify-between mt-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">
            {normalizeVenueName 
              ? normalizeVenueName(fixture.fixture.venue?.name, fixture.teams.home.name, fixture.teams.away.name)
              : fixture.fixture.venue?.name || 'Onbekend'
            }
          </span>
        </div>
        <Badge 
          variant="outline" 
          className="text-xs bg-muted/50 border-border text-muted-foreground"
        >
          {translateRound(fixture.league.round)}
        </Badge>
      </div>
    </div>
  );
};
