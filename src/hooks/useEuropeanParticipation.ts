
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

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
      
      // Get current season info
      const seasonInfo = getCurrentActiveSeason();
      const seasons = [seasonInfo.currentSeason];
      
      // If we're in early season (before August), also check next season
      if (seasonInfo.currentSeason === '2024') {
        seasons.push('2025');
      }
      
      console.log('🏆 Checking AZ European participation for seasons:', seasons);
      
      // Check European competitions: Conference League (848), Europa League (3), Champions League (2)
      const competitions = [
        { id: '848', name: 'Conference League' },
        { id: '3', name: 'Europa League' },
        { id: '2', name: 'Champions League' }
      ];
      
      // Try each season, prioritizing the newer one
      for (const season of seasons.reverse()) {
        console.log(`📅 Checking season ${season}...`);
        
        for (const comp of competitions) {
          try {
            const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
              team: teamId.toString(),
              league: comp.id,
              season: season
            });
            
            console.log(`🔍 ${comp.name} ${season} - Found ${response.response?.length || 0} fixtures`);
            
            if (response.response && response.response.length > 0) {
              const fixtures = response.response;
              
              // Log fixture details for debugging
              fixtures.forEach(f => {
                console.log(`📋 Fixture: ${f.teams.home.name} vs ${f.teams.away.name} - ${f.fixture.date} - Round: ${f.league.round}`);
              });
              
              // Determine status based on fixtures and current date
              let status: 'kwalificatie' | 'poulefase' | 'knock-out' | 'niet-actief' = 'niet-actief';
              const now = new Date();
              
              // Check if any fixture is in qualification rounds (including Dutch variants)
              const hasQualification = fixtures.some(f => {
                const round = f.league.round.toLowerCase();
                return round.includes('qualification') ||
                       round.includes('qualifying') ||
                       round.includes('kwalificatie') ||
                       round.includes('voorronde') ||
                       round.includes('preliminary');
              });
              
              // Check if any fixture is in group stage/poulefase/league stage
              const hasGroupStage = fixtures.some(f => {
                const round = f.league.round.toLowerCase();
                return round.includes('group') ||
                       round.includes('matchday') ||
                       round.includes('poulefase') ||
                       round.includes('poule') ||
                       round.includes('league stage') ||
                       round.includes('league phase');
              });
              
              // Check if any fixture is in knockout stage
              const hasKnockout = fixtures.some(f => {
                const round = f.league.round.toLowerCase();
                return round.includes('final') ||
                       round.includes('semi') ||
                       round.includes('quarter') ||
                       round.includes('round of');
              });
              
              // Determine current status
              if (hasKnockout) {
                status = 'knock-out';
              } else if (hasGroupStage) {
                status = 'poulefase';
              } else if (hasQualification) {
                status = 'kwalificatie';
              }
              
              console.log(`✅ AZ found in ${comp.name} (${season}) with status: ${status}`);
              
              return {
                active: true,
                competition: comp.id,
                competitionName: comp.name,
                fixtures,
                status
              };
            }
          } catch (error) {
            console.error(`❌ Error checking ${comp.name} for season ${season}:`, error);
          }
        }
      }
      
      console.log('❌ No European participation found for AZ');
      return { active: false, competition: null, competitionName: null, fixtures: [], status: 'niet-actief' };
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
  });
};
