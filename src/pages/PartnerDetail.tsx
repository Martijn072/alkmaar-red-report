import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Heart, Star, ExternalLink, MapPin, Phone, Mail, Clock } from "lucide-react";

// Sample partners data (in real app, this would come from API/database)
const partnersData = [
  {
    id: "restaurant-de-kikker",
    name: "Restaurant De Kikker",
    description: "Authentiek Noord-Hollands restaurant met passie voor lokale producten",
    logo: "/placeholder.svg",
    tier: "premium",
    since: "2022",
    category: "Horeca",
    fullDescription: "Restaurant De Kikker is al jaren een begrip in Alkmaar. Wij serveren authentieke Noord-Hollandse gerechten bereid met verse, lokale ingrediënten. Onze chef werkt samen met lokale boeren en leveranciers om de beste kwaliteit te garanderen.",
    website: "https://restaurant-de-kikker.nl",
    phone: "072-123-4567",
    email: "info@restaurant-de-kikker.nl",
    address: "Grote Kerkstraat 15, 1811 CS Alkmaar",
    hours: "Di-Zo: 17:00-22:00",
    partnershipReason: "Restaurant De Kikker steunt AZFanpage omdat we geloven in onafhankelijke, lokale berichtgeving. Als lokaal bedrijf vinden we het belangrijk dat AZ supporters een betrouwbare bron hebben voor nieuws over hun favoriete club, zonder advertenties die de leeservaring verstoren."
  },
  {
    id: "autobedrijf-alkmaar",
    name: "Autobedrijf van der Berg",
    description: "Familiebedrijf gespecialiseerd in Volkswagen en Audi",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Automotive",
    fullDescription: "Autobedrijf van der Berg is een familiebedrijf dat zich al 25 jaar specialiseert in de verkoop en onderhoud van Volkswagen en Audi voertuigen. Wij staan bekend om onze persoonlijke benadering en eerlijke adviezen.",
    website: "https://autoberg-alkmaar.nl",
    phone: "072-987-6543",
    email: "info@autoberg-alkmaar.nl",
    address: "Industrieweg 42, 1812 RS Alkmaar",
    hours: "Ma-Vr: 8:00-18:00, Za: 9:00-17:00",
    partnershipReason: "Wij ondersteunen AZFanpage omdat we als AZ supporters zelf waarde hechten aan betrouwbaar nieuws over onze club. Een advertentievrije omgeving zorgt ervoor dat fans zich kunnen focussen op wat echt belangrijk is: de club en de community."
  },
  {
    id: "bouwbedrijf-noordholland",
    name: "Bouwbedrijf Noord-Holland",
    description: "Duurzaam bouwen voor particulieren en bedrijven",
    logo: "/placeholder.svg",
    tier: "premium",
    since: "2021",
    category: "Bouw",
    fullDescription: "Bouwbedrijf Noord-Holland realiseert duurzame bouwprojecten voor zowel particulieren als bedrijven. Met 30 jaar ervaring en focus op innovatieve, milieuvriendelijke oplossingen zijn wij uw partner voor elk bouwproject.",
    website: "https://bouw-noordholland.nl",
    phone: "072-456-7890",
    email: "contact@bouw-noordholland.nl",
    address: "Bouwlaan 88, 1813 KL Alkmaar",
    hours: "Ma-Vr: 7:30-17:00",
    partnershipReason: "Als bouwbedrijf bouwen wij aan de toekomst, net zoals AZFanpage bouwt aan een sterke supporterscommunity. We steunen hun missie voor onafhankelijke berichtgeving omdat dit bijdraagt aan een hechte, goed geïnformeerde AZ familie."
  },
  {
    id: "kapper-alkmaar-centrum",
    name: "Kapsalon Centrum",
    description: "Modern haar- en baardverzorging in het hart van Alkmaar",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Wellness",
    fullDescription: "Kapsalon Centrum biedt moderne kap- en baardverzorging voor mannen en vrouwen. Onze ervaren stylisten blijven op de hoogte van de laatste trends en zorgen ervoor dat elke klant de salon verlaat met een perfecte look.",
    website: "https://kapsalon-centrum-alkmaar.nl",
    phone: "072-234-5678",
    email: "info@kapsalon-centrum.nl",
    address: "Langestraat 29, 1811 JC Alkmaar",
    hours: "Ma: Gesloten, Di-Vr: 9:00-18:00, Za: 8:00-16:00",
    partnershipReason: "In onze kapsalon praten we veel over AZ met onze klanten. AZFanpage zorgt ervoor dat we allemaal goed geïnformeerd zijn over de laatste ontwikkelingen. Hun onafhankelijke benadering past perfect bij onze waarden als lokaal bedrijf."
  },
  {
    id: "fietsenwinkel-de-wieler",
    name: "Fietsenwinkel De Wieler",
    description: "Al 40 jaar specialist in elektrische en sportfietsen",
    logo: "/placeholder.svg",
    tier: "premium",
    since: "2022",
    category: "Sport & Recreatie",
    fullDescription: "Fietsenwinkel De Wieler bestaat al 40 jaar en is uitgegroeid tot specialist in elektrische fietsen, sportfietsen en accessoires. Van advies tot reparatie, wij staan voor elke fietser klaar met vakkundig advies en service.",
    website: "https://dewieler-alkmaar.nl",
    phone: "072-345-6789",
    email: "service@dewieler-alkmaar.nl",
    address: "Fietsstraat 12, 1814 AB Alkmaar",
    hours: "Ma: 13:00-18:00, Di-Vr: 9:00-18:00, Za: 9:00-17:00",
    partnershipReason: "Net zoals wielrennen draait om doorzettingsvermogen en passie, zo bewonderen wij de toewijding van AZFanpage aan kwalitatieve, onafhankelijke berichtgeving. Als AZ supporters waarderen we hun werk enorm en willen we hen steunen in hun missie."
  },
  {
    id: "advocatenkantoor-legal",
    name: "Advocatenkantoor Legal+",
    description: "Juridische expertise op het gebied van ondernemingsrecht",
    logo: "/placeholder.svg",
    tier: "standard",
    since: "2023",
    category: "Juridisch",
    fullDescription: "Advocatenkantoor Legal+ is gespecialiseerd in ondernemingsrecht, contractenrecht en geschillenbeslechting. Wij bieden juridische expertise aan zowel startups als gevestigde bedrijven in de regio Noord-Holland.",
    website: "https://legalplus-alkmaar.nl",
    phone: "072-567-8901",
    email: "advies@legalplus-alkmaar.nl",
    address: "Rechtstraat 45, 1815 CD Alkmaar",
    hours: "Ma-Vr: 9:00-17:00 (afspraken mogelijk)",
    partnershipReason: "Als advocatenkantoor waarderen wij onafhankelijke, betrouwbare informatievoorziening. AZFanpage toont met hun werkwijze aan hoe belangrijk objectieve berichtgeving is. We steunen hen graag in hun missie om AZ supporters goed geïnformeerd te houden."
  }
];

