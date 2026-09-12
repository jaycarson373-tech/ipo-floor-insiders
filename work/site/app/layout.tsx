import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import PlatformChrome from './platform-chrome';
import { WalletProviderRoot } from './wallet-context';
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
  title: 'IPO - Initial Pump Offering / Pumpios',
  description: 'Initial Pump Offerings on Solana, powered by 1,200 capsule-headed underwriters called Pumpios.',
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
        <WalletProviderRoot><PlatformChrome>{children}</PlatformChrome></WalletProviderRoot>
      </body>
    </html>
  );
}
