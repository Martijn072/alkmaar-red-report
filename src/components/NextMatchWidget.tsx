
import React from 'react';
import { Link } from 'react-router-dom';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { useLiveAZFixture } from '@/hooks/useFixtureHooks';
import { useFixtureEvents } from '@/hooks/useFixtureEvents';
import { Calendar, Clock } from 'lucide-react';

export const NextMatchWidget = () => {
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
      <div className="mb-4">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-3 animate-pulse">
          <div className="text-center mb-2">
            <div className="h-3 bg-premium-gray-200 dark:bg-gray-600 rounded w-28 mx-auto"></div>
          </div>
          <div className="flex items-center justify-center space-x-6 mb-2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-5 bg-premium-gray-200 dark:bg-gray-600 rounded w-6"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-3 bg-premium-gray-200 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-3 bg-premium-gray-200 dark:bg-gray-600 rounded w-12"></div>
            </div>
          </div>
          <div className="text-center pt-2 border-t border-premium-gray-100 dark:border-gray-700">
            <div className="h-3 bg-premium-gray-200 dark:bg-gray-600 rounded w-28 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !displayFixture) {
    return (
      <div className="mb-4">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-3 animate-fade-in">
          <p className="text-premium-gray-600 dark:text-gray-400 text-center text-sm">
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
        .filter(event => event.type === 'Goal' && event.player?.name) // Only goals with valid player names
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
  
  // Format event for display - only goals for homepage
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
    <div className="mb-4">
      <section 
        className="card-premium dark:bg-gray-800 dark:border-gray-700 p-3 hover:shadow-lg transition-all duration-300 animate-fade-in transform hover:scale-[1.01] cursor-pointer relative"
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
          <p className="text-xs text-premium-gray-600 dark:text-gray-400">
            {displayFixture.league.name}
          </p>
        </div>

        {/* Teams met Logo's */}
        <div className="flex items-center justify-center space-x-6 mb-2" id="next-match-details">
          {/* AZ Logo */}
          <div className="flex flex-col items-center transform transition-transform duration-300 hover:scale-110">
            <div className="relative w-10 h-10">
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
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span 
              className="text-lg font-bold text-premium-gray-400 dark:text-gray-500 animate-pulse"
              aria-label="tegen"
            >
              VS
            </span>
          </div>

          {/* Opponent Logo */}
          <div className="flex flex-col items-center transform transition-transform duration-300 hover:scale-110">
            <div className="relative w-10 h-10">
              <img
                src={opponentTeam.logo}
                alt={`${opponentTeam.name} clublogo`}
                className="w-full h-full object-contain transition-transform duration-300"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-premium-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
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
              {/* Live Score */}
              <div className="text-xl font-bold text-az-black dark:text-white">
                <span className={isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.home || 0}</span>
                <span className="mx-2">-</span>
                <span className={!isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.away || 0}</span>
              </div>
              
              {/* Play Time */}
              {displayFixture.fixture.status.elapsed && (
                <div className="text-az-red font-medium text-sm">
                  {displayFixture.fixture.status.elapsed}'
                </div>
              )}
              
              {/* Latest Event */}
              {latestEvent && (
                <div className="text-xs text-premium-gray-600 dark:text-gray-400">
                  {formatLatestEvent(latestEvent)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 text-premium-gray-600 dark:text-gray-400">
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

        {/* Powered by - nu klikbaar */}
        <div className="text-center pt-2 border-t border-premium-gray-100 dark:border-gray-700">
          <a 
            href="https://072design.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-premium-gray-400 dark:text-gray-500 hover:text-az-red dark:hover:text-az-red hover:underline cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-az-red focus:ring-offset-2 rounded"
            aria-label="Externe link naar 072DESIGN website"
            onClick={(e) => e.stopPropagation()}
          >
            Powered by 072DESIGN
          </a>
        </div>
      </section>
    </div>
  );

  // Wrap in Link if fixture exists
  if (displayFixture) {
    return (
      <Link to={`/wedstrijd/${displayFixture.fixture.id}`} className="block">
        {widgetContent}
      </Link>
    );
  }

  return widgetContent;
};
