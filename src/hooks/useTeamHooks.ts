
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Team } from '@/types/footballApi';

// Hook to find AZ team ID
export const useAZTeamId = () => {
  return useQuery({
    queryKey: ['az-team-id'],
    queryFn: async () => {
      console.log('🔍 Searching for AZ team ID...');
      const response: FootballApiResponse<{ team: Team }> = await callFootballApi('/teams', {
        name: 'AZ Alkmaar',
        country: 'Netherlands'
      });
      
      console.log('📊 Teams API Response:', response);
      
      const azTeam = response.response.find(item => 
        item.team.name.toLowerCase().includes('az') && 
        item.team.name.toLowerCase().includes('alkmaar')
      );
      
      const teamId = azTeam ? azTeam.team.id : null;
      console.log('🆔 AZ Team ID found:', teamId);
      
      return teamId;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
