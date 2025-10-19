
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { DocumentsProvider } from '@/hooks/use-documents.tsx';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { AppearanceProvider } from '@/hooks/use-appearance';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'DocuSync Lite - Create. Sync. Collaborate.',
  description: 'DocuSync Lite connects teams through powerful, real-time document sync technology. Join the waitlist for the next-gen document collaboration platform.',
  keywords: ['document collaboration', 'real-time sync', 'team productivity', 'enterprise documentation', 'waitlist'],
  openGraph: {
    title: 'DocuSync Lite - Create. Sync. Collaborate.',
    description: 'The next-gen document collaboration platform built for productivity, reliability, and smooth cross-platform performance.',
    url: 'https://docusync.lite',
    siteName: 'DocuSync Lite',
    images: [
      {
        url: 'https://picsum.photos/seed/docusync-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'DocuSync Lite App Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocuSync Lite - Create. Sync. Collaborate.',
    description: 'The next-gen document collaboration platform. Join the waitlist today!',
    images: ['https://picsum.photos/seed/docusync-og/1200/630'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var highContrast = localStorage.getItem('high-contrast-mode') === 'true';
                  if (highContrast) {
                    document.documentElement.classList.add('high-contrast');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppearanceProvider>
            <AuthProvider>
                <DocumentsProvider>
                    {children}
                    <Toaster />
                    <FirebaseErrorListener />
                </DocumentsProvider>
            </AuthProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
