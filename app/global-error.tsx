'use client';

// Last resort: the root layout itself failed, so there is no site frame, fonts or CSS. Inline styles only.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#7A0E3A', color: '#FBF3E4', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 24 }}>
        <main>
          <h1 style={{ color: '#FFC21A', fontSize: 'clamp(28px, 7vw, 48px)', margin: '0 0 12px' }}>Rangoli ka rang bigad gaya</h1>
          <p style={{ maxWidth: 420, margin: '0 auto 20px', fontSize: 18, lineHeight: 1.5 }}>Something went wrong on our side. Please try again.</p>
          <button type="button" onClick={() => retry()} style={{ font: 'inherit', fontWeight: 700, padding: '12px 22px', background: '#FFC21A', color: '#1B1410', border: '3px solid #1B1410', borderRadius: 12, cursor: 'pointer' }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
