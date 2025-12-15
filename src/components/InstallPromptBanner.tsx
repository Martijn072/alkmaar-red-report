import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'installPromptDismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dagen

export const InstallPromptBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check of app al geïnstalleerd is (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // Check of gebruiker binnen 7 dagen heeft gesloten
    const isDismissed = () => {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) return false;
      return Date.now() - parseInt(dismissed) < DISMISS_DURATION;
    };

    if (isDismissed()) return;

    // Detecteer iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Android/Chrome: capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS: toon banner direct als niet in Safari standalone
    if (isIOSDevice) {
      setShowBanner(true);
    }

    // Fade-in na 5 seconden
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      handleDismiss();
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    
    // Wacht tot fade-out animatie klaar is
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  if (!showBanner || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-40 lg:hidden animate-slide-up">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl relative">
        {/* Sluiten button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Sluiten"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4 pr-6">
          {/* App icoon */}
          <div className="flex-shrink-0">
            <img
              src="/images/az-fanpage-logo.png"
              alt="AZFanpage"
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-semibold text-foreground text-sm">
              Installeer AZFanpage
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
              {isIOS ? (
                <>
                  Tik op <Share className="h-3 w-3 inline" /> Delen → Zet op beginscherm
                </>
              ) : (
                'Voeg toe aan je homescreen'
              )}
            </p>
          </div>

          {/* Action button */}
          <Button
            onClick={isIOS ? handleDismiss : handleInstall}
            size="sm"
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isIOS ? 'Begrepen' : 'Installeren'}
          </Button>
        </div>
      </div>
    </div>
  );
};
