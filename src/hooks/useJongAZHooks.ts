
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Team, Fixture, Standing } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';
import { useLeagueIdByName } from './useLeagueId';

// Hook to find Jong AZ team ID
export const useJongAZTeamId = () => {
  return useQuery({
    queryKey: ['jong-az-team-id'],
    queryFn: async () => {
      console.log('🔍 Searching for Jong AZ team ID...');
      const response: FootballApiResponse<{ team: Team }> = await callFootballApi('/teams', {
        name: 'Jong AZ',
        country: 'Netherlands'
      });
      
      console.log('📊 Jong AZ Teams API Response:', response);
      
      const jongAZTeam = response.response.find(item => 
        item.team.name.toLowerCase().includes('jong') && 
        item.team.name.toLowerCase().includes('az')
      );
      
      let teamId = jongAZTeam ? jongAZTeam.team.id : null;
      
      // Fallback to known ID if API doesn't return Jong AZ for some reason
      if (!teamId) {
        console.warn('⚠️ Jong AZ not found via API, falling back to static ID 418');
        teamId = 418; // API-Football ID for Jong AZ
      }
      
      console.log('🆔 Jong AZ Team ID found:', teamId);
      
      return teamId;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ fixtures (recent)
export const useJongAZFixtures = (teamId: number | null, last: number = 5) => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: leagueData } = useLeagueIdByName('Netherlands', 'Eerste Divisie');
  
  return useQuery({
    queryKey: ['jong-az-fixtures', teamId, last, seasonInfo.currentSeason, leagueData?.id],
    queryFn: async () => {
      if (!teamId || !leagueData?.id) {
        console.log('⏸️ No Jong AZ team ID or league ID available for fixtures');
        return [];
      }
      
      console.log('📅 Fetching Jong AZ fixtures...', { 
        teamId, 
        last, 
        leagueId: leagueData.id, 
        leagueName: leagueData.name 
      });
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        last: last.toString(),
        season: seasonInfo.currentSeason,
        league: leagueData.id.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Jong AZ Fixtures API Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && !!leagueData?.id,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ upcoming fixtures
export const useJongAZNextFixtures = (teamId: number | null, next: number = 3) => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: leagueData } = useLeagueIdByName('Netherlands', 'Eerste Divisie');
  
  return useQuery({
    queryKey: ['jong-az-next-fixtures', teamId, next, seasonInfo.currentSeason, leagueData?.id],
    queryFn: async () => {
      if (!teamId || !leagueData?.id) {
        console.log('⏸️ No Jong AZ team ID or league ID available for next fixtures');
        return [];
      }
      
      console.log('🔮 Fetching upcoming Jong AZ fixtures...', { 
        teamId, 
        next, 
        leagueId: leagueData.id, 
        leagueName: leagueData.name 
      });
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        next: next.toString(),
        season: seasonInfo.currentSeason,
        league: leagueData.id.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Jong AZ Next Fixtures API Response:', response);
      return response.response || [];
    },
    enabled: !!teamId && !!leagueData?.id,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ team statistics
export const useJongAZStatistics = (teamId: number | null) => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: leagueData } = useLeagueIdByName('Netherlands', 'Eerste Divisie');
  
  return useQuery({
    queryKey: ['jong-az-statistics', teamId, seasonInfo.currentSeason, leagueData?.id],
    queryFn: async () => {
      if (!teamId || !leagueData?.id) {
        console.log('⏸️ No Jong AZ team ID or league ID available for statistics');
        return null;
      }
      
      console.log(`📊 Fetching Jong AZ statistics for ${leagueData.name} (ID: ${leagueData.id}) season ${seasonInfo.currentSeason}...`);
      
      const response: FootballApiResponse<any> = await callFootballApi('/teams/statistics', {
        league: leagueData.id.toString(),
        season: seasonInfo.currentSeason,
        team: teamId.toString()
      });
      
      console.log('📊 Jong AZ Statistics API Response:', response);
      return response.response[0] || null;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId && !!leagueData?.id,
  });
};

// Hook for Eerste Divisie standings
export const useEersteDivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: leagueData } = useLeagueIdByName('Netherlands', 'Eerste Divisie');
  
  return useQuery({
    queryKey: ['eerste-divisie-standings', seasonInfo.currentSeason, leagueData?.id],
    queryFn: async () => {
      if (!leagueData?.id) {
        console.log('⏸️ No league ID available for Eerste Divisie standings');
        return [];
      }
      
      console.log(`🏆 Fetching ${leagueData.name} standings (ID: ${leagueData.id}) for season ${seasonInfo.currentSeason}...`);
      
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: leagueData.id.toString(),
        season: seasonInfo.currentSeason
      });
      
      console.log('📊 Eerste Divisie Standings API Response:', response);
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!leagueData?.id,
  });
};