export default function PartnerDetail() {
  const [activeTab, setActiveTab] = useState("home");
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const partner = partnersData.find(p => p.id === partnerId);

  if (!partner) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-headline-lg mb-4">Partner niet gevonden</h1>
            <Button onClick={() => navigate("/partners")}>
              Terug naar Partners
            </Button>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const handleWebsiteClick = () => {
    window.open(partner.website, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/partners")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar Partners
        </Button>

        {/* Partner Header */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-6">
            {partner.tier === "premium" && (
              <div className="flex justify-center mb-4">
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                  <Star className="w-4 h-4 mr-1" />
                  Premium Partner
                </Badge>
              </div>
            )}
            
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
              <Building2 className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <CardTitle className="text-headline-lg font-headline text-card-foreground mb-2">
              {partner.name}
            </CardTitle>
            
            <div className="flex items-center justify-center gap-4 text-body-sm text-muted-foreground">
              <Badge variant="outline">{partner.category}</Badge>
              <span>Partner sinds {partner.since}</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <CardDescription className="text-center text-body-md leading-relaxed text-muted-foreground">
              {partner.fullDescription}
            </CardDescription>
          </CardContent>
        </Card>

        {/* Partnership Reason */}
        <Card className="mb-8 bg-gradient-to-br from-az-red/5 to-az-red/10 dark:from-az-red/10 dark:to-az-red/20 
                         border-az-red/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-az-red" />
              <CardTitle className="text-headline-sm text-card-foreground">
                Waarom zij AZFanpage steunen
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-body-md leading-relaxed text-card-foreground italic">
              "{partner.partnershipReason}"
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-headline-sm text-card-foreground">
              Contact & Bezoekgegevens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-az-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Adres</p>
                    <p className="text-body-sm text-muted-foreground">{partner.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-az-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Openingstijden</p>
                    <p className="text-body-sm text-muted-foreground">{partner.hours}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-az-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Telefoon</p>
                    <a 
                      href={`tel:${partner.phone}`}
                      className="text-body-sm text-az-red hover:underline"
                    >
                      {partner.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-az-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-card-foreground">Email</p>
                    <a 
                      href={`mailto:${partner.email}`}
                      className="text-body-sm text-az-red hover:underline"
                    >
                      {partner.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website CTA */}
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-headline-sm font-semibold text-card-foreground mb-4">
              Ontdek meer over {partner.name}
            </h3>
            <Button 
              onClick={handleWebsiteClick}
              className="bg-az-red hover:bg-red-700 text-white"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Bezoek website
            </Button>
            <p className="text-body-sm text-muted-foreground mt-4">
              Opent in nieuwe tab
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}