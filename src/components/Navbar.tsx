"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BRAND } from "@/config/sprks";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/logo.png";

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(248, 247, 242, 0.78)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(15, 24, 62, 0.08)",
        boxShadow: "0 10px 30px rgba(15, 24, 62, 0.05)",
      }}
    >
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={logo}
          alt="Sparks"
          priority
          className="h-9 w-auto md:h-10"
        />
        <span
          className="hidden text-lg font-bold tracking-tight sm:inline"
          style={{ color: BRAND.navy }}
        >
          <span>Sparks</span>
          <span style={{ color: BRAND.sky }}> Presale</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a
          href="#story"
          className="text-sm text-stone-500 transition-colors hover:text-[#0f183e]"
        >
          About
        </a>
        <a
          href="#presale"
          className="text-sm text-stone-500 transition-colors hover:text-[#0f183e]"
        >
          Buy SPRKS
        </a>
        <Link
          href="/claim"
          className="text-sm text-stone-500 transition-colors hover:text-[#0f183e]"
        >
          Claim
        </Link>
        <a
          href={BRAND.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-stone-500 transition-colors hover:text-[#0f183e]"
        >
          JoinSparks.app ↗
        </a>
      </div>

      <WalletMultiButton
        style={{
          background: BRAND.lime,
          color: BRAND.navy,
          fontWeight: 700,
          fontSize: "13px",
          borderRadius: "999px",
          padding: "8px 16px",
          height: "auto",
          boxShadow: "0 10px 24px rgba(104, 255, 3, 0.18)",
        }}
      />
    </nav>
  );
}
