
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
import Eredivisie from "./pages/Eredivisie";
import AZProgramma from "./pages/AZProgramma";
import SpelerStatistieken from "./pages/SpelerStatistieken";
import ConferenceLeague from "./pages/ConferenceLeague";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import WedstrijdDetail from "./pages/WedstrijdDetail";
import SpelerProfiel from "./pages/SpelerProfiel";
import Forum from "./pages/Forum";
import Over from "./pages/Over";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DarkModeProvider>
      <WordPressAuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/nieuws" element={<News />} />
            <Route path="/artikel/:id" element={<ArticleDetail />} />
            <Route path="/eredivisie" element={<Eredivisie />} />
            <Route path="/programma" element={<AZProgramma />} />
            <Route path="/spelers" element={<SpelerStatistieken />} />
            <Route path="/conference-league" element={<ConferenceLeague />} />
            <Route path="/notificaties" element={<Notifications />} />
            <Route path="/instellingen/notificaties" element={<NotificationSettings />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/over" element={<Over />} />
            <Route path="/wedstrijd/:fixtureId" element={<WedstrijdDetail />} />
            <Route path="/speler/:playerId" element={<SpelerProfiel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </WordPressAuthProvider>
    </DarkModeProvider>
  </QueryClientProvider>
);

export default App;
