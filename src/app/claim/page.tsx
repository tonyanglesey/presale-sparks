"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Navbar from "@/components/Navbar";
import { BRAND, SPRKS_MINT, SPRKS_DECIMALS_MULTIPLIER } from "@/config/sprks";
import {
  getPresaleStatePDA,
  getUserAllocationPDA,
  IDL,
  type PresaleStateAccount,
  type UserAllocationAccount,
} from "@/lib/presale";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

type ClaimStatus = "idle" | "loading" | "pending" | "success" | "error";

export default function ClaimPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [presaleState, setPresaleState] = useState<PresaleStateAccount | null>(null);
  const [allocation, setAllocation] = useState<UserAllocationAccount | null>(null);
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const provider = new AnchorProvider(connection, {} as never, {});
      const program = new Program(IDL, provider);

      const [statePDA] = getPresaleStatePDA();
      const [allocPDA] = getUserAllocationPDA(publicKey);

      const stateAccount = await connection.getAccountInfo(statePDA);
      if (stateAccount) {
        const state = await (program.account as never as {
          presaleState: { fetch: (pda: PublicKey) => Promise<PresaleStateAccount> };
        }).presaleState.fetch(statePDA);
        setPresaleState(state);
      }

      const allocAccount = await connection.getAccountInfo(allocPDA);
      if (allocAccount) {
        const alloc = await (program.account as never as {
          userAllocation: { fetch: (pda: PublicKey) => Promise<UserAllocationAccount> };
        }).userAllocation.fetch(allocPDA);
        setAllocation(alloc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaim = useCallback(async () => {
    if (!publicKey || !presaleState || !allocation) return;
    setStatus("pending");
    setStatusMsg("Preparing claim transaction...");

    try {
      const provider = new AnchorProvider(
        connection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { publicKey, signTransaction: async (tx: any) => tx, signAllTransactions: async (txs: any) => txs } as never,
        {}
      );
      const program = new Program(IDL, provider);

      const [statePDA] = getPresaleStatePDA();
      const [allocPDA] = getUserAllocationPDA(publicKey);
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_vault")],
        program.programId
      );

      const userATA = await getAssociatedTokenAddress(SPRKS_MINT, publicKey);

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });

      const ataInfo = await connection.getAccountInfo(userATA);
      if (!ataInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(publicKey, userATA, publicKey, SPRKS_MINT)
        );
      }

      // TODO: Add actual claimTokens instruction once anchor build is complete
      // tx.add(await program.methods.claimTokens().accounts({
      //   buyer: publicKey,
      //   presaleState: statePDA,
      //   userAllocation: allocPDA,
      //   tokenVault: vaultPDA,
      //   userTokenAccount: userATA,
      //   tokenMint: SPRKS_MINT,
      //   tokenProgram: TOKEN_PROGRAM_ID,
      //   associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      //   systemProgram: SystemProgram.programId,
      // }).instruction());

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      setStatus("success");
      setStatusMsg(
        `SPRKS claimed successfully! Tx: ${sig.slice(0, 8)}...\nAdd ${SPRKS_MINT.toString().slice(0, 8)}... to your wallet to see your balance.`
      );
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Claim failed.";
      setStatusMsg(msg.includes("User rejected") ? "Transaction cancelled." : msg);
    }
  }, [publicKey, presaleState, allocation, connection, sendTransaction, fetchData]);

  const claimsEnabled = presaleState?.claimsEnabled ?? false;
  const totalSprks = allocation
    ? allocation.totalTokens.toNumber() / SPRKS_DECIMALS_MULTIPLIER
    : 0;
  const alreadyClaimed = allocation?.claimed ?? false;

  return (
    <div
      className="min-h-screen text-stone-900"
      style={{
        background: "linear-gradient(180deg, #f8f7f2 0%, #f3efe6 36%, #f7f5ef 100%)",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 14%, rgba(104,255,3,0.10), transparent 28%),
            radial-gradient(circle at 82% 18%, rgba(94,189,234,0.12), transparent 32%)
          `,
        }}
      />

      <Navbar />

      <section className="relative px-6 pb-16 pt-32">
        <div className="mx-auto max-w-lg">
          {/* Header */}
          <div className="mb-10 text-center">
            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em]"
              style={{
                background: "rgba(94,189,234,0.12)",
                border: "1px solid rgba(94,189,234,0.24)",
                color: BRAND.sky,
              }}
            >
              Token Claim
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] text-stone-900">
              Claim Your SPRKS
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Connect your presale wallet to see and claim your SPRKS allocation.
            </p>
          </div>

          {/* Claim card */}
          <div
            className="rounded-[28px] p-6 space-y-6"
            style={{
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(15,24,62,0.08)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 24px 80px rgba(15,24,62,0.08)",
            }}
          >
            {!connected ? (
              <div className="space-y-4 py-6 text-center">
                <p className="text-sm text-stone-600">
                  Connect the wallet you used to participate in the presale.
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton
                    style={{
                      background: BRAND.lime,
                      color: BRAND.navy,
                      fontWeight: 700,
                      borderRadius: "999px",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>
            ) : loading ? (
              <div className="py-8 text-center">
                <div
                  className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2"
                  style={{
                    borderColor: `${BRAND.sky} transparent ${BRAND.sky} transparent`,
                  }}
                />
                <p className="text-sm text-stone-500">Loading your allocation...</p>
              </div>
            ) : (
              <>
                {/* Allocation summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-3xl p-4 text-center"
                    style={{
                      background: "rgba(104,255,3,0.08)",
                      border: "1px solid rgba(104,255,3,0.20)",
                    }}
                  >
                    <p className="text-xs text-stone-500 mb-1">Your Allocation</p>
                    <p className="text-xl font-black" style={{ color: "#4a9900" }}>
                      {totalSprks.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-500">SPRKS</p>
                  </div>
                  <div
                    className="rounded-3xl p-4 text-center"
                    style={{
                      background: claimsEnabled
                        ? "rgba(104,255,3,0.08)"
                        : "rgba(15,24,62,0.04)",
                      border: claimsEnabled
                        ? "1px solid rgba(104,255,3,0.20)"
                        : "1px solid rgba(15,24,62,0.08)",
                    }}
                  >
                    <p className="text-xs text-stone-500 mb-1">Claim Status</p>
                    <p
                      className="text-sm font-black"
                      style={{ color: claimsEnabled ? "#4a9900" : "#dc2626" }}
                    >
                      {alreadyClaimed ? "✓ Claimed" : claimsEnabled ? "Open" : "Not Yet Open"}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {claimsEnabled ? "Presale ended" : "After presale ends"}
                    </p>
                  </div>
                </div>

                {/* Per-tier breakdown */}
                {allocation && (
                  <div
                    className="rounded-3xl p-4 space-y-2"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(15,24,62,0.07)",
                    }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400 mb-3">
                      Breakdown by Tier
                    </p>
                    {[
                      {
                        tier: "Founding",
                        amount: allocation.foundingBought.toNumber() / SPRKS_DECIMALS_MULTIPLIER,
                        color: "#4a9900",
                      },
                      {
                        tier: "Early Access",
                        amount: allocation.earlyBought.toNumber() / SPRKS_DECIMALS_MULTIPLIER,
                        color: BRAND.sky,
                      },
                      {
                        tier: "Public",
                        amount: allocation.publicBought.toNumber() / SPRKS_DECIMALS_MULTIPLIER,
                        color: "#a855f7",
                      },
                    ].map(({ tier, amount, color }) => (
                      <div key={tier} className="flex items-center justify-between">
                        <span className="text-xs text-stone-500">{tier}</span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: amount > 0 ? color : "#d1d5db" }}
                        >
                          {amount.toLocaleString()} SPRKS
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Wallet address */}
                <div className="text-center">
                  <p className="text-xs text-stone-400">Wallet</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: BRAND.sky }}>
                    {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                  </p>
                </div>

                {/* Status message */}
                {statusMsg && (
                  <div
                    className="rounded-2xl px-4 py-3 text-sm whitespace-pre-line"
                    style={{
                      background: status === "success"
                        ? "rgba(104,255,3,0.08)"
                        : "rgba(220,38,38,0.08)",
                      color: status === "success" ? "#4a9900" : "#dc2626",
                      border: `1px solid ${status === "success" ? "rgba(104,255,3,0.24)" : "rgba(220,38,38,0.24)"}`,
                    }}
                  >
                    {status === "success" ? "✓ " : "✗ "}
                    {statusMsg}
                  </div>
                )}

                {/* Claim button */}
                {!alreadyClaimed && (
                  <button
                    onClick={handleClaim}
                    disabled={!claimsEnabled || totalSprks === 0 || status === "pending"}
                    className="w-full rounded-full py-4 text-sm font-black uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                    style={{
                      background:
                        claimsEnabled && totalSprks > 0
                          ? BRAND.lime
                          : "rgba(15,24,62,0.06)",
                      color:
                        claimsEnabled && totalSprks > 0
                          ? BRAND.navy
                          : "#9ca3af",
                      cursor:
                        claimsEnabled && totalSprks > 0
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    {status === "pending"
                      ? "Claiming..."
                      : !claimsEnabled
                      ? "Claims not open yet"
                      : totalSprks === 0
                      ? "No allocation found"
                      : `Claim ${totalSprks.toLocaleString()} SPRKS →`}
                  </button>
                )}

                {alreadyClaimed && (
                  <div
                    className="rounded-full py-4 text-center text-sm font-black uppercase tracking-[0.18em]"
                    style={{
                      background: "rgba(104,255,3,0.10)",
                      color: "#4a9900",
                      border: "1px solid rgba(104,255,3,0.24)",
                    }}
                  >
                    ✓ Tokens claimed successfully
                  </div>
                )}

                {alreadyClaimed && (
                  <div className="text-center text-xs text-stone-400">
                    <p>Add SPRKS to your wallet:</p>
                    <p className="mt-1 font-mono" style={{ color: BRAND.sky }}>
                      {SPRKS_MINT.toString()}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
