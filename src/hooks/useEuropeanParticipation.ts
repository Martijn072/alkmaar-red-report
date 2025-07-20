
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';

interface EuropeanParticipation {
  active: boolean;
  competition: string | null;
  competitionName: string | null;
  fixtures: Fixture[];
  status: 'kwalificatie' | 'poulefase' | 'knock-out' | 'niet-actief';
}

export const useEuropeanParticipation = (teamId: number | null) => {
  return useQuery({
    queryKey: ['european-participation', teamId],
    queryFn: async (): Promise<EuropeanParticipation> => {
      if (!teamId) {
        return { active: false, competition: null, competitionName: null, fixtures: [], status: 'niet-actief' };
      }
      
      // Check European competitions: Conference League (848), Europa League (3), Champions League (2)
      const competitions = [
        { id: '848', name: 'Conference League' },
        { id: '3', name: 'Europa League' },
        { id: '2', name: 'Champions League' }
      ];
      
      for (const comp of competitions) {
        try {
          const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
            team: teamId.toString(),
            league: comp.id,
            season: '2024'
          });
          
          if (response.response && response.response.length > 0) {
            const fixtures = response.response;
            
            // Determine status based on fixtures
            let status: 'kwalificatie' | 'poulefase' | 'knock-out' | 'niet-actief' = 'niet-actief';
            
            // Check if any fixture is in qualification rounds
            const hasQualification = fixtures.some(f => 
              f.league.round.toLowerCase().includes('qualification') ||
              f.league.round.toLowerCase().includes('qualifying')
            );
            
            // Check if any fixture is in group stage
            const hasGroupStage = fixtures.some(f => 
              f.league.round.toLowerCase().includes('group') ||
              f.league.round.toLowerCase().includes('matchday')
            );
            
            // Check if any fixture is in knockout stage
            const hasKnockout = fixtures.some(f => 
              f.league.round.toLowerCase().includes('final') ||
              f.league.round.toLowerCase().includes('semi') ||
              f.league.round.toLowerCase().includes('quarter')
            );
            
            if (hasKnockout) {
              status = 'knock-out';
            } else if (hasGroupStage) {
              status = 'poulefase';
            } else if (hasQualification) {
              status = 'kwalificatie';
            }
            
            return {
              active: true,
              competition: comp.id,
              competitionName: comp.name,
              fixtures,
              status
            };
          }
        } catch (error) {
          console.error(`Error checking ${comp.name}:`, error);
        }
      }
      
      return { active: false, competition: null, competitionName: null, fixtures: [], status: 'niet-actief' };
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });
};
