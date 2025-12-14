
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Users, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFixtureEvents } from "@/hooks/useFixtureEvents";
import { useFixtureLineups } from "@/hooks/useFixtureLineups";
import { FixtureEventCard } from "@/components/FixtureEventCard";
import { FixtureLineupDisplay } from "@/components/FixtureLineupDisplay";
import { LiveEventIndicator } from "@/components/LiveEventIndicator";

interface FixtureDetail {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    venue: {
      name: string;
      city: string;
    };
    referee: string;
  };
  league: {
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FixtureEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  type: string;
  detail: string;
  player: {
    name: string;
  };
  team: {
    id: number;
    name: string;
  };
  assist?: {
    name: string;
  };
}

interface FixtureStats {
  team: {
    id: number;
    name: string;
  };
  statistics: Array<{
    type: string;
    value: string | number;
  }>;
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

const WedstrijdDetail = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("programma");
  const [selectedMatchTab, setSelectedMatchTab] = useState("overzicht");

  const { data: fixtureData, isLoading: fixtureLoading } = useQuery({
    queryKey: ['fixture-detail', fixtureId],
    queryFn: async () => {
      const response = await callFootballApi('/fixtures', {
        id: fixtureId!
      });
      return response.response[0] as FixtureDetail;
    },
    enabled: !!fixtureId,
  });

  const { data: eventsData, isLoading: eventsLoading } = useFixtureEvents(fixtureId || null);
  const { data: lineupsData, isLoading: lineupsLoading } = useFixtureLineups(fixtureId || null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['fixture-statistics', fixtureId],
    queryFn: async () => {
      const response = await callFootballApi('/fixtures/statistics', {
        fixture: fixtureId!
      });
      return response.response as FixtureStats[];
    },
    enabled: !!fixtureId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translateLeagueName = (leagueName: string) => {
    const lowerName = leagueName.toLowerCase();
    if (lowerName.includes('friendlies') || 
        lowerName.includes('friendly') || 
        lowerName.includes('vriendschappelijk')) {
      return 'Vriendschappelijk';
    }
    return leagueName;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NS': return 'Te spelen';
      case 'FT': return 'Afgelopen';
      case 'LIVE': return 'Live';
      case '1H': return '1e helft';
      case 'HT': return 'Rust';
      case '2H': return '2e helft';
      default: return status;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Goal': return '⚽';
      case 'Card': return '📋';
      case 'subst': return '🔄';
      case 'Var': return '📺';
      default: return '•';
    }
  };

  const translateStatType = (type: string) => {
    const translations: { [key: string]: string } = {
      'Shots on Goal': 'Schoten op doel',
      'Shots off Goal': 'Schoten naast',
      'Total Shots': 'Totaal schoten',
      'Blocked Shots': 'Geblokkeerde schoten',
      'Shots insidebox': 'Schoten in strafschopgebied',
      'Shots outsidebox': 'Schoten buiten strafschopgebied',
      'Fouls': 'Overtredingen',
      'Corner Kicks': 'Hoekschoppen',
      'Offsides': 'Buitenspel',
      'Ball Possession': 'Balbezit',
      'Yellow Cards': 'Gele kaarten',
      'Red Cards': 'Rode kaarten',
      'Goalkeeper Saves': 'Reddingen keeper',
      'Total passes': 'Totaal passes',
      'Passes accurate': 'Passes juist',
      'Passes %': 'Pasnauwkeurigheid',
      'Expected Goals': 'Verwachte doelpunten',
      'expected_goals': 'Verwachte doelpunten',
      'goals_prevented': 'Voorkomen doelpunten',
      'Pass percentage': 'Pasnauwkeurigheid'
    };
    return translations[type] || type;
  };

  const getEventTypeText = (type: string, detail: string) => {
    switch (type) {
      case 'Goal':
        if (detail === 'Normal Goal') return 'Doelpunt';
        if (detail === 'Own Goal') return 'Eigen doelpunt';
        if (detail === 'Penalty') return 'Penalty';
        return 'Doelpunt';
      case 'Card':
        if (detail === 'Yellow Card') return 'Gele kaart';
        if (detail === 'Red Card') return 'Rode kaart';
        return 'Kaart';
      case 'subst':
        return 'Wissel';
      case 'Var':
        return 'VAR';
      default:
        return detail;
    }
  };

