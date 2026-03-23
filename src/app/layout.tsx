import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWalletProvider from "@/components/WalletProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPRKS Presale — Sparks",
  description:
    "The professional network that pays you to show up. No bots. Real people. Real value. Buy SPRKS — the Sparks token on Solana.",
  openGraph: {
    title: "SPRKS Presale — Sparks",
    description: "Buy SPRKS — the Sparks network token. Founding tier: $0.05/SPRKS. Solana.",
    url: "https://presale.joinsparks.app",
    siteName: "Sparks",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
