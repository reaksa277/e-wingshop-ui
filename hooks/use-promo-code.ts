'use client';

import { useState, useCallback } from 'react';

type PromoStatus = 'idle' | 'applying' | 'valid' | 'invalid';

interface UsePromoCodeReturn {
  code: string;
  setCode: (code: string) => void;
  status: PromoStatus;
  isApplying: boolean;
  applyCode: (code: string) => Promise<void>;
  clearStatus: () => void;
}

/**
 * Hook to handle promo code validation and state
 * @returns Object with promo code state and methods
 */
export function usePromoCode(): UsePromoCodeReturn {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<PromoStatus>('idle');
  const [isApplying, setIsApplying] = useState(false);

  const applyCode = useCallback(async (promoCode: string) => {
    setCode(promoCode);
    setIsApplying(true);
    setStatus('applying');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation - replace with actual API call
      const validCodes = ['SAVE10', 'DISCOUNT20', 'PROMO'];
      if (validCodes.includes(promoCode.toUpperCase())) {
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    } catch (error) {
      setStatus('invalid');
    } finally {
      setIsApplying(false);
    }
  }, []);

  const clearStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    code,
    setCode,
    status,
    isApplying,
    applyCode,
    clearStatus,
  };
}
