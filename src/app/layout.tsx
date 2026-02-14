import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from './providers';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['latin', 'arabic'],
  display: 'swap',
});
// const arimo = Arimo({
//   variable: '--font-cairo',
//   subsets: ['latin'],
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: {
    default: 'LMJ Health Dashboard',
    template: '%s • LMJ Health',
  },
  description:
    'Multi-role medical platform dashboard (patients, doctors, secretaries, admins, data-entry)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body
        className={`${cairo.variable} min-h-screen bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
