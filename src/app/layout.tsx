import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import UpgunBranding from "@/components/UpgunBranding";

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
        <UpgunBranding />
      </body>
    </html>
  );
}
