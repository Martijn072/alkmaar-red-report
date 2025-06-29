import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FootballApiResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

interface Team {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

interface Fixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team & { winner: boolean | null };
    away: Team & { winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  console.log('🏈 Football API Call:', { endpoint, params });
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    const { data, error } = await supabase.functions.invoke('football-api', {
      body: { endpoint, params }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data) {
      console.error('❌ No data returned from function');
      throw new Error('No data returned from API');
    }

    if (!data.success && data.error) {
      console.error('❌ API Error from function:', data.error);
      console.error('❌ API Error details:', data.details);
      throw new Error(data.error);
    }

    console.log('✅ API Success:', data);
    return data;
  } catch (err) {
    console.error('💥 callFootballApi catch block:', err);
    throw err;
  }
};

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
  });
};

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
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
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
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures/live', {
        team: teamId.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Live Fixture API Response:', response);
      return response.response[0] || null;
    },
    enabled: !!teamId,
    refetchInterval: 30000, // Refetch every 30 seconds during live matches
    staleTime: 0, // Don't cache live data
  });
};

// Hook for Eredivisie standings
export const useEredivisieStandings = () => {
  return useQuery({
    queryKey: ['eredivisie-standings'],
    queryFn: async () => {
      console.log('🏆 Fetching Eredivisie standings...');
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '88', // Eredivisie league ID
        season: new Date().getFullYear().toString()
      });
      
      console.log('📊 Standings API Response:', response);
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};
