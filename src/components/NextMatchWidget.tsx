import React from 'react';
import { Link } from 'react-router-dom';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { useLiveAZFixture } from '@/hooks/useFixtureHooks';
import { useFixtureEvents } from '@/hooks/useFixtureEvents';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextMatchWidgetProps {
  className?: string;
}

export const NextMatchWidget = ({ className }: NextMatchWidgetProps) => {
  const { data: teamId, isLoading: teamLoading, error: teamError } = useAZTeamId();
  const { data: nextFixture, isLoading: fixtureLoading, error: fixtureError } = useNextAZFixture(teamId);
  const { data: liveFixture, isLoading: liveLoading } = useLiveAZFixture(teamId);
  const { data: events } = useFixtureEvents(liveFixture?.fixture.id.toString() || null);

  // Live fixture has priority over next fixture
  const displayFixture = liveFixture || nextFixture;
  const isLive = !!liveFixture;
  
  const isLoading = teamLoading || fixtureLoading || liveLoading;
  const hasError = teamError || fixtureError;

  if (isLoading) {
    return (
      <div className={className}>
        <div className="card-premium p-4 animate-pulse">
          <div className="text-center mb-2">
            <div className="h-3 bg-muted rounded w-28 mx-auto"></div>
          </div>
          <div className="flex items-center justify-center space-x-6 mb-2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-5 bg-muted rounded w-6"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
            </div>
          </div>
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-12"></div>
            </div>
          </div>
          <div className="text-center pt-2 border-t border-border">
            <div className="h-3 bg-muted rounded w-28 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !displayFixture) {
    return (
      <div className={className}>
        <div className="card-premium p-4 animate-fade-in">
          <p className="text-muted-foreground text-center text-sm">
            Geen wedstrijd gepland
          </p>
        </div>
      </div>
    );
  }

  const matchDate = new Date(displayFixture.fixture.date);
  
  // Get latest event for live matches - only goals for homepage
  const latestEvent = events && events.length > 0 
    ? events
        .filter(event => event.type === 'Goal' && event.player?.name)
        .sort((a, b) => b.time.elapsed - a.time.elapsed)[0]
    : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAZHome = displayFixture.teams.home.id === teamId;
  const azTeam = isAZHome ? displayFixture.teams.home : displayFixture.teams.away;
  const opponentTeam = isAZHome ? displayFixture.teams.away : displayFixture.teams.home;
  
  const formatLatestEvent = (event: any) => {
    if (!event || !event.player?.name) return null;
    return `⚽ ${event.player.name} ${event.time.elapsed}'`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLSpanElement | null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  const widgetContent = (
    <div className={className}>
      <section 
        className={cn(
          "card-premium p-4 hover:shadow-md transition-shadow duration-300 animate-fade-in cursor-pointer relative",
          isLive && "ring-2 ring-az-red/50"
        )}
        role="region"
        aria-labelledby="next-match-title"
        aria-describedby="next-match-details"
      >
        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-az-red text-white rounded-md px-2 py-0.5 text-xs font-medium animate-pulse flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              LIVE
            </div>
          </div>
        )}
        <h2 id="next-match-title" className="sr-only">Volgende AZ wedstrijd</h2>
        
        {/* Competitie naam */}
        <div className="text-center mb-2">
          <p className="text-xs text-muted-foreground">
            {displayFixture.league.name}
          </p>
        </div>

        {/* Teams met Logo's */}
        <div className="flex items-center justify-center space-x-6 mb-2" id="next-match-details">
          {/* AZ Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <img
                src={azTeam.logo}
                alt="AZ Alkmaar clublogo"
                className="w-full h-full object-contain transition-transform duration-300"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-az-red text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                AZ
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {isAZHome ? '(T)' : '(U)'}
            </span>
          </div>

          {/* VS - no animate-pulse */}
          <div className="flex flex-col items-center">
            <span 
              className="text-lg font-semibold text-muted-foreground"
              aria-label="tegen"
            >
              VS
            </span>
          </div>

          {/* Opponent Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <img
                src={opponentTeam.logo}
                alt={`${opponentTeam.name} clublogo`}
                className="w-full h-full object-contain transition-transform duration-300"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-muted text-foreground text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                {opponentTeam.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Live Score or Date/Time */}
        <div className="text-center mb-2">
          {isLive ? (
            <div className="space-y-1">
              <div className="text-xl font-bold text-foreground">
                <span className={isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.home || 0}</span>
                <span className="mx-2">-</span>
                <span className={!isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.away || 0}</span>
              </div>
              
              {displayFixture.fixture.status.elapsed && (
                <div className="text-az-red font-medium text-sm">
                  {displayFixture.fixture.status.elapsed}'
                </div>
              )}
              
              {latestEvent && (
                <div className="text-xs text-muted-foreground">
                  {formatLatestEvent(latestEvent)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <div 
                className="flex items-center space-x-1"
                role="text"
                aria-label={`Wedstrijddatum: ${formatDate(matchDate)}`}
              >
                <Calendar size={12} aria-hidden="true" />
                <span className="text-xs">{formatDate(matchDate)}</span>
              </div>
              <div 
                className="flex items-center space-x-1"
                role="text" 
                aria-label={`Aanvangstijd: ${formatTime(matchDate)}`}
              >
                <Clock size={12} aria-hidden="true" />
                <span className="text-xs">{formatTime(matchDate)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Powered by 072DESIGN */}
        <div className="text-center pt-2 border-t border-border">
          <a 
            href="https://072design.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-az-red hover:underline cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-az-red focus:ring-offset-2 rounded"
            aria-label="Externe link naar 072DESIGN website"
            onClick={(e) => e.stopPropagation()}
          >
            Powered by 072DESIGN
          </a>
        </div>
      </section>
    </div>
  );

  if (displayFixture) {
    return (
      <Link to={`/wedstrijd/${displayFixture.fixture.id}`} className="block">
        {widgetContent}
      </Link>
    );
  }

  return widgetContent;
};
