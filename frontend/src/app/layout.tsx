import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'ユーモアテストアプリ',
  description: '大喜利の過去問題を選択式で解答し、可変得点制で「笑の偏差値」を競うWebアプリケーション',
  keywords: ['大喜利', 'ユーモア', 'テスト', 'デイリーチャレンジ', '偏差値'],
  authors: [{ name: 'Humor Challenge Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ユーモアテストアプリ',
    description: '大喜利の過去問題を選択式で解答し、可変得点制で「笑の偏差値」を競うWebアプリケーション',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ユーモアテストアプリ',
    description: '大喜利の過去問題を選択式で解答し、可変得点制で「笑の偏差値」を競うWebアプリケーション',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>😄</text></svg>"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
          {/* ヘッダー */}
          <Header />

          {/* メインコンテンツ */}
          <main className="flex-1 container-padding py-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>

          {/* フッター */}
          <footer className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto container-padding py-6">
              <div className="text-center text-sm text-gray-600">
                <p>&copy; 2024 ユーモアテストアプリ. All rights reserved.</p>
                <p className="mt-2">
                  毎日新しい問題で「笑の偏差値」をチェック！
                </p>
              </div>
            </div>
          </footer>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
} 