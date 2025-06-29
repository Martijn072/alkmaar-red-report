
import { useState } from 'react';
import { useAZTeamId, useAZFixtures, useNextAZFixture } from '@/hooks/useFootballApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';

export const FootballApiTest = () => {
  const [showTest, setShowTest] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: teamId, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError, refetch: refetchFixtures } = useAZFixtures(teamId, 5);
  const { data: nextFixture, isLoading: nextLoading, error: nextError, refetch: refetchNext } = useNextAZFixture(teamId);

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    refetchTeam();
    refetchFixtures();
    refetchNext();
  };

  if (!showTest) {
    return (
      <div className="p-4">
        <Button 
          onClick={() => setShowTest(true)}
          className="bg-az-red hover:bg-red-700 text-white"
        >
          Test API-Football Integratie
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API-Football Test Resultaten</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Vernieuw
          </Button>
          <Button 
            onClick={() => setShowTest(false)}
            variant="outline"
          >
            Verberg Test
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Informatie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Refresh Key:</strong> {refreshKey}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString('nl-NL')}</div>
            <div className="text-xs text-gray-600">
              Open Developer Tools (F12) → Console voor gedetailleerde logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team ID Test */}
      <Card>
        <CardHeader>
          <CardTitle>1. AZ Team ID Zoeken</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Zoeken naar AZ team...</span>
            </div>
          )}
          {teamError && (
            <div className="space-y-2">
              <div className="text-red-600">
                <strong>❌ Error:</strong> {teamError.message}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">Volledige error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(teamError, null, 2)}
                </pre>
              </details>
            </div>
          )}
          {teamId && (
            <div className="text-green-600">
              <strong>✅ Succes!</strong> AZ Team ID: {teamId}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixtures Test */}
      <Card>
        <CardHeader>
          <CardTitle>2. Laatste 5 AZ Wedstrijden</CardTitle>
        </CardHeader>
        <CardContent>
          {fixturesLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Laden van wedstrijden...</span>
            </div>
          )}
          {fixturesError && (
            <div className="space-y-2">
              <div className="text-red-600">
                <strong>❌ Error:</strong> {fixturesError.message}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">Volledige error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(fixturesError, null, 2)}
                </pre>
              </details>
            </div>
          )}
          {fixtures && fixtures.length > 0 && (
            <div className="space-y-2">
              <div className="text-green-600">
                <strong>✅ Succes!</strong> {fixtures.length} wedstrijden gevonden:
              </div>
              {fixtures.slice(0, 3).map((fixture, index) => (
                <div key={fixture.fixture.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold">
                    {fixture.teams.home.name} vs {fixture.teams.away.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Score: {fixture.goals.home} - {fixture.goals.away}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(fixture.fixture.date).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Fixture Test */}
      <Card>
        <CardHeader>
          <CardTitle>3. Volgende AZ Wedstrijd</CardTitle>
        </CardHeader>
        <CardContent>
          {nextLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Laden van volgende wedstrijd...</span>
            </div>
          )}
          {nextError && (
            <div className="space-y-2">
              <div className="text-red-600">
                <strong>❌ Error:</strong> {nextError.message}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">Volledige error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(nextError, null, 2)}
                </pre>
              </details>
            </div>
          )}
          {nextFixture && (
            <div className="space-y-2">
              <div className="text-green-600">
                <strong>✅ Succes!</strong> Volgende wedstrijd gevonden:
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">
                  {nextFixture.teams.home.name} vs {nextFixture.teams.away.name}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(nextFixture.fixture.date).toLocaleDateString('nl-NL')} om{' '}
                  {new Date(nextFixture.fixture.date).toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {nextFixture.league.name}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
