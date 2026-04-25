import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '../components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata = {
  title: 'CareerOS | AI Career Intelligence',
  description: 'AI-powered career platform to analyse resumes, simulate ATS, and optimise job success.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background text-textMain antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
