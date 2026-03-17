'use client';

import { useState, useCallback } from 'react';

export function useCountdown(targetDate: Date) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  const updateCountdown = useCallback(() => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      setIsExpired(true);
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = Math.floor(diff % 1000);

    setTimeRemaining({ hours, minutes, seconds, milliseconds });
  }, [targetDate]);

  // Update every 50ms for smooth milliseconds animation
  useState(() => {
    const interval = setInterval(updateCountdown, 50);
    return () => clearInterval(interval);
  });

  return { timeRemaining, isExpired };
}

export function useCountdownFromHours(hours: number) {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
  });

  return useCountdown(targetDate);
}
