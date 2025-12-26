import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "GYİAD Üye Platformu",
  description: "Genç Yönetici ve İş İnsanları Derneği Üye Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        {children}
        <a
          href="https://www.upgunai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-2 right-4 z-[9999] flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 hover:bg-white transition-all group cursor-pointer text-decoration-none"
        >
          <span className="text-[10px] text-gray-500 font-medium tracking-wide group-hover:text-gray-700 transition-colors">
            Bu web sitesi UPGUN AI (www.upgunai.com) tarafından tasarlanmıştır.
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/upgun-logo.png"
            alt="UPGUN AI"
            className="h-5 w-auto object-contain group-hover:opacity-80 transition-opacity"
          />
        </a>
      </body>
    </html>
  );
}
