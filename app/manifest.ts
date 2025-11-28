import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Danışan Takip',
        short_name: 'DanışanTakip',
        description: 'Danışan Takip ve Ön Muhasebe Uygulaması',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/logo.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
            },
            {
                src: '/logo.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    };
}
