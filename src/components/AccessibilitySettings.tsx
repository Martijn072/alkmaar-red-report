import { useState } from "react";
import { Accessibility, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AccessibilitySettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState("100");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const applyTextSize = (size: string) => {
    document.documentElement.style.fontSize = `${size}%`;
    setTextSize(size);
  };

  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    setHighContrast(enabled);
  };

  const applyReduceMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    setReduceMotion(enabled);
  };

  const applyScreenReaderMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('screen-reader-mode');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
    }
    setScreenReaderMode(enabled);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
          aria-label="Toegankelijkheidsinstellingen openen"
        >
          <Accessibility className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-az-black dark:text-white flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Toegankelijkheidsinstellingen
          </SheetTitle>
          <SheetDescription className="text-premium-gray-600 dark:text-gray-300">
            Pas de app aan voor een betere gebruikservaring
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Text Size */}
          <div className="space-y-3">
            <Label htmlFor="text-size" className="text-sm font-medium text-az-black dark:text-white">
              Tekstgrootte
            </Label>
            <Select value={textSize} onValueChange={applyTextSize}>
              <SelectTrigger id="text-size" aria-label="Selecteer tekstgrootte" className="focus:ring-az-red border-premium-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <SelectValue className="text-az-black dark:text-white" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-premium-gray-200 dark:border-gray-700">
                <SelectItem value="100" className="hover:bg-az-red hover:text-white focus:bg-az-red focus:text-white">Normaal (100%)</SelectItem>
                <SelectItem value="125" className="hover:bg-az-red hover:text-white focus:bg-az-red focus:text-white">Groot (125%)</SelectItem>
                <SelectItem value="150" className="hover:bg-az-red hover:text-white focus:bg-az-red focus:text-white">Extra groot (150%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm font-medium text-az-black dark:text-white">
              Hoog contrast
            </Label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={applyHighContrast}
              aria-describedby="high-contrast-desc"
              className="data-[state=checked]:bg-az-red focus-visible:ring-az-red focus-visible:ring-offset-2"
            />
          </div>
          <p id="high-contrast-desc" className="text-xs text-premium-gray-500 dark:text-gray-400">
            Verhoogt het contrast voor betere leesbaarheid
          </p>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reduce-motion" className="text-sm font-medium text-az-black dark:text-white">
              Beweging verminderen
            </Label>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={applyReduceMotion}
              aria-describedby="reduce-motion-desc"
              className="data-[state=checked]:bg-az-red focus-visible:ring-az-red focus-visible:ring-offset-2"
            />
          </div>
          <p id="reduce-motion-desc" className="text-xs text-premium-gray-500 dark:text-gray-400">
            Vermindert animaties en bewegende elementen
          </p>

          {/* Screen Reader Mode */}
          <div className="flex items-center justify-between">
            <Label htmlFor="screen-reader" className="text-sm font-medium text-az-black dark:text-white">
              Schermlezer optimalisaties
            </Label>
            <Switch
              id="screen-reader"
              checked={screenReaderMode}
              onCheckedChange={applyScreenReaderMode}
              aria-describedby="screen-reader-desc"
              className="data-[state=checked]:bg-az-red focus-visible:ring-az-red focus-visible:ring-offset-2"
            />
          </div>
          <p id="screen-reader-desc" className="text-xs text-premium-gray-500 dark:text-gray-400">
            Optimaliseert de interface voor schermlezers
          </p>

          {/* Reset Button */}
          <div className="pt-4 border-t border-premium-gray-200 dark:border-gray-700">
            <Button
              variant="default"
              className="w-full rounded-lg bg-az-red hover:bg-red-700 text-white"
              onClick={() => {
                applyTextSize("100");
                applyHighContrast(false);
                applyReduceMotion(false);
                applyScreenReaderMode(false);
              }}
              aria-label="Reset alle toegankelijkheidsinstellingen naar standaard"
            >
              Standaardinstellingen herstellen
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};