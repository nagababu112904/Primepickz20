import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import type { PurchaseNotification as PurchaseNotificationType } from "@shared/schema";

interface PurchaseNotificationProps {
  notifications: PurchaseNotificationType[];
}

export function PurchaseNotification({ notifications }: PurchaseNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotificationType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) return;

    const showNotification = () => {
      setCurrentNotification(notifications[notificationIndex % notifications.length]);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setNotificationIndex((prev) => prev + 1);
        }, 500);
      }, 5000);
    };

    const interval = setInterval(showNotification, 8000);
    showNotification();

    return () => clearInterval(interval);
  }, [notifications, notificationIndex]);

  if (!currentNotification || !isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-sm bg-card border border-card-border rounded-lg shadow-2xl transition-all duration-500 ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
      data-testid="purchase-notification"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {currentNotification.customerName} from {currentNotification.location}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Just purchased <span className="font-medium text-foreground">{currentNotification.productName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{currentNotification.timestamp}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
