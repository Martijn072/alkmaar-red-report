
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { WordPressAuthProvider } from "@/contexts/WordPressAuthContext";
import Index from "./pages/Index";
import News from "./pages/News";
import ArticleDetail from "./pages/ArticleDetail";
import SpelerProfiel from "./pages/SpelerProfiel";
import SpelerStatistieken from "./pages/SpelerStatistieken";
import Eredivisie from "./pages/Eredivisie";
import TeamDetail from "./pages/TeamDetail";
import AZProgramma from "./pages/AZProgramma";
import ConferenceLeague from "./pages/ConferenceLeague";
import WedstrijdDetail from "./pages/WedstrijdDetail";
import JongAZ from "./pages/JongAZ";
import Forum from "./pages/Forum";
import Over from "./pages/Over";
import { Auth } from "./pages/Auth";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvider>
      <WordPressAuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/news" element={<News />} />
                <Route path="/artikel/:id" element={<ArticleDetail />} />
                <Route path="/speler/:playerId" element={<SpelerProfiel />} />
                <Route path="/spelers" element={<SpelerStatistieken />} />
                <Route path="/eredivisie" element={<Eredivisie />} />
                <Route path="/team/:teamId" element={<TeamDetail />} />
                <Route path="/programma" element={<AZProgramma />} />
                <Route path="/conference-league" element={<ConferenceLeague />} />
                <Route path="/wedstrijd/:fixtureId" element={<WedstrijdDetail />} />
                <Route path="/jong-az" element={<JongAZ />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/over" element={<Over />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WordPressAuthProvider>
    </DarkModeProvider>
  );
}

export default App;
