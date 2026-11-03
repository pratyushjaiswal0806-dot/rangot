import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Home-screen icon for iOS: the same gold "P" medallion as icon.svg, on ruby.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#7A0E3A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 150, height: 150, borderRadius: 75, background: '#1B1410', border: '10px solid #FFC21A', color: '#FFC21A', fontSize: 92, fontWeight: 900 }}>P</div>
      </div>
    ),
    size,
  );
}
