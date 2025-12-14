
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AZPlayerStats } from "@/components/AZPlayerStats";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { ErrorMessage } from "@/components/ErrorMessage";

const SpelerStatistieken = () => {
  const [activeTab, setActiveTab] = useState("spelers");
  const { data: teamId, isLoading: teamIdLoading, error: teamIdError, refetch: refetchTeamId } = useAZTeamId();

  if (teamIdError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <ErrorMessage onRetry={() => refetchTeamId()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pb-20 pt-6">
        <div>
          <AZPlayerStats teamId={teamId} isLoadingTeamId={teamIdLoading} />
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SpelerStatistieken;
