"use client";

import { TIERS } from "@/config/sprks";

interface TierProgressProps {
  tierSold: [number, number, number];
  activeTier: 0 | 1 | 2;
  totalRaisedUSD: number;
  softCapReached: boolean;
}

export default function TierProgress({
  tierSold,
  activeTier,
  totalRaisedUSD,
  softCapReached,
}: TierProgressProps) {
  return (
    <div className="space-y-4">
      {/* Overall raise bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Total Raised
          </span>
          <span className="text-xs font-bold" style={{ color: softCapReached ? "#68ff03" : "#5ebdea" }}>
            {softCapReached ? "✓ Soft Cap Reached" : `$${totalRaisedUSD.toLocaleString()} / $25,000 soft cap`}
          </span>
        </div>
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((totalRaisedUSD / 250_000) * 100, 100)}%`,
              background: "linear-gradient(90deg, #68ff03, #5ebdea)",
            }}
          />
          {/* Soft cap marker at 10% ($25k / $250k) */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{ left: "10%", background: "rgba(104, 255, 3, 0.6)" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">$0</span>
          <span className="text-xs text-gray-500">$250K</span>
        </div>
      </div>

      {/* Per-tier rows */}
      {TIERS.map((tier, i) => {
        const sold = tierSold[i as 0 | 1 | 2];
        const pct = Math.min((sold / tier.supplyDisplayed) * 100, 100);
        const isActive = activeTier === i;
        const isSoldOut = sold >= tier.supplyDisplayed;
        const isPending = i > activeTier;

        return (
          <div
            key={tier.id}
            className="rounded-xl p-4 transition-all"
            style={{
              background: isActive
                ? "rgba(94, 189, 234, 0.07)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${
                isActive
                  ? "rgba(94, 189, 234, 0.3)"
                  : "rgba(255,255,255,0.06)"
              }`,
              opacity: isPending ? 0.5 : 1,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: tier.color + "22",
                    color: tier.color,
                    border: `1px solid ${tier.color}44`,
                  }}
                >
                  {tier.label}
                </span>
                {isActive && (
                  <span className="text-xs font-semibold" style={{ color: "#68ff03" }}>
                    ● ACTIVE
                  </span>
                )}
                {isSoldOut && (
                  <span className="text-xs font-semibold text-gray-500">
                    SOLD OUT
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold" style={{ color: tier.color }}>
                  ${tier.usdPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ SPRKS</span>
              </div>
            </div>

            <div
              className="relative h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: isSoldOut
                    ? "#666"
                    : `linear-gradient(90deg, ${tier.color}aa, ${tier.color})`,
                }}
              />
            </div>

            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-500">
                {sold.toLocaleString()} SPRKS sold
              </span>
              <span className="text-xs text-gray-500">
                {tier.supplyDisplayed.toLocaleString()} total
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
