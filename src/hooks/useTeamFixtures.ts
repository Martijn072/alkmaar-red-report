
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

export const useTeamFixtures = (teamId: number, last?: number) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['team-fixtures', teamId, seasonInfo.currentSeason, last],
    queryFn: async () => {
      console.log(`🏈 Fetching team fixtures for team ${teamId} in season ${seasonInfo.currentSeason}...`);
      
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: seasonInfo.currentSeason
      };
      
      if (last) {
        params.last = last.toString();
      }
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('🏈 Team Fixtures API Response:', response);
      return response.response || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};

export const useTeamNextFixtures = (teamId: number, next?: number) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['team-next-fixtures', teamId, seasonInfo.currentSeason, next],
    queryFn: async () => {
      console.log(`🔮 Fetching upcoming team fixtures for team ${teamId} in season ${seasonInfo.currentSeason}...`);
      
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: seasonInfo.currentSeason
      };
      
      if (next) {
        params.next = next.toString();
      }
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('🔮 Team Next Fixtures API Response:', response);
      return response.response || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};
