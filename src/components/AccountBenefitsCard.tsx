
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Smartphone, Clock, Bell, User, Shield } from "lucide-react";

const AccountBenefitsCard = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Mail,
      title: "Email notificaties",
      description: "Ontvang belangrijke updates via email"
    },
    {
      icon: Smartphone,
      title: "Push notificaties",
      description: "Directe meldingen op je apparaat"
    },
    {
      icon: Clock,
      title: "Stille uren",
      description: "Stel tijden in wanneer je geen notificaties wilt"
    },
    {
      icon: Bell,
      title: "Gepersonaliseerde instellingen",
      description: "Kies precies welke notificaties je wilt ontvangen"
    },
    {
      icon: User,
      title: "Persoonlijk profiel",
      description: "Beheer je voorkeuren en instellingen"
    },
    {
      icon: Shield,
      title: "Veilige opslag",
      description: "Je voorkeuren worden veilig bewaard"
    }
  ];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">
          Maak een gratis account aan
        </CardTitle>
        <CardDescription className="text-lg">
          Ontgrendel alle notificatie-opties en personaliseer je ervaring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center space-y-4">
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="w-full max-w-xs"
          >
            Maak gratis account aan
          </Button>
          <p className="text-xs text-muted-foreground">
            Al een account?{" "}
            <button 
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Log hier in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBenefitsCard;
