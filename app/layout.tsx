import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'DefineOS',
  description: 'Calisthenics skill progression and workout tracking',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DefineOS',
    startupImage: '/apple-touch-icon.png',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d0d0d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="bg-[#0d0d0d] font-sans min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
