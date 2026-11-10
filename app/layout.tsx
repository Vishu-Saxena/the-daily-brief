import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';

export const metadata: Metadata = { title: 'The Daily Brief', description: 'The news, with the noise removed.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><body><ThemeProvider><Header />{children}</ThemeProvider></body></html>; }
