import React from 'react';
import { Link } from 'react-router-dom';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { useLiveAZFixture } from '@/hooks/useFixtureHooks';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center justify-center gap-8 mb-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-12 h-8" />
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48 mx-auto mb-4" />
            <Skeleton className="h-10 w-36 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || !displayFixture) {
    return (
      <Card className="bg-gradient-to-br from-premium-gray-50 to-premium-gray-100 dark:from-gray-800 dark:to-gray-900 border-premium-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-premium-gray-600 dark:text-gray-400">
            Geen wedstrijd gepland
          </p>
        </CardContent>
      </Card>
    );
  }

  const matchDate = new Date(displayFixture.fixture.date);
  const now = new Date();
  const diffTime = matchDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isToday = diffDays <= 0 && diffDays > -1;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountdown = () => {
    if (isLive) return null;
    if (isToday) return `Vandaag om ${formatTime(matchDate)}`;
    if (diffDays === 1) return `Morgen om ${formatTime(matchDate)}`;
    if (diffDays > 1 && diffDays <= 7) return `Over ${diffDays} dagen`;
    return formatDate(matchDate);
  };

  const isAZHome = displayFixture.teams.home.id === teamId;
  const homeTeam = displayFixture.teams.home;
  const awayTeam = displayFixture.teams.away;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLSpanElement | null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <Link to={`/wedstrijd/${displayFixture.fixture.id}`} className="block">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
        <CardContent className="p-6">
          {/* Competition & Badges */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-premium-gray-600 dark:text-gray-400">
              {displayFixture.league.name}
            </span>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge className="bg-az-red text-white animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping"></span>
                  LIVE
                </Badge>
              )}
              {isToday && !isLive && (
                <Badge variant="secondary" className="bg-amber-500 text-white">
                  VANDAAG
                </Badge>
              )}
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                <img
                  src={homeTeam.logo}
                  alt={homeTeam.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                  onError={handleImageError}
                />
                <span 
                  className="absolute inset-0 bg-premium-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  {homeTeam.name.substring(0, 3).toUpperCase()}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center ${isAZHome ? 'text-az-red font-bold' : 'text-az-black dark:text-white'}`}>
                {homeTeam.name}
              </span>
            </div>

            {/* Score or VS */}
            <div className="flex flex-col items-center">
              {isLive ? (
                <>
                  <div className="text-3xl sm:text-4xl font-bold text-az-black dark:text-white">
                    <span className={isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.home || 0}</span>
                    <span className="mx-2 text-premium-gray-400">-</span>
                    <span className={!isAZHome ? 'text-az-red' : ''}>{displayFixture.goals?.away || 0}</span>
                  </div>
                  {displayFixture.fixture.status.elapsed && (
                    <span className="text-az-red font-semibold">
                      {displayFixture.fixture.status.elapsed}'
                    </span>
                  )}
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-premium-gray-400 dark:text-gray-500">
                  VS
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                <img
                  src={awayTeam.logo}
                  alt={awayTeam.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                  onError={handleImageError}
                />
                <span 
                  className="absolute inset-0 bg-premium-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  {awayTeam.name.substring(0, 3).toUpperCase()}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center ${!isAZHome ? 'text-az-red font-bold' : 'text-az-black dark:text-white'}`}>
                {awayTeam.name}
              </span>
            </div>
          </div>

          {/* Date/Time & Venue */}
          {!isLive && (
            <div className="text-center mb-4 space-y-2">
              <div className="flex items-center justify-center gap-4 text-premium-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{getCountdown()}</span>
                </div>
                {!isToday && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatTime(matchDate)}</span>
                  </div>
                )}
              </div>
              {displayFixture.fixture.venue?.name && (
                <div className="flex items-center justify-center gap-1 text-premium-gray-500 dark:text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{displayFixture.fixture.venue.name}</span>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              className="text-az-red hover:text-az-red hover:bg-az-red/10"
            >
              Bekijk details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
