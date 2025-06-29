
import { useNextAZFixture, useAZTeamId } from "@/hooks/useFootballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Calendar, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const NextMatchWidget = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { toast } = useToast();
  
  const { data: teamId, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useAZTeamId();
  const { data: nextFixture, isLoading: nextLoading, error: nextError, refetch: refetchNext } = useNextAZFixture(teamId);

  // Countdown timer
  useEffect(() => {
    if (!nextFixture) return;

    const interval = setInterval(() => {
      const matchDate = new Date(nextFixture.fixture.date);
      const now = new Date();
      const diff = matchDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}u ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}u ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Wedstrijd gestart");
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextFixture]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchTeam(),
        refetchNext(),
      ]);
      toast({
        title: "Wedstrijdgegevens bijgewerkt",
        description: "De eerstvolgende wedstrijd is opgehaald.",
      });
    } catch (error) {
      toast({
        title: "Fout bij bijwerken",
        description: "Er ging iets mis bij het ophalen van de wedstrijdgegevens.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLeagueClick = () => {
    if (nextFixture?.league.name.toLowerCase().includes('eredivisie')) {
      // In de toekomst: link naar eredivisie ranglijst
      toast({
        title: "Eredivisie ranglijst",
        description: "Binnenkort beschikbaar",
      });
    } else {
      toast({
        title: nextFixture?.league.name || "Competitie",
        description: "Ranglijst binnenkort beschikbaar",
      });
    }
  };

  const isLoading = teamLoading || nextLoading;

  // Loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          <span>Laden van wedstrijdgegevens...</span>
        </div>
      </div>
    );
  }

  // If there's a next match, show it
  if (nextFixture) {
    const matchDate = new Date(nextFixture.fixture.date);
    const isAZHome = nextFixture.teams.home.name.toLowerCase().includes('az');
    const azTeam = isAZHome ? nextFixture.teams.home : nextFixture.teams.away;
    const opponentTeam = isAZHome ? nextFixture.teams.away : nextFixture.teams.home;

    return (
      <div className="bg-gradient-to-r from-az-red to-red-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-az-red font-bold text-sm">AZ</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">{azTeam.name}</span>
            </div>
          </div>
          
          <div className="text-center px-4 sm:px-6">
            <div className="text-lg font-bold mb-1">VS</div>
            <div className="text-xs opacity-90 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {format(matchDate, 'HH:mm', { locale: nl })}
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-semibold text-sm sm:text-base">{opponentTeam.name}</span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <img 
                  src={opponentTeam.logo} 
                  alt={opponentTeam.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const fallback = target.nextElementSibling as HTMLSpanElement;
                    target.style.display = 'none';
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <span className="text-gray-600 font-bold text-xs hidden">
                  {opponentTeam.name.substring(0, 3).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="mt-4 text-center">
          <div className="text-xl font-bold text-yellow-300 mb-1">
            {timeLeft || "Bezig met laden..."}
          </div>
          <div className="text-sm opacity-90">tot aftrap</div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(matchDate, 'dd MMM yyyy', { locale: nl })}</span>
            </div>
            <button 
              onClick={handleLeagueClick}
              className="hover:underline cursor-pointer hidden sm:inline"
            >
              {nextFixture.league.name}
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 px-2 text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <span className="text-xs">{isAZHome ? 'Thuis' : 'Uit'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (teamError || nextError) {
    return (
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="text-center">
          <div className="text-lg font-bold mb-2">Geen wedstrijd gevonden</div>
          <div className="text-sm opacity-90 mb-4">
            Er kon geen eerstvolgende AZ wedstrijd worden opgehaald
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="bg-gradient-to-r from-az-red to-red-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
      <div className="text-center">
        <div className="text-lg font-bold mb-2">Geen wedstrijd gepland</div>
        <div className="text-sm opacity-90 mb-4">
          Er zijn momenteel geen eerstvolgende AZ wedstrijden gevonden
        </div>
        <Button
          variant="ghost" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Vernieuwen
        </Button>
      </div>
    </div>
  );
};
