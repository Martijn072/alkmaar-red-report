
import React from 'react';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { Calendar, Clock } from 'lucide-react';

export const NextMatchWidget = () => {
  const { data: teamId, isLoading: teamLoading, error: teamError } = useAZTeamId();
  const { data: nextFixture, isLoading: fixtureLoading, error: fixtureError } = useNextAZFixture(teamId);

  const isLoading = teamLoading || fixtureLoading;
  const hasError = teamError || fixtureError;

  if (isLoading) {
    return (
      <div className="mx-4 mt-4 mb-6">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="animate-pulse">
            <div className="h-3 bg-premium-gray-200 dark:bg-gray-600 rounded w-32 mb-3 mx-auto"></div>
            <div className="flex items-center justify-center space-x-6">
              <div className="w-12 h-12 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="h-4 bg-premium-gray-200 dark:bg-gray-600 rounded w-6"></div>
              <div className="w-12 h-12 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !nextFixture) {
    return (
      <div className="mx-4 mt-4 mb-6">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
          <p className="text-premium-gray-600 dark:text-gray-400 text-center">
            Geen wedstrijd gepland
          </p>
        </div>
      </div>
    );
  }

  const matchDate = new Date(nextFixture.fixture.date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAZHome = nextFixture.teams.home.id === teamId;
  const azTeam = isAZHome ? nextFixture.teams.home : nextFixture.teams.away;
  const opponentTeam = isAZHome ? nextFixture.teams.away : nextFixture.teams.home;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLSpanElement | null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200">
        {/* Competitie naam */}
        <div className="text-center mb-4">
          <p className="text-sm text-premium-gray-600 dark:text-gray-400">
            {nextFixture.league.name}
          </p>
        </div>

        {/* Teams met Logo's */}
        <div className="flex items-center justify-center space-x-8 mb-4">
          {/* AZ Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12">
              <img
                src={azTeam.logo}
                alt="AZ Alkmaar"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-az-red text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                AZ
              </span>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-premium-gray-400 dark:text-gray-500">
              VS
            </span>
          </div>

          {/* Opponent Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12">
              <img
                src={opponentTeam.logo}
                alt={opponentTeam.name}
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-premium-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                {opponentTeam.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Datum en tijd */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-4 text-premium-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span className="text-sm">{formatDate(matchDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span className="text-sm">{formatTime(matchDate)}</span>
            </div>
          </div>
        </div>

        {/* Powered by - nu klikbaar */}
        <div className="text-center pt-3 border-t border-premium-gray-100 dark:border-gray-700">
          <a 
            href="https://072design.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-premium-gray-400 dark:text-gray-500 hover:text-az-red dark:hover:text-az-red hover:underline cursor-pointer transition-colors duration-200"
          >
            Powered by 072DESIGN
          </a>
        </div>
      </div>
    </div>
  );
};
