import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import PlatformChrome from './platform-chrome';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IPO — Initial Pump Offering',
  description: 'Launch your idea, build your community, and reward your holders with transparent Solana launch tooling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlatformChrome>{children}</PlatformChrome>
      </body>
    </html>
  );
}
