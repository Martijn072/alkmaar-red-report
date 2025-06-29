
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Standing } from '@/types/footballApi';

// Hook for Eredivisie standings
export const useEredivisieStandings = () => {
  return useQuery({
    queryKey: ['eredivisie-standings'],
    queryFn: async () => {
      console.log('🏆 Fetching Eredivisie standings...');
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '88', // Eredivisie league ID
        season: '2024'
      });
      
      console.log('📊 Standings API Response:', response);
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
