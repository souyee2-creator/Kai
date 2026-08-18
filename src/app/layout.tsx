import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Kai',
  description: 'AI Companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-dvh flex-col">
        <main className="flex-1 pb-14">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
