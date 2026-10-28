import type { MetadataRoute } from 'next';

// "Add to home screen": opens full-screen like an app, ruby status bar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rangotsav',
    short_name: 'Rangotsav',
    description: 'Weave your name into a kolam, draw rangoli, send festival greetings and light a diya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#7A0E3A',
    theme_color: '#7A0E3A',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
