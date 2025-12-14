import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { NextMatchCard } from "@/components/NextMatchCard";
import { FixtureCard } from "@/components/FixtureCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { H2 } from "@/components/ui/typography";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { useJongAZTeamId, useJongAZFixtures, useJongAZNextFixtures } from "@/hooks/useJongAZHooks";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamHooks";
import { Fixture } from "@/types/footballApi";
import { Calendar, Clock } from "lucide-react";

type CompetitionFilter = 'alle' | 'eredivisie' | 'europa' | 'beker';

const Wedstrijden = () => {
  const [activeTab, setActiveTab] = useState("wedstrijden");
  const [currentView, setCurrentView] = useState<"komend" | "gespeeld">("komend");
  const [showJongAZ, setShowJongAZ] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CompetitionFilter[]>(['alle']);
  const navigate = useNavigate();

  // AZ data
  const { data: azTeamId, isLoading: azTeamLoading } = useAZTeamId();
  const { data: azUpcoming, isLoading: azUpcomingLoading } = useTeamNextFixtures(azTeamId || 0, 20);
  const { data: azPlayed, isLoading: azPlayedLoading } = useTeamFixtures(azTeamId || 0, 20);

  // Jong AZ data
  const { data: jongAZTeamId } = useJongAZTeamId();
  const { data: jongAZUpcoming, isLoading: jongAZUpcomingLoading } = useJongAZNextFixtures(jongAZTeamId, 10);
  const { data: jongAZPlayed, isLoading: jongAZPlayedLoading } = useJongAZFixtures(jongAZTeamId, 10);

  const isLoading = azTeamLoading || azUpcomingLoading || azPlayedLoading || 
                    (showJongAZ && (jongAZUpcomingLoading || jongAZPlayedLoading));

  const toggleFilter = (filter: CompetitionFilter) => {
    if (filter === 'alle') {
      setActiveFilters(['alle']);
    } else {
      const newFilters = activeFilters.filter(f => f !== 'alle');
      if (newFilters.includes(filter)) {
        const updated = newFilters.filter(f => f !== filter);
        setActiveFilters(updated.length === 0 ? ['alle'] : updated);
      } else {
        setActiveFilters([...newFilters, filter]);
      }
    }
  };

  const filterFixtures = (fixtures: Fixture[]) => {
    if (activeFilters.includes('alle')) return fixtures;
    
    return fixtures.filter(fixture => {
      const leagueId = fixture.league.id;
      if (activeFilters.includes('eredivisie') && leagueId === 88) return true;
      if (activeFilters.includes('europa') && [848, 3, 2].includes(leagueId)) return true;
      if (activeFilters.includes('beker') && leagueId === 94) return true;
      return false;
    });
  };

  const upcomingFixtures = useMemo(() => {
    let fixtures = [...(azUpcoming || [])];
    if (showJongAZ && jongAZUpcoming) {
      fixtures = [...fixtures, ...jongAZUpcoming];
    }
    return filterFixtures(fixtures).sort((a, b) => 
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  }, [azUpcoming, jongAZUpcoming, showJongAZ, activeFilters]);

  const playedFixtures = useMemo(() => {
    let fixtures = [...(azPlayed || [])].filter(f => 
      f.goals.home !== null && f.goals.away !== null
    );
    if (showJongAZ && jongAZPlayed) {
      fixtures = [...fixtures, ...jongAZPlayed.filter(f => 
        f.goals.home !== null && f.goals.away !== null
      )];
    }
    return filterFixtures(fixtures).sort((a, b) => 
      new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
    );
  }, [azPlayed, jongAZPlayed, showJongAZ, activeFilters]);

  // Group fixtures by month
  const groupByMonth = (fixtures: Fixture[]) => {
    const groups: { [key: string]: Fixture[] } = {};
    fixtures.forEach(fixture => {
      const date = new Date(fixture.fixture.date);
      const monthKey = date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(fixture);
    });
    return groups;
  };

  const upcomingGrouped = groupByMonth(upcomingFixtures);
  const playedGrouped = groupByMonth(playedFixtures);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompetitionName = (leagueId: number, leagueName: string) => {
    switch (leagueId) {
      case 88: return 'Eredivisie';
      case 848: return 'Conference League';
      case 94: return 'KNVB Beker';
      case 89: return 'Eerste Divisie';
      default: return leagueName;
    }
  };

  const getCompetitionBadgeVariant = (leagueId: number) => {
    switch (leagueId) {
      case 88: return 'default';
      case 848: return 'secondary';
      case 94: return 'destructive';
      case 89: return 'outline';
      default: return 'outline';
    }
  };

  const translateRound = (round: string) => {
    if (round.toLowerCase().includes('regular season')) return 'Competitie';
    const roundMatch = round.match(/Regular Season - (\d+)/i);
    if (roundMatch) return `Speelronde ${roundMatch[1]}`;
    const matchdayMatch = round.match(/Matchday (\d+)/i);
    if (matchdayMatch) return `Speeldag ${matchdayMatch[1]}`;
    return round;
  };

  const normalizeVenueName = (venueName: string | undefined, homeTeamName: string) => {
    if (!venueName) {
      if (homeTeamName.toLowerCase().includes('az')) return 'AFAS Stadion';
      return 'Onbekend stadion';
    }
    if (venueName.toLowerCase() === 'afas stadio') return 'AFAS Stadion';
    return venueName;
  };

  const handleFixtureClick = (fixtureId: number) => {
    navigate(`/wedstrijd/${fixtureId}`);
  };

  const filters: { id: CompetitionFilter; label: string }[] = [
    { id: 'alle', label: 'Alle' },
    { id: 'eredivisie', label: 'Eredivisie' },
    { id: 'europa', label: 'Europa' },
    { id: 'beker', label: 'Beker' },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-s py-m md:py-l">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-m">
            <H2 className="text-az-black dark:text-white animate-fade-in">
              Wedstrijden
            </H2>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="jong-az-toggle"
                checked={showJongAZ}
                onCheckedChange={setShowJongAZ}
              />
              <Label htmlFor="jong-az-toggle" className="text-sm text-premium-gray-600 dark:text-gray-400">
                Toon Jong AZ
              </Label>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-m overflow-x-auto pb-2">
            {filters.map(filter => (
              <Badge
                key={filter.id}
                variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  activeFilters.includes(filter.id) 
                    ? 'bg-az-red hover:bg-az-red/90 text-white' 
                    : 'hover:bg-az-red/10 hover:text-az-red hover:border-az-red'
                }`}
                onClick={() => toggleFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
          
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "komend" | "gespeeld")} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-m bg-card border border-border">
              <TabsTrigger 
                value="komend" 
                className="flex items-center gap-2 data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4" />
                Komend
              </TabsTrigger>
              <TabsTrigger 
                value="gespeeld" 
                className="flex items-center gap-2 data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Clock className="w-4 h-4" />
                Gespeeld
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="komend" className="mt-0 space-y-m animate-fade-in">
              {/* Next Match Card - prominent */}
              <NextMatchCard />
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : upcomingFixtures.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-premium-gray-400" />
                  <p className="text-premium-gray-600 dark:text-gray-400">
                    Geen komende wedstrijden gepland
                  </p>
                </div>
              ) : (
                Object.entries(upcomingGrouped).map(([month, fixtures]) => (
                  <div key={month}>
                    <h3 className="text-lg font-semibold text-az-black dark:text-white mb-3 capitalize">
                      {month}
                    </h3>
                    <div className="space-y-3">
                      {fixtures.map(fixture => (
                        <FixtureCard
                          key={fixture.fixture.id}
                          fixture={fixture}
                          onFixtureClick={handleFixtureClick}
                          formatDate={formatDate}
                          getCompetitionName={getCompetitionName}
                          getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                          translateRound={translateRound}
                          normalizeVenueName={normalizeVenueName}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="gespeeld" className="mt-0 space-y-m animate-fade-in">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : playedFixtures.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-premium-gray-400" />
                  <p className="text-premium-gray-600 dark:text-gray-400">
                    Geen gespeelde wedstrijden gevonden
                  </p>
                </div>
              ) : (
                Object.entries(playedGrouped).map(([month, fixtures]) => (
                  <div key={month}>
                    <h3 className="text-lg font-semibold text-az-black dark:text-white mb-3 capitalize">
                      {month}
                    </h3>
                    <div className="space-y-3">
                      {fixtures.map(fixture => (
                        <FixtureCard
                          key={fixture.fixture.id}
                          fixture={fixture}
                          onFixtureClick={handleFixtureClick}
                          formatDate={formatDate}
                          getCompetitionName={getCompetitionName}
                          getCompetitionBadgeVariant={getCompetitionBadgeVariant}
                          translateRound={translateRound}
                          normalizeVenueName={normalizeVenueName}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Wedstrijden;
