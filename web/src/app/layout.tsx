import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: '#0B0B0E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'AttendX - Smart Attendance Management System',
  description: 'Revolutionize institution attendance tracking with high-security dynamic QR codes, interactive 3D visualizations, precise GPS geofencing, and real-time analytical dashboards.',
  keywords: [
    'smart attendance',
    'QR attendance tracking',
    'GPS geofenced attendance',
    'anti-cheating attendance',
    'SaaS attendance management',
    'academic student portal',
    'teacher attendance app',
    'real-time attendance metrics'
  ],
  authors: [{ name: 'AttendX Team', url: 'https://attendx.edu' }],
  creator: 'AttendX DevGroup',
  publisher: 'AttendX Inc.',
  metadataBase: new URL('https://attendx-landing.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AttendX - Smart Attendance Management System',
    description: 'Dynamic QR & GPS geofenced classroom attendance, secured with cryptographic tokens and real-time metrics.',
    url: 'https://attendx-landing.vercel.app',
    siteName: 'AttendX SaaS Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AttendX Smart Attendance Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AttendX - Smart Attendance Platform',
    description: 'Dynamic QR & GPS geofenced classroom attendance, secured with cryptographic tokens and real-time metrics.',
    images: ['/og-image.png'],
    creator: '@attendx',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
