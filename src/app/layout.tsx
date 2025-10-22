import type {Metadata} from 'next';
import './globals.css';
import {Providers} from '@/components/providers';
import {Toaster} from '@/components/ui/toaster';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';

export const metadata: Metadata = {
  title: 'Festify - Your Campus Events Hub',
  description: 'Discover, join, and create unforgettable college events with Festify.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
