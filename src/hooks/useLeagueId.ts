
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export const useLeagueIdByName = (country: string, leagueName: string) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['league-id', country, leagueName, seasonInfo.currentSeason],
    queryFn: async () => {
      console.log(`🔍 Searching for league: "${leagueName}" in ${country} for season ${seasonInfo.currentSeason}...`);
      
      const response: FootballApiResponse<League> = await callFootballApi('/leagues', {
        country: country,
        season: seasonInfo.currentSeason
      });
      
      console.log('📊 Leagues API Response:', response);
      
      // Filter leagues strictly by country and match robustly by name
      const leaguesInCountry = (response.response || []).filter(item => 
        item?.country?.name?.toLowerCase() === country.toLowerCase()
      );

      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
      const targets = ['eerstedivisie', 'keukenkampioendivisie'];

      const league = leaguesInCountry.find(item => {
        const name = normalize(item.name);
        return targets.some(t => name.includes(t));
      });
      
      let leagueId = league ? league.id : null;
      let foundName = league ? league.name : null;

      // Fallback to known ID if API doesn't return the league for some reason
      if (!leagueId && country.toLowerCase() === 'netherlands') {
        console.warn('⚠️ Eerste Divisie not found via API, falling back to static ID 89');
        leagueId = 89; // API-Football ID for Keuken Kampioen Divisie (Eerste Divisie)
        foundName = 'Keuken Kampioen Divisie';
      }
      
      console.log(`🆔 League found: "${foundName}" with ID: ${leagueId}`);
      
      return { id: leagueId, name: foundName };
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
