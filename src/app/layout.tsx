import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata: Metadata = {
  title: 'I.A Vegetables Supplier | Fresh Farm Produce Karachi (Since 1990)',
  description: 'Karachi wholesale & retail fresh vegetable supplier. Order daily mandi vegetables online with same-day doorstep delivery. NTN # 4260196-7.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased selection:bg-brand-500 selection:text-white" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
