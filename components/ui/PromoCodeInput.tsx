"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { usePromoCode } from "@/hooks/use-promo-code";
import { cn } from "@/lib/utils";

interface PromoCodeInputProps {
  onApply?: (code: string) => void;
  className?: string;
}

export function PromoCodeInput({ onApply, className }: PromoCodeInputProps) {
  const { code, setCode, status, isApplying, applyCode, clearStatus } =
    usePromoCode();
  const [localCode, setLocalCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCode(localCode);
    onApply?.(localCode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCode(e.target.value);
    if (status !== "idle") {
      clearStatus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="flex gap-2">
        <input
          type="text"
          value={localCode}
          onChange={handleChange}
          placeholder="Enter promo code"
          className={cn(
            "promo-input flex-1",
            status === "invalid" && "invalid",
            status === "valid" && "valid"
          )}
          disabled={isApplying}
        />
        <button
          type="submit"
          disabled={isApplying || !localCode}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>
      </div>

      {/* Status indicator */}
      {status === "valid" && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 animate-scale-in">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {status === "invalid" && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 animate-scale-in">
          <X className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Status message */}
      {status === "valid" && (
        <p className="mt-2 text-sm font-medium text-green-600 animate-fade-up">
          ✓ Promo code applied successfully!
        </p>
      )}

      {status === "invalid" && (
        <p className="mt-2 text-sm font-medium text-red-600 animate-fade-up">
          ✕ Invalid promo code. Please try again.
        </p>
      )}
    </form>
  );
}
