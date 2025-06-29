
// Re-export all hooks from their respective files
export { useAZTeamId } from './useTeamHooks';
export { 
  useAZFixtures, 
  useNextAZFixture, 
  useLiveAZFixture, 
  useConferenceLeagueFixtures 
} from './useFixtureHooks';
export { useEredivisieStandings } from './useStandingHooks';

// Export types for convenience
export type { FootballApiResponse, Team, Fixture, Standing } from '@/types/footballApi';
