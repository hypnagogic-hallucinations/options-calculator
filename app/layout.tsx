import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '期權定價模擬器 | Options Simulator',
  description: 'Black-Scholes 期權定價計算機，支援即時美股資料與彈性化設計系統。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ThemeProvider>
          <LocaleProvider>
            <NavBar />
            <main>
              {children}
            </main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
