import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OpenMap.lt',
    short_name: 'OpenMap.lt',
    description: 'Lietuvos OpenStreetMap žemėlapis',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/logo/openmap-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo/openmap-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}