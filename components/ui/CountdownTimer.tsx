"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCountdownFromHours } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  hours: number;
  className?: string;
  onExpire?: () => void;
}

export function CountdownTimer({
  hours,
  className,
  onExpire,
}: CountdownTimerProps) {
  const { timeRemaining, isExpired } = useCountdownFromHours(hours);
  const [prevSeconds, setPrevSeconds] = useState(timeRemaining.seconds);

  useEffect(() => {
    if (isExpired) {
      onExpire?.();
    }
  }, [isExpired, onExpire]);

  // Detect second change for pulse animation
  const isPulsing = timeRemaining.seconds !== prevSeconds;
  useEffect(() => {
    if (isPulsing) {
      const timeout = setTimeout(() => setPrevSeconds(timeRemaining.seconds), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isPulsing, timeRemaining.seconds, prevSeconds]);

  const formatNumber = (num: number, digits: number = 2) => {
    return num.toString().padStart(digits, "0");
  };

  if (isExpired) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm font-medium text-red-500">Offer expired!</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 font-mono", className)}>
      <span className="countdown-digit">
        {formatNumber(timeRemaining.hours)}
      </span>
      <span className="text-white/60">:</span>
      <span className="countdown-digit">
        {formatNumber(timeRemaining.minutes)}
      </span>
      <span className="text-white/60">:</span>
      <span
        className={cn(
          "countdown-digit",
          timeRemaining.seconds % 2 === 0 ? "pulse" : ""
        )}
      >
        {formatNumber(timeRemaining.seconds)}
      </span>
      <span className="text-white/60">:</span>
      <span className="countdown-digit text-xs">
        {formatNumber(Math.floor(timeRemaining.milliseconds / 10), 2)}
      </span>
    </div>
  );
}
