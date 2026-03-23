"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import BuyWidget from "@/components/BuyWidget";
import {
  getPresaleStatePDA,
  derivePresaleStats,
  fetchSolPriceUsd,
  type PresaleStateAccount,
  type PresaleStats,
  IDL,
} from "@/lib/presale";
import { BRAND, TIERS } from "@/config/sprks";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const EMPTY_STATS: PresaleStats = {
  isActive: true,
  claimsEnabled: false,
  activeTier: 0,
  tierProgress: [0, 0, 0],
  tierSold: [0, 0, 0],
  totalRaisedSOL: 0,
  totalRaisedUSD: 0,
  softCapReached: false,
};

const TRUST_SIGNALS = [
  {
    icon: "📱",
    title: "Live product",
    body: "Zen Fitness is in the App Store today. Sparks API is running. This is not a whitepaper.",
  },
  {
    icon: "🔐",
    title: "No bots. Architecturally.",
    body: "WebAuthn biometric auth — Face ID and Touch ID only. Bots can't fake a face.",
  },
  {
    icon: "⚡",
    title: "On-chain allocation",
    body: "Your SPRKS are recorded on Solana the moment you buy. Claim them after the presale closes.",
  },
  {
    icon: "🏗️",
    title: "25+ years shipping",
    body: "Built and sold studios in LA. Built and exited software. This isn't a first project.",
  },
];

export default function HomePage() {
  const { connection } = useConnection();
  const [presaleState, setPresaleState] = useState<PresaleStateAccount | null>(null);
  const [stats, setStats] = useState<PresaleStats>(EMPTY_STATS);
  const [solPrice, setSolPrice] = useState(135);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const price = await fetchSolPriceUsd();
      setSolPrice(price);

      const [statePDA] = getPresaleStatePDA();
      const accountInfo = await connection.getAccountInfo(statePDA);
      if (!accountInfo) {
        setLoading(false);
        return;
      }

      const provider = new AnchorProvider(connection, {} as never, {});
      const program = new Program(IDL, provider);
      const state = await (program.account as never as {
        presaleState: { fetch: (pda: PublicKey) => Promise<PresaleStateAccount> };
      }).presaleState.fetch(statePDA);

      setPresaleState(state);
      setStats(derivePresaleStats(state, price));
    } catch (err) {
      console.error("Failed to fetch presale state:", err);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 30_000);
    return () => clearInterval(id);
  }, [fetchState]);

  const activeTierData = TIERS[stats.activeTier];

  return (
    <div
      className="min-h-screen text-stone-900"
      style={{
        background: "linear-gradient(180deg, #f8f7f2 0%, #f3efe6 36%, #f7f5ef 100%)",
      }}
    >
      {/* Background glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 14%, rgba(104,255,3,0.10), transparent 28%),
            radial-gradient(circle at 82% 18%, rgba(94,189,234,0.12), transparent 32%),
            radial-gradient(circle at 76% 72%, rgba(15,24,62,0.05), transparent 28%)
          `,
        }}
      />

      <Navbar />

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="px-6 pt-32 pb-8 text-center">
          <div className="mx-auto max-w-2xl">
            <span
              className="mb-5 inline-block rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em]"
              style={{
                background: "rgba(104,255,3,0.10)",
                border: "1px solid rgba(104,255,3,0.24)",
                color: BRAND.lime,
              }}
            >
              $SPRKS Presale · {activeTierData.name} · ${activeTierData.usdPrice.toFixed(2)}/SPRKS
            </span>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#0f183e] md:text-6xl">
              The network that{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${BRAND.sky}, ${BRAND.lime})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                pays you to show up.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-600">
              SPRKS is the token behind Sparks — a professional network built on real identity,
              real participation, and on-chain ownership. Founding tier is open now.
              Price steps up as tiers fill.
            </p>
          </div>
        </section>

        {/* ── Buy Widget ───────────────────────────────────────────────────── */}
        <section id="presale" className="px-6 pb-12">
          <div className="mx-auto max-w-lg">
            {loading ? (
              <div
                className="rounded-[28px] p-12 text-center"
                style={{
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(15,24,62,0.08)",
                }}
              >
                <div
                  className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2"
                  style={{
                    borderColor: `${BRAND.sky} transparent ${BRAND.sky} transparent`,
                  }}
                />
                <p className="text-sm text-stone-500">Loading presale data...</p>
              </div>
            ) : (
              <BuyWidget
                presaleState={presaleState}
                tierSold={stats.tierSold}
                activeTier={stats.activeTier}
                totalRaisedUSD={stats.totalRaisedUSD}
                softCapReached={stats.softCapReached}
                solPriceUsd={solPrice}
                onPurchaseSuccess={fetchState}
              />
            )}
          </div>
        </section>

        {/* ── Trust Signals ────────────────────────────────────────────────── */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-center text-xs font-black uppercase tracking-[0.22em] text-stone-400">
              Why this is real
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRUST_SIGNALS.map((item) => (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-[28px] p-5"
                  style={{
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(15,24,62,0.08)",
                  }}
                >
                  <span className="flex-shrink-0 text-xl">{item.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-stone-600">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer
          className="border-t px-6 py-10 text-center"
          style={{ borderColor: "rgba(15,24,62,0.08)" }}
        >
          <div className="mb-4 flex flex-wrap justify-center gap-6 text-xs text-stone-500">
            <a href={BRAND.website} target="_blank" rel="noopener noreferrer" className="hover:text-stone-800">
              JoinSparks.app ↗
            </a>
            <a href={BRAND.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-stone-800">
              Twitter / X ↗
            </a>
            <a href="/claim" className="hover:text-stone-800">
              Claim SPRKS
            </a>
          </div>
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-stone-400">
            Cryptocurrency may be unregulated in your jurisdiction. The value of SPRKS may
            fluctuate. This is not financial advice. Participation involves risk. Always do
            your own research.
          </p>
          <p className="mt-4 text-xs text-stone-400">© 2026 Sparks. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
