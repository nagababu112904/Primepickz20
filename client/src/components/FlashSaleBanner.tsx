import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 h-10 text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Flash Sale Ends In:</span>
          <span className="sm:hidden">Sale Ends:</span>
          <div className="flex items-center gap-1 font-bold">
            <span data-testid="timer-hours">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span>:</span>
            <span data-testid="timer-minutes">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span>:</span>
            <span data-testid="timer-seconds">{String(timeLeft.seconds).padStart(2, "0")}</span>
          </div>
          <span className="hidden md:inline text-primary-foreground/90">| Upto 70% OFF on Fashion</span>
        </div>
      </div>
    </div>
  );
}
