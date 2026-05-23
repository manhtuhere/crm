import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Voice Call — VALSEA',
  description:
    'Live voice call demo with translation-ready AI agent and accent-aware ASR in English, Vietnamese, Indonesian, Thai, and more.',
  icons: {
    icon: '/valsea-logo.png',
    apple: '/valsea-logo.png',
  },
  openGraph: {
    title: 'Voice Call — VALSEA',
    description:
      'Multilingual voice call demo powered by VALSEA speech intelligence.',
    images: [{ url: '/valsea-logo.png', width: 512, height: 512, alt: 'VALSEA' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${beVietnamPro.variable}`} suppressHydrationWarning>
      <head>
        {/* Set .dark before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('valsea-theme');if(t!=='light')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
