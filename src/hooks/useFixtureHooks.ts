
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';

// Hook for AZ fixtures
export const useAZFixtures = (teamId: number | null, last: number = 5) => {
  return useQuery({
    queryKey: ['az-fixtures', teamId, last],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No team ID available for fixtures');
        return [];
      }
      
      console.log('📅 Fetching AZ fixtures...', { teamId, last });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        last: last.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Fixtures API Response:', response);
      return response.response;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for next AZ fixture
export const useNextAZFixture = (teamId: number | null) => {
  return useQuery({
    queryKey: ['next-az-fixture', teamId],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No team ID available for next fixture');
        return null;
      }
      
      console.log('🔮 Fetching next AZ fixture...', { teamId });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        next: '1',
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Next Fixture API Response:', response);
      return response.response[0] || null;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for live AZ fixture
export const useLiveAZFixture = (teamId: number | null) => {
  return useQuery({
    queryKey: ['live-az-fixture', teamId],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No team ID available for live fixture');
        return null;
      }
      
      console.log('🔴 Fetching live AZ fixture...', { teamId });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        live: 'all',
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Live Fixture API Response:', response);
      
      const liveAZFixture = response.response.find(fixture => 
        fixture.fixture.status.short === 'LIVE' || 
        fixture.fixture.status.short === '1H' || 
        fixture.fixture.status.short === 'HT' || 
        fixture.fixture.status.short === '2H'
      );
      
      return liveAZFixture || null;
    },
    enabled: !!teamId,
    refetchInterval: 30000, // Refetch every 30 seconds during live matches
    staleTime: 0, // Don't cache live data
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for Conference League fixtures
export const useConferenceLeagueFixtures = (teamId: number | null) => {
  return useQuery({
    queryKey: ['conference-league-fixtures', teamId],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No team ID available for Conference League fixtures');
        return [];
      }
      
      console.log('🏆 Fetching Conference League fixtures for AZ...', { teamId });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        league: '848', // Conference League ID
        season: '2024'
      });
      
      console.log('📊 Conference League Fixtures API Response:', response);
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
