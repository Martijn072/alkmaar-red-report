import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  Users, 
  Trophy, 
  Calendar, 
  Bell, 
  MessageSquare,
  Camera,
  Newspaper,
  ExternalLink
} from "lucide-react";
import { useRecentAuthors } from "@/hooks/useRecentAuthors";

const Over = () => {
  const { data: authors, isLoading: authorsLoading } = useRecentAuthors();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pb-20 pt-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-az-red/10 dark:bg-az-red/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-az-red" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    AZFanpage
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Opgericht: februari 2000
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed italic">
                "Al meer dan 25 jaar het AZ nieuws vanuit supportersperspectief"
              </p>
            </CardContent>
          </Card>

          {/* Over Ons Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-az-red" />
                Over ons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                AZFanpage is uitgegroeid tot een toonaangevend platform voor AZ-supporters. 
                Met dagelijks duizenden bezoekers en tienduizenden volgers op social media, 
                is de site een belangrijke spil in de AZ-community.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Het platform heeft een unieke relatie opgebouwd met de club en is bij elke 
                thuiswedstrijd aanwezig op de perstribune, ondersteund door een eigen fotograaf 
                langs de lijn.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Camera className="w-4 h-4 text-az-red" />
                <span className="text-sm text-muted-foreground">
                  Een van de weinige echte supporterswebsites in Nederland
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Redactie Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-az-red" />
                Onze Redactie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Actieve auteurs van de afgelopen 3 maanden:
              </p>
              {authorsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : authors && authors.length > 0 ? (
                <div className="space-y-2">
                  {authors.map((author) => (
                    <div 
                      key={author.name} 
                      className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium text-foreground">{author.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {author.articleCount} {author.articleCount === 1 ? 'artikel' : 'artikelen'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Geen recente auteurs gevonden.
                </p>
              )}
            </CardContent>
          </Card>

          {/* App Functies Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-az-red" />
                App Functies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-az-red flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Live wedstrijdinfo</h3>
                    <p className="text-xs text-muted-foreground">Scores & programma</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Trophy className="w-5 h-5 text-az-red flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Competitiestanden</h3>
                    <p className="text-xs text-muted-foreground">Eredivisie, ECL & Eerste Divisie</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 text-az-red flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Selectie & stats</h3>
                    <p className="text-xs text-muted-foreground">Spelerstatistieken</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-az-red flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Community forum</h3>
                    <p className="text-xs text-muted-foreground">Discussieer mee</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg sm:col-span-2">
                  <Bell className="w-5 h-5 text-az-red flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Push notificaties</h3>
                    <p className="text-xs text-muted-foreground">Blijf op de hoogte van het laatste nieuws</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Footer Card */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Voor vragen of suggesties kun je terecht op ons forum of via social media.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <a 
                  href="https://x.com/azfanpage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  X / Twitter
                </a>
                <a 
                  href="https://instagram.com/azfanpage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Instagram
                </a>
                <a 
                  href="https://facebook.com/azfanpage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Facebook
                </a>
                <a 
                  href="https://azfanpage.nl/forum" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Forum
                </a>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <a 
                  href="https://072design.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Powered by 072DESIGN
                </a>
                <p className="text-xs text-muted-foreground">
                  © 2025 AZFanpage — Niet officieel gelieerd aan AZ Alkmaar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation activeTab="meer" onTabChange={() => {}} />
    </div>
  );
};

export default Over;
