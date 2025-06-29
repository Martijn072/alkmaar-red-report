
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ConferenceLeagueStandings } from "@/components/ConferenceLeagueStandings";
import { ConferenceLeagueFixtures } from "@/components/ConferenceLeagueFixtures";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAZTeamId } from "@/hooks/useFootballApi";

const ConferenceLeague = () => {
  const [activeTab, setActiveTab] = useState("europa");
  const { data: teamId, isLoading: teamIdLoading, error: teamIdError, refetch: refetchTeamId } = useAZTeamId();

  if (teamIdError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20 bg-white dark:bg-gray-900">
          <ErrorMessage onRetry={() => refetchTeamId()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main className="px-4 pb-20 pt-6 bg-white dark:bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <div className="mb-8 bg-white dark:bg-gray-900">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-4 text-az-black dark:text-white leading-tight">
              Conference League
            </h1>
            <p className="body-premium text-body-lg text-premium-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Volg AZ in de UEFA Conference League. Bekijk de groepsstand en alle Europese wedstrijden.
            </p>
          </div>
        </div>

        {/* Conference League Standings */}
        <div className="mb-8 bg-white dark:bg-gray-900">
          <ConferenceLeagueStandings />
        </div>

        {/* Conference League Fixtures */}
        <div className="bg-white dark:bg-gray-900">
          <ConferenceLeagueFixtures teamId={teamId} isLoadingTeamId={teamIdLoading} />
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ConferenceLeague;
