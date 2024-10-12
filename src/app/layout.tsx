import type { Metadata } from "next";
import { Kanit } from 'next/font/google'
import "./globals.css";
import { CustomProviders } from './provider'

const kanit = Kanit({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "แพลตฟอร์มสำหรับการเรียนรู้ของเครื่อง",
  description: "แพลตฟอร์มสำหรับการเรียนรู้ของเครื่อง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomProviders>
      <html lang="en">
        <body className={kanit.className}>{children}</body>
      </html>
    </CustomProviders>
  );
}
