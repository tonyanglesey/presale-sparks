"use client";

import { BRAND } from "@/config/sprks";

const ECOSYSTEM = [
  {
    icon: "🦙",
    name: "lla.ma",
    role: "The Brain",
    desc: "AI inference layer. Powers Sparks and Zen Fitness with LLaMA + Claude routing. Your AI doesn't phone home to OpenAI.",
    color: BRAND.lime,
  },
  {
    icon: "⚡",
    name: "Sparks",
    role: "The Network",
    desc: "Professional network with a graph-native social layer. You earn SPRKS by showing up authentically — posts, connections, endorsements.",
    color: BRAND.sky,
  },
  {
    icon: "🧘",
    name: "Zen Fitness",
    role: "The Body",
    desc: "AI personal training app. Live in the App Store now. Same token economy, same AI layer, same founder.",
    color: "#a855f7",
  },
];

const DIFFERENTIATORS = [
  {
    title: "No bots. Architecturally.",
    body: "WebAuthn biometric auth means Face ID and Touch ID are your password. Bots can't fake a face. This isn't a moderation policy — it's physics.",
    icon: "🔐",
  },
  {
    title: "Real products. Right now.",
    body: "Zen Fitness is live in the App Store. Sparks API is running. The graph is real. This isn't a whitepaper — you can download the app today.",
    icon: "📱",
  },
  {
    title: "SPRKS has real utility.",
    body: "Earn by posting, connecting, endorsing. Spend on boosts, AI tools, premium themes. Claim on-chain via Solana. It's a working economy, not speculative air.",
    icon: "💎",
  },
  {
    title: "25+ years of shipping.",
    body: "Built and sold fitness studios in LA. Built and exited software products. This isn't a first project — it's a career's worth of execution on one platform.",
    icon: "🏗️",
  },
];

export default function StorySection() {
  return (
    <section id="story" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">

        {/* Section header */}
        <div className="mb-16 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em]"
            style={{
              background: "rgba(104,255,3,0.10)",
              border: "1px solid rgba(104,255,3,0.24)",
              color: BRAND.lime,
            }}
          >
            Why SPRKS
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-stone-900 md:text-5xl">
            LinkedIn evolved.{" "}
            <span style={{ color: BRAND.sky }}>No bots.</span>{" "}
            <span style={{ color: "#68cc00" }}>No noise.</span>{" "}
            <span className="text-stone-900">Real value.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600">
            Social networks extract value from your attention. Sparks pays you
            for genuine participation. SPRKS is the token that makes the
            difference real — earned on-chain, spent in-app, owned by you.
          </p>
        </div>

        {/* Ecosystem */}
        <div className="mb-16">
          <p className="mb-8 text-center text-xs font-black uppercase tracking-[0.22em] text-stone-400">
            Three products. One token economy.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {ECOSYSTEM.map((item) => (
              <article
                key={item.name}
                className="rounded-[28px] p-6"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(15,24,62,0.08)",
                }}
              >
                <div className="mb-3 text-3xl">{item.icon}</div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-lg font-black" style={{ color: item.color }}>
                    {item.name}
                  </h3>
                  <span className="text-xs text-stone-400">{item.role}</span>
                </div>
                <p className="text-sm leading-6 text-stone-600">{item.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-stone-500">
            <span>lla.ma</span>
            <span style={{ color: BRAND.lime }}>→</span>
            <span>Sparks</span>
            <span style={{ color: BRAND.sky }}>→</span>
            <span>Zen Fitness</span>
            <span
              className="ml-2 rounded-full px-3 py-1 text-xs text-stone-500"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(15,24,62,0.08)",
              }}
            >
              shared auth · shared token economy · shared AI
            </span>
          </div>
        </div>

        {/* Differentiators */}
        <div className="mb-16 grid gap-4 md:grid-cols-2">
          {DIFFERENTIATORS.map((d) => (
            <article
              key={d.title}
              className="flex gap-4 rounded-[28px] p-6"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(15,24,62,0.08)",
              }}
            >
              <span className="flex-shrink-0 text-2xl">{d.icon}</span>
              <div>
                <h4 className="font-bold text-stone-900">{d.title}</h4>
                <p className="mt-1.5 text-sm leading-6 text-stone-600">{d.body}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Token utility */}
        <div
          className="rounded-[28px] p-8"
          style={{
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(15,24,62,0.08)",
          }}
        >
          <h3
            className="mb-6 text-center text-xl font-black tracking-[-0.02em]"
            style={{ color: BRAND.navy }}
          >
            What SPRKS actually does
          </h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p
                className="mb-3 text-xs font-black uppercase tracking-[0.22em]"
                style={{ color: BRAND.lime }}
              >
                Earn
              </p>
              <ul className="space-y-2.5 text-sm">
                {[
                  ["Complete profile", "100 SPRKS"],
                  ["Quality post", "10 SPRKS"],
                  ["Skill endorsement", "5 SPRKS"],
                  ["Successful intro", "20 SPRKS"],
                  ["Referral bonus", "100 SPRKS"],
                ].map(([action, reward]) => (
                  <li key={action} className="flex justify-between">
                    <span className="text-stone-600">{action}</span>
                    <span className="font-semibold text-stone-900">{reward}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="mb-3 text-xs font-black uppercase tracking-[0.22em]"
                style={{ color: BRAND.sky }}
              >
                Spend
              </p>
              <ul className="space-y-2.5 text-sm">
                {[
                  ["Boost a post", "50 SPRKS"],
                  ["AI intro draft", "25 SPRKS"],
                  ["Ad-free month", "100 SPRKS"],
                  ["Profile analytics", "10 SPRKS/mo"],
                  ["Premium themes", "100–500 SPRKS"],
                ].map(([action, cost]) => (
                  <li key={action} className="flex justify-between">
                    <span className="text-stone-600">{action}</span>
                    <span className="font-semibold text-stone-900">{cost}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-stone-400">
            Token: SPRKS · Solana Mainnet ·{" "}
            <span className="font-mono" style={{ color: BRAND.sky }}>
              EPGoVU5wzZFxL9hu16Dhn3wtyz1P1mPMGQ9Y1KzMebv3
            </span>
          </p>
        </div>

      </div>
    </section>
  );
}
