import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { WordPressAuthProvider } from "@/contexts/WordPressAuthContext";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import Index from "./pages/Index";
import News from "./pages/News";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const SpelerProfiel = lazy(() => import('./pages/SpelerProfiel'));
const SpelerStatistieken = lazy(() => import('./pages/SpelerStatistieken'));
const Eredivisie = lazy(() => import('./pages/Eredivisie'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const AZProgramma = lazy(() => import('./pages/AZProgramma'));
const ConferenceLeague = lazy(() => import('./pages/ConferenceLeague'));
const WedstrijdDetail = lazy(() => import('./pages/WedstrijdDetail'));
const JongAZ = lazy(() => import('./pages/JongAZ'));
const Forum = lazy(() => import('./pages/Forum'));
const Over = lazy(() => import('./pages/Over'));
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));

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
              <Suspense fallback={<PageSkeleton />}>
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WordPressAuthProvider>
    </DarkModeProvider>
  );
}

export default App;
