'use client';

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ErrorMessage.tsx
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  error: Error | unknown;
  retry?: () => void;
  title?: string;
}

export function ErrorMessage({ error, retry, title = 'Something went wrong' }: Props) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  const status = (error as any)?.status;

  return (
    <div
      style={{
        background: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 20 }}>⚠</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#9f1239', marginBottom: 4 }}>
          {status === 403 ? 'Access denied' : status === 404 ? 'Not found' : title}
        </div>
        <div style={{ fontSize: 13, color: '#be123c' }}>{message}</div>
        {retry && (
          <button
            onClick={retry}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: '#9f1239',
              background: 'none',
              border: '1px solid #fda4af',
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
