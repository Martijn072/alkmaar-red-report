import React from 'react';
import { Link } from 'react-router-dom';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { useLiveAZFixture } from '@/hooks/useFixtureHooks';
import { Skeleton } from "@/components/ui/skeleton";

export const NextMatchCard = () => {
  const { data: teamId, isLoading: teamLoading, error: teamError } = useAZTeamId();
  const { data: nextFixture, isLoading: fixtureLoading, error: fixtureError } = useNextAZFixture(teamId);
  const { data: liveFixture, isLoading: liveLoading } = useLiveAZFixture(teamId);

  const displayFixture = liveFixture || nextFixture;
  const isLive = !!liveFixture;
  
  const isLoading = teamLoading || fixtureLoading || liveLoading;
  const hasError = teamError || fixtureError;

  if (isLoading) {
    return (
      <div className="bg-background border border-border rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  if (hasError || !displayFixture) {
    return (
      <div className="bg-background border border-border rounded-lg px-4 py-3 text-center">
        <span className="text-sm text-muted-foreground">Geen wedstrijd gepland</span>
      </div>
    );
  }

  const matchDate = new Date(displayFixture.fixture.date);
  const now = new Date();
  const diffTime = matchDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isToday = diffDays <= 0 && diffDays > -1;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountdown = () => {
    if (isToday) return `Vandaag ${formatTime(matchDate)}`;
    if (diffDays === 1) return `Morgen ${formatTime(matchDate)}`;
    if (diffDays > 1 && diffDays <= 7) return `Over ${diffDays} dagen`;
    return matchDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + ` ${formatTime(matchDate)}`;
  };

  const isAZHome = displayFixture.teams.home.id === teamId;
  const homeTeam = displayFixture.teams.home;
  const awayTeam = displayFixture.teams.away;

  // Competition color indicator
  const getCompetitionColor = () => {
    const leagueName = displayFixture.league.name.toLowerCase();
    if (leagueName.includes('eredivisie')) return 'bg-orange-500';
    if (leagueName.includes('conference') || leagueName.includes('europa') || leagueName.includes('champions')) return 'bg-yellow-500';
    if (leagueName.includes('beker') || leagueName.includes('cup')) return 'bg-green-500';
    return 'bg-primary';
  };

  return (
    <Link to={`/wedstrijd/${displayFixture.fixture.id}`} className="block">
      <div className="bg-background border border-border rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Competition indicator + Teams */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Competition color dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCompetitionColor()}`} />
            
            {/* Home team logo */}
            <img
              src={homeTeam.logo}
              alt={homeTeam.name}
              className="w-6 h-6 object-contain flex-shrink-0"
            />
            
            {/* Team names or score */}
            {isLive ? (
              <div className="flex items-center gap-2 font-semibold">
                <span className={isAZHome ? 'text-az-red' : 'text-foreground'}>
                  {homeTeam.name}
                  {isAZHome && <span className="text-xs ml-1 text-muted-foreground">(T)</span>}
                </span>
                <span className="text-az-red font-bold">
                  {displayFixture.goals?.home || 0} - {displayFixture.goals?.away || 0}
                </span>
                <span className={!isAZHome ? 'text-az-red' : 'text-foreground'}>
                  {awayTeam.name}
                  {!isAZHome && <span className="text-xs ml-1 text-muted-foreground">(U)</span>}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-foreground truncate">
                <span className={isAZHome ? 'text-az-red font-semibold' : ''}>
                  {homeTeam.name}
                  {isAZHome && <span className="text-xs ml-1 text-muted-foreground font-normal">(T)</span>}
                </span>
                <span className="text-muted-foreground mx-1">-</span>
                <span className={!isAZHome ? 'text-az-red font-semibold' : ''}>
                  {awayTeam.name}
                  {!isAZHome && <span className="text-xs ml-1 text-muted-foreground font-normal">(U)</span>}
                </span>
              </span>
            )}
            
            {/* Away team logo */}
            <img
              src={awayTeam.logo}
              alt={awayTeam.name}
              className="w-6 h-6 object-contain flex-shrink-0"
            />
          </div>

          {/* Right: Time/Date or LIVE indicator */}
          <div className="flex-shrink-0">
            {isLive ? (
              <div className="flex items-center gap-1.5 text-az-red">
                <span className="w-2 h-2 bg-az-red rounded-full animate-pulse" />
                <span className="text-xs font-semibold">
                  LIVE {displayFixture.fixture.status.elapsed && `${displayFixture.fixture.status.elapsed}'`}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {getCountdown()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
