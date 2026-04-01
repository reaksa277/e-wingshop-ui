"use client";

type BadgeVariant = "green" | "blue" | "red" | "amber" | "purple" | "gray";

const VARIANTS: Record<BadgeVariant, { bg: string; text: string }> = {
  green:  { bg: "#dcfce7", text: "#166534" },
  blue:   { bg: "#dbeafe", text: "#1e40af" },
  red:    { bg: "#fee2e2", text: "#991b1b" },
  amber:  { bg: "#fef3c7", text: "#92400e" },
  purple: { bg: "#f3e8ff", text: "#6b21a8" },
  gray:   { bg: "#f3f4f6", text: "#374151" },
};

export function Badge({
  children,
  variant = "gray",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const { bg, text } = VARIANTS[variant];
  return (
    <span style={{
      background: bg, color: text,
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
