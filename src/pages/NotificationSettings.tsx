import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Clock, Mail, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import AccountBenefitsCard from "@/components/AccountBenefitsCard";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading, updateSettings } = useNotificationSettings();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();
  const { isAuthenticated } = useWordPressAuth();

  const [localSettings, setLocalSettings] = useState({
    email_new_comments: true,
    email_comment_replies: true,
    push_new_comments: false,
    push_comment_replies: true,
    push_new_articles: true,
    push_live_matches: true,
    push_social_media: false,
    in_app_notifications: true,
    quiet_hours_start: null as string | null,
    quiet_hours_end: null as string | null,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        email_new_comments: settings.email_new_comments ?? true,
        email_comment_replies: settings.email_comment_replies ?? true,
        push_new_comments: settings.push_new_comments ?? false,
        push_comment_replies: settings.push_comment_replies ?? true,
        push_new_articles: settings.push_new_articles ?? true,
        push_live_matches: settings.push_live_matches ?? true,
        push_social_media: settings.push_social_media ?? false,
        in_app_notifications: settings.in_app_notifications ?? true,
        quiet_hours_start: settings.quiet_hours_start,
        quiet_hours_end: settings.quiet_hours_end,
      });
    }
  }, [settings]);

  const handleSettingChange = async (key: string, value: boolean | string | null) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    try {
      await updateSettings(newSettings);
      toast({
        title: "Instellingen opgeslagen",
        description: "Je notificatie-instellingen zijn bijgewerkt",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive",
      });
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    try {
      if (enabled && !isSubscribed) {
        await subscribe();
        toast({
          title: "Push notificaties ingeschakeld",
          description: "Je ontvangt nu push notificaties",
        });
      } else if (!enabled && isSubscribed) {
        await unsubscribe();
        toast({
          title: "Push notificaties uitgeschakeld",
          description: "Je ontvangt geen push notificaties meer",
        });
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon push notificaties niet in-/uitschakelen",
        variant: "destructive",
      });
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Notificatie-instellingen</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!isAuthenticated ? (
          <AccountBenefitsCard />
        ) : (
          <>
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email notificaties</CardTitle>
                </div>
                <CardDescription>
                  Ontvang notificaties via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-new-comments">Nieuwe reacties</Label>
                  <Switch
                    id="email-new-comments"
                    checked={localSettings.email_new_comments}
                    onCheckedChange={(checked) => handleSettingChange('email_new_comments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-comment-replies">Reacties op mijn berichten</Label>
                  <Switch
                    id="email-comment-replies"
                    checked={localSettings.email_comment_replies}
                    onCheckedChange={(checked) => handleSettingChange('email_comment_replies', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle>Push notificaties</CardTitle>
                </div>
                <CardDescription>
                  Ontvang directe meldingen op je apparaat
                  {!isSupported && " (Niet ondersteund in deze browser)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSupported && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-enabled">Push notificaties inschakelen</Label>
                      <Switch
                        id="push-enabled"
                        checked={isSubscribed}
                        onCheckedChange={handlePushToggle}
                      />
                    </div>
                    
                    {isSubscribed && (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-new-articles">Nieuwe artikelen</Label>
                          <Switch
                            id="push-new-articles"
                            checked={localSettings.push_new_articles}
                            onCheckedChange={(checked) => handleSettingChange('push_new_articles', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-live-matches">Live wedstrijden</Label>
                          <Switch
                            id="push-live-matches"
                            checked={localSettings.push_live_matches}
                            onCheckedChange={(checked) => handleSettingChange('push_live_matches', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-social-media">Social media posts</Label>
                          <Switch
                            id="push-social-media"
                            checked={localSettings.push_social_media}
                            onCheckedChange={(checked) => handleSettingChange('push_social_media', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-new-comments">Nieuwe reacties</Label>
                          <Switch
                            id="push-new-comments"
                            checked={localSettings.push_new_comments}
                            onCheckedChange={(checked) => handleSettingChange('push_new_comments', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-comment-replies">Reacties op mijn berichten</Label>
                          <Switch
                            id="push-comment-replies"
                            checked={localSettings.push_comment_replies}
                            onCheckedChange={(checked) => handleSettingChange('push_comment_replies', checked)}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {!isSupported && (
                  <p className="text-sm text-muted-foreground">
                    Push notificaties worden niet ondersteund in deze browser. 
                    Probeer Chrome, Firefox, Safari of Edge.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            {isSubscribed && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Stille uren</CardTitle>
                  </div>
                  <CardDescription>
                    Geen notificaties tijdens deze uren
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">Van</Label>
                      <Select
                        value={localSettings.quiet_hours_start || ""}
                        onValueChange={(value) => handleSettingChange('quiet_hours_start', value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer tijd" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Niet ingesteld</SelectItem>
                          {timeOptions.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">Tot</Label>
                      <Select
                        value={localSettings.quiet_hours_end || ""}
                        onValueChange={(value) => handleSettingChange('quiet_hours_end', value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer tijd" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Niet ingesteld</SelectItem>
                          {timeOptions.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>In-app notificaties</CardTitle>
                </div>
                <CardDescription>
                  Toon notificaties binnen de app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-notifications">In-app notificaties</Label>
                  <Switch
                    id="in-app-notifications"
                    checked={localSettings.in_app_notifications}
                    onCheckedChange={(checked) => handleSettingChange('in_app_notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
