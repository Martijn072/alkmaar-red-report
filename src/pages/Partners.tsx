import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Heart, Star } from "lucide-react";

// Sample partners data
const partnersData = [
  {
    id: "restaurant-de-kikker",
    name: "Restaurant De Kikker",
    description: "Authentiek Noord-Hollands restaurant met passie voor lokale producten",
    logo: "/placeholder.svg",
    tier: "premium",
    since: "2022",
    category: "Horeca"
  },
  {
    id: "autobedrijf-alkmaar",
    name: "Autobedrijf van der Berg",
    description: "Familiebedrijf gespecialiseerd in Volkswagen en Audi",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Automotive"
  },
  {
    id: "bouwbedrijf-noordholland",
    name: "Bouwbedrijf Noord-Holland",
    description: "Duurzaam bouwen voor particulieren en bedrijven",
    logo: "/placeholder.svg",
    tier: "premium", 
    since: "2021",
    category: "Bouw"
  },
  {
    id: "kapper-alkmaar-centrum",
    name: "Kapsalon Centrum",
    description: "Modern haar- en baardverzorging in het hart van Alkmaar",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Wellness"
  },
  {
    id: "fietsenwinkel-de-wieler",
    name: "Fietsenwinkel De Wieler",
    description: "Al 40 jaar specialist in elektrische en sportfietsen",
    logo: "/placeholder.svg",
    tier: "premium",
    since: "2022",
    category: "Sport & Recreatie"
  },
  {
    id: "advocatenkantoor-legal",
    name: "Advocatenkantoor Legal+",
    description: "Juridische expertise op het gebied van ondernemingsrecht",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Juridisch"
  }
];

export default function Partners() {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  // Sort partners by tier (premium first) and then by name
  const sortedPartners = [...partnersData].sort((a, b) => {
    if (a.tier === "premium" && b.tier !== "premium") return -1;
    if (b.tier === "premium" && a.tier !== "premium") return 1;
    return a.name.localeCompare(b.name);
  });

  const handlePartnerClick = (partnerId: string) => {
    navigate(`/partner/${partnerId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-az-red" />
            <h1 className="text-headline-lg font-headline text-foreground">
              AZFanpage Partners
            </h1>
          </div>
          
          <p className="text-body-lg text-muted-foreground mb-4 max-w-3xl mx-auto">
            Dankzij onze partners blijft AZFanpage advertentievrij
          </p>
          
          <div className="bg-gradient-to-br from-az-red/5 to-az-red/10 dark:from-az-red/10 dark:to-az-red/20 
                          rounded-xl p-6 border border-az-red/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-az-red" />
              <h2 className="text-headline-sm font-semibold text-foreground">
                Partners die onze missie steunen
              </h2>
            </div>
            <p className="text-body-md text-muted-foreground leading-relaxed">
              Deze lokale bedrijven maken onze onafhankelijke berichtgeving mogelijk. 
              Samen houden we AZFanpage onafhankelijk en zorgen we voor een advertentievrije ervaring 
              voor alle AZ supporters.
            </p>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPartners.map((partner) => (
            <Card key={partner.id} className="group hover:shadow-lg transition-all duration-300 
                                               hover:scale-105 cursor-pointer border-border bg-card">
              <CardHeader className="text-center pb-4">
                {partner.tier === "premium" && (
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white 
                                   border-0 text-xs font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Premium Partner
                    </Badge>
                  </div>
                )}
                
                <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <CardTitle className="text-headline-sm text-card-foreground">
                  {partner.name}
                </CardTitle>
                
                <Badge variant="outline" className="w-fit mx-auto text-xs">
                  {partner.category}
                </Badge>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-center text-body-sm mb-4 text-muted-foreground">
                  {partner.description}
                </CardDescription>
                
                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground">
                    AZFanpage partner sinds {partner.since}
                  </p>
                </div>
                
                <Button 
                  onClick={() => handlePartnerClick(partner.id)}
                  className="w-full bg-az-red hover:bg-red-700 text-white"
                  size="sm"
                >
                  Ontdek {partner.name.split(' ')[0]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12 py-8 border-t border-border">
          <p className="text-body-sm text-muted-foreground mb-2">
            Interesse om AZFanpage partner te worden?
          </p>
          <p className="text-body-sm text-muted-foreground">
            Neem contact met ons op via onze sociale media kanalen
          </p>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}