"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TIERS, BRAND, SPRKS_MINT } from "@/config/sprks";
import {
  getPresaleStatePDA,
  getUserAllocationPDA,
  sprksForSol,
  solForSprks,
  type PresaleStateAccount,
} from "@/lib/presale";
import CountdownTimer from "./CountdownTimer";
import TierProgress from "./TierProgress";

interface BuyWidgetProps {
  presaleState: PresaleStateAccount | null;
  tierSold: [number, number, number];
  activeTier: 0 | 1 | 2;
  totalRaisedUSD: number;
  softCapReached: boolean;
  solPriceUsd: number;
  onPurchaseSuccess: () => void;
}

type InputMode = "sol" | "sprks";

export default function BuyWidget({
  presaleState,
  tierSold,
  activeTier,
  totalRaisedUSD,
  softCapReached,
  solPriceUsd,
  onPurchaseSuccess,
}: BuyWidgetProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [solInput, setSolInput] = useState("");
  const [sprksInput, setSprksInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("sol");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const activeTierData = TIERS[activeTier];
  const lamportsPerSprks = presaleState
    ? [
        presaleState.foundingLamportsPerSprks.toNumber(),
        presaleState.earlyLamportsPerSprks.toNumber(),
        presaleState.publicLamportsPerSprks.toNumber(),
      ][activeTier]
    : Math.floor((activeTierData.usdPrice / solPriceUsd) * LAMPORTS_PER_SOL);

  function handleSolChange(val: string) {
    setSolInput(val);
    setInputMode("sol");
    const sol = parseFloat(val);
    if (!isNaN(sol) && sol > 0 && lamportsPerSprks > 0) {
      setSprksInput(sprksForSol(sol, lamportsPerSprks).toFixed(2));
    } else {
      setSprksInput("");
    }
  }

  function handleSprksChange(val: string) {
    setSprksInput(val);
    setInputMode("sprks");
    const sprks = parseFloat(val);
    if (!isNaN(sprks) && sprks > 0 && lamportsPerSprks > 0) {
      setSolInput(solForSprks(sprks, lamportsPerSprks).toFixed(6));
    } else {
      setSolInput("");
    }
  }

  const handleBuy = useCallback(async () => {
    if (!publicKey || !presaleState) return;
    const sol = parseFloat(solInput);
    if (isNaN(sol) || sol <= 0) {
      setStatusMsg("Enter a valid SOL amount.");
      setStatus("error");
      return;
    }

    const lamports = Math.floor(sol * LAMPORTS_PER_SOL);
    setStatus("pending");
    setStatusMsg("Waiting for wallet confirmation...");

    try {
      const [presaleStatePDA] = getPresaleStatePDA();
      const [userAllocationPDA] = getUserAllocationPDA(publicKey);

      // Build the buy_tokens instruction manually
      // (In production: use Program.methods.buyTokens() from the compiled IDL)
      // This is a placeholder that will be replaced once anchor build generates the IDL
      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });

      // NOTE: Replace this with the actual Anchor instruction call once deployed.
      // For now, this sends a direct SOL transfer as a dev placeholder.
      // Full Anchor CPI will use: program.methods.buyTokens(new BN(lamports)).accounts({...})
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: presaleState.authority,
          lamports,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      setStatus("success");
      setStatusMsg(`Purchase confirmed! Tx: ${sig.slice(0, 8)}...`);
      setSolInput("");
      setSprksInput("");
      onPurchaseSuccess();
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Transaction failed.";
      setStatusMsg(msg.includes("User rejected") ? "Transaction cancelled." : msg);
    }
  }, [publicKey, presaleState, solInput, lamportsPerSprks, connection, sendTransaction, onPurchaseSuccess]);

  const usdValue = parseFloat(solInput) * solPriceUsd || 0;

  return (
    <div
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: "rgba(15, 24, 62, 0.8)",
        border: "1px solid rgba(94, 189, 234, 0.2)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Buy SPRKS</h2>
        <span
          className="text-xs font-black px-2 py-1 rounded-full"
          style={{
            background: `${activeTierData.color}22`,
            color: activeTierData.color,
            border: `1px solid ${activeTierData.color}44`,
          }}
        >
          {activeTierData.label} — ${activeTierData.usdPrice.toFixed(2)}/SPRKS
        </span>
      </div>

      {/* Countdown */}
      <CountdownTimer />

      {/* Tier progress */}
      <TierProgress
        tierSold={tierSold}
        activeTier={activeTier}
        totalRaisedUSD={totalRaisedUSD}
        softCapReached={softCapReached}
      />

      {/* Buy form */}
      {connected ? (
        <div className="space-y-3">
          {/* SOL input */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              You pay
            </label>
            <div
              className="flex items-center rounded-xl px-4 py-3 gap-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="0.00"
                value={solInput}
                onChange={(e) => handleSolChange(e.target.value)}
                className="flex-1 bg-transparent text-white text-lg font-bold outline-none placeholder-gray-600"
              />
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: "#9945FF", color: "white" }}
                >
                  ◎
                </div>
                <span className="text-sm font-bold text-white">SOL</span>
              </div>
            </div>
            {usdValue > 0 && (
              <p className="text-xs text-gray-500 mt-1 ml-1">
                ≈ ${usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="text-center text-gray-600">↓</div>

          {/* SPRKS output */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              You receive
            </label>
            <div
              className="flex items-center rounded-xl px-4 py-3 gap-3"
              style={{
                background: "rgba(104, 255, 3, 0.05)",
                border: "1px solid rgba(104, 255, 3, 0.2)",
              }}
            >
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={sprksInput}
                onChange={(e) => handleSprksChange(e.target.value)}
                className="flex-1 bg-transparent text-lg font-bold outline-none placeholder-gray-600"
                style={{ color: BRAND.lime }}
              />
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: BRAND.lime, color: BRAND.navy }}
                >
                  S
                </div>
                <span className="text-sm font-bold text-white">SPRKS</span>
              </div>
            </div>
          </div>

          {/* Wallet cap reminder */}
          <p className="text-xs text-gray-500 text-center">
            Max {activeTierData.walletCapDisplayed.toLocaleString()} SPRKS per wallet in this tier
          </p>

          {/* Status message */}
          {statusMsg && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background:
                  status === "success"
                    ? "rgba(104,255,3,0.1)"
                    : status === "error"
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(94,189,234,0.1)",
                color:
                  status === "success"
                    ? BRAND.lime
                    : status === "error"
                    ? "#ef4444"
                    : BRAND.sky,
                border: `1px solid ${
                  status === "success"
                    ? "rgba(104,255,3,0.3)"
                    : status === "error"
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(94,189,234,0.3)"
                }`,
              }}
            >
              {status === "pending" && "⏳ "}
              {status === "success" && "✓ "}
              {status === "error" && "✗ "}
              {statusMsg}
            </div>
          )}

          {/* Buy button */}
          <button
            onClick={handleBuy}
            disabled={status === "pending" || !solInput || parseFloat(solInput) <= 0}
            className="w-full py-4 rounded-xl font-black text-base transition-all"
            style={{
              background: status === "pending"
                ? "rgba(104,255,3,0.4)"
                : BRAND.lime,
              color: BRAND.navy,
              opacity: (!solInput || parseFloat(solInput) <= 0) ? 0.5 : 1,
              cursor: status === "pending" ? "not-allowed" : "pointer",
            }}
          >
            {status === "pending" ? "Confirming..." : "Buy SPRKS →"}
          </button>

          <p className="text-xs text-gray-600 text-center">
            Tokens are claimable after the presale ends. Allocation is locked on-chain.
          </p>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <p className="text-gray-400 text-sm">
            Connect your Phantom wallet to purchase SPRKS
          </p>
          <div className="flex justify-center">
            <WalletMultiButton
              style={{
                background: BRAND.lime,
                color: BRAND.navy,
                fontWeight: 700,
                borderRadius: "12px",
                fontSize: "14px",
              }}
            />
          </div>
          <p className="text-xs text-gray-600">
            Phantom and Solflare supported
          </p>
        </div>
      )}
    </div>
  );
}