  if (fixtureLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!fixtureData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Wedstrijd niet gevonden
            </p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Terug naar programma
            </Button>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const isAZHome = fixtureData.teams.home.name.toLowerCase().includes('az');
  const isAZAway = fixtureData.teams.away.name.toLowerCase().includes('az');
  const isAZMatch = isAZHome || isAZAway;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pt-6 pb-20">
        {/* Back button with AZ-red styling */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 text-premium-gray-600 dark:text-gray-300 hover:text-az-red dark:hover:text-az-red focus-visible:ring-az-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>

        {/* Match header */}
        <Card className="mb-6 bg-card border border-border">
          <CardHeader className="text-center">
            {/* Competition name at top */}
            <div className="mb-4">
              <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                {translateLeagueName(fixtureData.league.name)}
              </p>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center justify-center mb-4">
              <LiveEventIndicator 
                status={fixtureData.fixture.status.short}
                elapsed={fixtureData.fixture.status.elapsed}
              />
            </div>
            
            {/* Teams and score - Mobile-first layout like AZFixtures */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 my-6">
              {/* Home team */}
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={fixtureData.teams.home.logo} 
                  alt={fixtureData.teams.home.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>

              {/* Score or VS */}
              <div className="flex flex-col items-center justify-center">
                {fixtureData.goals.home !== null && fixtureData.goals.away !== null ? (
                  <>
                    <div className="text-3xl sm:text-4xl font-bold text-az-red mb-2">
                      {fixtureData.goals.home} - {fixtureData.goals.away}
                    </div>
                    {fixtureData.score.halftime.home !== null && (
                      <div className="text-sm text-premium-gray-600 dark:text-gray-400">
                        Rust: {fixtureData.score.halftime.home} - {fixtureData.score.halftime.away}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-2xl font-bold text-premium-gray-400">
                    vs
                  </div>
                )}
                {fixtureData.fixture.status.elapsed && (
                  <div className="text-sm text-premium-gray-600 dark:text-gray-400 mt-1">
                    {fixtureData.fixture.status.elapsed}'
                  </div>
                )}
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={fixtureData.teams.away.logo} 
                  alt={fixtureData.teams.away.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
            </div>

            {/* Basic match info - only date/time */}
            <div className="flex items-center justify-center gap-2 text-sm text-premium-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(fixtureData.fixture.date)}</span>
            </div>
          </CardHeader>
        </Card>

        {/* Match Details Tabs */}
        <Tabs value={selectedMatchTab} onValueChange={setSelectedMatchTab} className="space-y-6">
          <TabsList className="flex w-full bg-muted">
            <TabsTrigger value="overzicht" className="flex-1 text-xs sm:text-sm">Overzicht</TabsTrigger>
            <TabsTrigger value="live" className="flex-1 text-xs sm:text-sm">Live</TabsTrigger>
            <TabsTrigger value="opstellingen" className="flex-1 text-xs sm:text-sm">Opstellingen</TabsTrigger>
            <TabsTrigger value="statistieken" className="flex-1 text-xs sm:text-sm">Statistieken</TabsTrigger>
          </TabsList>

          {/* Overzicht Tab */}
          <TabsContent value="overzicht" className="space-y-6">
            {/* Match info */}
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm text-premium-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(fixtureData.fixture.date)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{fixtureData.fixture.venue.name}, {fixtureData.fixture.venue.city}</span>
                  </div>
                  {fixtureData.fixture.referee && (
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Scheidsrechter: {fixtureData.fixture.referee}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Events Tab */}
          <TabsContent value="live" className="space-y-6">
            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : eventsData && eventsData.length > 0 ? (
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-az-black dark:text-white">
                    <Clock className="w-5 h-5 text-az-red" />
                    Wedstrijdverloop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventsData.map((event, index) => {
                      const isAZEvent = event.team.name.toLowerCase().includes('az');
                      return (
                        <FixtureEventCard 
                          key={index}
                          event={event}
                          isAZEvent={isAZEvent}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border border-border">
                <CardContent className="text-center py-8">
                  <p className="text-premium-gray-600 dark:text-gray-300">
                    Nog geen wedstrijdgebeurtenissen
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Lineups Tab */}
          <TabsContent value="opstellingen" className="space-y-6">
            {lineupsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <FixtureLineupDisplay 
                homeLineup={lineupsData?.[0] || null}
                awayLineup={lineupsData?.[1] || null}
              />
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistieken" className="space-y-6">
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : statsData && statsData.length > 0 ? (
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-az-black dark:text-white">
                    <Target className="w-5 h-5 text-az-red" />
                    Statistieken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData[0]?.statistics.map((stat, index) => {
                      const homeStat = statsData[0]?.statistics[index];
                      const awayStat = statsData[1]?.statistics[index];
                      
                      if (!homeStat || !awayStat) return null;
                      
                      return (
                        <div key={stat.type} className="space-y-2">
                          <div className="text-center text-sm text-premium-gray-600 dark:text-gray-400 font-medium">
                            {translateStatType(stat.type)}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                              <span className="font-bold text-az-red">{homeStat.value}</span>
                            </div>
                            <div className="text-center flex-1">
                              <span className="font-bold text-az-red">{awayStat.value}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-premium-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-az-red transition-all duration-300"
                              style={{ 
                                width: `${(parseFloat(String(homeStat.value)) / (parseFloat(String(homeStat.value)) + parseFloat(String(awayStat.value)))) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
                <CardContent className="text-center py-8">
                  <p className="text-premium-gray-600 dark:text-gray-300">
                    Statistieken nog niet beschikbaar
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default WedstrijdDetail;
