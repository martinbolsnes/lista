import type { Metadata } from 'next';
import { Shrikhand, Fira_Sans_Condensed } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';

const shrikhand = Shrikhand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shrikhand',
});

const fira = Fira_Sans_Condensed({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-fira',
});

export const metadata: Metadata = {
  title: 'LISTA',
  description: 'Din eneste app for dine lister',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          className={`${shrikhand.variable} ${fira.variable} antialiased bg-bg`}
        >
          <Header />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
