import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { GlobalAudioProvider } from '@/components/providers/GlobalAudioProvider';

export const metadata: Metadata = {
  title: 'Huynh Khanh Minh | Portfolio',
  description: 'Personal portfolio',
  icons: { icon: '/letter.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-pixel antialiased bg-[#008080] text-black overflow-hidden select-none">
        <GlobalAudioProvider>{children}</GlobalAudioProvider>
        <Analytics />
      </body>
    </html>
  );
}