"use client";

import { useState, useCallback } from "react";

export function usePromoCode() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isApplying, setIsApplying] = useState(false);

  const validCodes = ["WELCOME20", "SAVE10", "FREESHIP"];

  const applyCode = useCallback(
    async (promoCode: string) => {
      setIsApplying(true);
      setStatus("idle");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (validCodes.includes(promoCode.toUpperCase())) {
        setStatus("valid");
      } else {
        setStatus("invalid");
        setTimeout(() => setStatus("idle"), 500);
      }

      setIsApplying(false);
    },
    []
  );

  const clearStatus = useCallback(() => {
    setStatus("idle");
    setCode("");
  }, []);

  return { code, setCode, status, isApplying, applyCode, clearStatus };
}
