import '@repo/ui/globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const inter = localFont({
    src: [
        {
            path: '../public/fonts/OpenSans-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-LightItalic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: '../public/fonts/OpenSans-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-Italic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: '../public/fonts/OpenSans-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-MediumItalic.ttf',
            weight: '500',
            style: 'italic',
        },
        {
            path: '../public/fonts/OpenSans-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-SemiBoldItalic.ttf',
            weight: '600',
            style: 'italic',
        },
        {
            path: '../public/fonts/OpenSans-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-BoldItalic.ttf',
            weight: '700',
            style: 'italic',
        },
        {
            path: '../public/fonts/OpenSans-ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../public/fonts/OpenSans-ExtraBoldItalic.ttf',
            weight: '800',
            style: 'italic',
        },
    ],
    variable: '--font-sans',
});

export const metadata = {
    metadataBase: new URL('https://locless.com'),
    title: 'locless',
    description: 'Accelerate your mobile development',
    openGraph: {
        title: 'locless',
        description: 'Accelerate your mobile development ',
        url: 'https://locless.com',
        siteName: 'locless.com',
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: false,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
} satisfies Metadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className={inter.className}>
            <body>{children}</body>
        </html>
    );
}
