import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy CRM Importer — AI-Powered CSV Extraction',
  description:
    'Upload any CSV file and let our AI intelligently extract and map your lead data into GrowEasy CRM format. Supports Facebook Lead exports, Google Ads exports, Excel sheets, and more.',
  keywords: ['CRM', 'CSV importer', 'AI', 'leads', 'GrowEasy', 'data extraction'],
  openGraph: {
    title: 'GrowEasy CRM Importer',
    description: 'AI-powered CSV to CRM data extraction',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
