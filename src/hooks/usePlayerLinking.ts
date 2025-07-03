import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
}

interface PlayerStatistics {
  player: Player;
  statistics: [{
    games: {
      appearences: number;
      minutes: number;
    };
  }];
}

interface FootballApiResponse<T> {
  response: T[];
  paging: {
    current: number;
    total: number;
  };
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

export const useCurrentPlayers = () => {
  return useQuery({
    queryKey: ['current-az-players'],
    queryFn: async () => {
      console.log('🔍 Fetching current AZ players...');
      
      // Get current AZ team ID first
      const teamsResponse: FootballApiResponse<{ team: { id: number; name: string } }> = await callFootballApi('/teams', {
        search: 'AZ Alkmaar',
        country: 'Netherlands'
      });

      console.log('🏟️ Teams response:', teamsResponse);

      const azTeam = teamsResponse.response?.find(t => 
        t.team.name.toLowerCase().includes('az') && 
        t.team.name.toLowerCase().includes('alkmaar')
      );

      if (!azTeam) {
        console.log('❌ AZ team not found');
        return [];
      }

      console.log('✅ Found AZ team:', azTeam.team);

      // Get current season players
      const playersResponse: FootballApiResponse<PlayerStatistics> = await callFootballApi('/players', {
        team: azTeam.team.id.toString(),
        season: '2025',
        league: '88' // Eredivisie
      });

      console.log('👥 Players response:', playersResponse);

      // Filter for active players with minutes
      const activePlayers = playersResponse.response?.filter(playerData => {
        const stats = playerData.statistics[0];
        return stats && (
          (stats.games?.appearences && stats.games.appearences > 0) ||
          (stats.games?.minutes && stats.games.minutes > 0)
        );
      }) || [];

      const processedPlayers = activePlayers.map(playerData => ({
        id: playerData.player.id,
        name: playerData.player.name,
        firstname: playerData.player.firstname,
        lastname: playerData.player.lastname
      }));

      console.log('✅ Processed players for linking:', processedPlayers);
      return processedPlayers;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 1,
  });
};

export const addPlayerLinksToContent = (content: string, players: Player[]): string => {
  console.log('🔗 Adding player links to content...', { contentLength: content.length, playersCount: players.length });
  
  if (!content || !players.length) {
    console.log('❌ No content or no players available for linking');
    return content;
  }

  let processedContent = content;
  const linkedPlayers = new Set<number>();

  // Sort players by name length (longest first) to avoid partial matches
  const sortedPlayers = [...players].sort((a, b) => b.name.length - a.name.length);

  sortedPlayers.forEach(player => {
    if (linkedPlayers.has(player.id)) return;

    // Create regex to match the player's full name (case insensitive)
    const nameRegex = new RegExp(`\\b${player.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    if (nameRegex.test(processedContent)) {
      console.log(`🎯 Found player "${player.name}" in content, adding link...`);
      // Replace only the first occurrence
      processedContent = processedContent.replace(nameRegex, (match) => {
        linkedPlayers.add(player.id);
        return `<a href="/speler/${player.id}" class="player-link text-az-red hover:text-red-700 underline font-medium">${match}</a>`;
      });
    }
  });

  console.log(`✅ Player linking completed. Linked ${linkedPlayers.size} players.`);
  return processedContent;
};