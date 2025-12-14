import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';

interface OfflineIndicatorProps {
  onSyncNow?: () => void;
  issyncing?: boolean;
}

export const OfflineIndicator = ({ onSyncNow, issyncing = false }: OfflineIndicatorProps) => {
  const { isOnline } = useOfflineDetection();

  // Only show when offline
  if (isOnline) return null;

  const handleRetry = () => {
    if (onSyncNow) {
      onSyncNow();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-az-black text-white py-2 px-s animate-slide-down">
      <div className="container mx-auto">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-az-red" />
            <span>Je bent offline - gecachede content wordt getoond</span>
          </div>

          <button
            onClick={handleRetry}
            disabled={issyncing}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${issyncing ? 'animate-spin' : ''}`} />
            <span>Probeer opnieuw</span>
          </button>
        </div>
      </div>
    </div>
  );
};
