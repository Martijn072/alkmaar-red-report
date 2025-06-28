
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  onRetry: () => void;
}

export const ErrorMessage = ({ onRetry }: ErrorMessageProps) => {
  return (
    <div className="card-premium p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="headline-premium text-lg mb-2">
        Artikelen kunnen niet worden geladen
      </h3>
      <p className="body-premium text-premium-gray-600 mb-6">
        Er is een probleem opgetreden bij het ophalen van de laatste artikelen van AZFanpage.nl. 
        Controleer je internetverbinding en probeer het opnieuw.
      </p>
      <button
        onClick={onRetry}
        className="btn-secondary flex items-center gap-2 mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        Opnieuw proberen
      </button>
    </div>
  );
};
