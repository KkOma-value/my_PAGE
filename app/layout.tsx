import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SipNotes - 城市饮品打卡",
  description: "记录每一杯好喝的，发现城市饮品趋势",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

