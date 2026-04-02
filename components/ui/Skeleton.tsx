'use client';

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/Skeleton.tsx
// Reusable shimmer placeholders shown while data is loading.
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, radius = 4, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px' }}>
          <Skeleton height={14} width={i === 0 ? '60%' : i === cols - 1 ? '40%' : '80%'} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '10px 12px' }}>
                <Skeleton height={12} width="70%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <Skeleton height={12} width="40%" style={{ marginBottom: 8 }} />
      <Skeleton height={28} width="60%" />
    </div>
  );
}

export function SkeletonPage({
  title = true,
  cards = 0,
  tableRows = 8,
  tableCols = 5,
}: {
  title?: boolean;
  cards?: number;
  tableRows?: number;
  tableCols?: number;
}) {
  return (
    <div>
      {title && <Skeleton height={28} width={200} style={{ marginBottom: 20 }} />}
      {cards > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cards}, 1fr)`,
            gap: 12,
            marginBottom: 20,
          }}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      <SkeletonTable rows={tableRows} cols={tableCols} />
    </div>
  );
}
