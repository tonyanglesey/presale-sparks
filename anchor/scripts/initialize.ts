/**
 * initialize.ts
 *
 * Admin script — run ONCE to initialize the SPRKS presale on-chain.
 *
 * Usage:
 *   npx ts-node scripts/initialize.ts --cluster devnet   (testing)
 *   npx ts-node scripts/initialize.ts --cluster mainnet  (production)
 *
 * Prerequisites:
 *   - Solana CLI wallet at ~/.config/solana/id.json (this is the admin/authority)
 *   - Program deployed on the target cluster
 *   - SPRKS token minted and admin token account funded (mainnet only)
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import fs from "fs";
import path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const CLUSTER = process.argv.includes("--cluster")
  ? process.argv[process.argv.indexOf("--cluster") + 1]
  : "devnet";

const IS_MAINNET = CLUSTER === "mainnet";

// Program ID (same keypair, same address on both clusters)
const PROGRAM_ID = new PublicKey("4YQMDNA5DtsLxNMySEYHbdjj6CPvtRseQ5sgTqmHxt6D");

// SPRKS mint
// devnet:  use a test mint (spl-token create-token on devnet first)
// mainnet: the real SPRKS mint
const SPRKS_MINT = new PublicKey(
  IS_MAINNET
    ? "EPGoVU5wzZFxL9hu16Dhn3wtyz1P1mPMGQ9Y1KzMebv3"  // mainnet — real SPRKS
    : "EPGoVU5wzZFxL9hu16Dhn3wtyz1P1mPMGQ9Y1KzMebv3"  // devnet  — swap to devnet test mint if needed
);

// Presale dates (Unix timestamps)
const PRESALE_START = Math.floor(new Date("2026-04-06T00:00:00Z").getTime() / 1000);
const PRESALE_END   = Math.floor(new Date("2026-05-06T00:00:00Z").getTime() / 1000);

// Reference SOL price for lamports-per-SPRKS calculation
// Update this to live SOL price just before initializing on mainnet.
const SOL_PRICE_USD = 135;

// Tier USD prices
const FOUNDING_USD = 0.05;
const EARLY_USD    = 0.10;
const PUBLIC_USD   = 0.20;

// lamports per 1 displayed SPRKS = (usd_price / sol_price) * 1e9
const foundingLamperSprks = Math.floor((FOUNDING_USD / SOL_PRICE_USD) * LAMPORTS_PER_SOL);
const earlyLamperSprks    = Math.floor((EARLY_USD    / SOL_PRICE_USD) * LAMPORTS_PER_SOL);
const publicLamperSprks   = Math.floor((PUBLIC_USD   / SOL_PRICE_USD) * LAMPORTS_PER_SOL);

// ─── Load wallet ──────────────────────────────────────────────────────────────

const walletPath = path.resolve(process.env.HOME!, ".config/solana/id.json");
const walletRaw  = JSON.parse(fs.readFileSync(walletPath, "utf8"));
const wallet     = Keypair.fromSecretKey(Uint8Array.from(walletRaw));

// ─── Connect ──────────────────────────────────────────────────────────────────

const rpcUrl = IS_MAINNET
  ? clusterApiUrl("mainnet-beta")
  : clusterApiUrl("devnet");

const connection = new Connection(rpcUrl, "confirmed");
const provider   = new AnchorProvider(
  connection,
  new anchor.Wallet(wallet),
  { commitment: "confirmed" }
);

// ─── PDAs ─────────────────────────────────────────────────────────────────────

const [presaleStatePDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("presale_state")],
  PROGRAM_ID
);
const [tokenVaultPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_vault")],
  PROGRAM_ID
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("─────────────────────────────────────────");
  console.log("  SPRKS Presale — Initialize");
  console.log("─────────────────────────────────────────");
  console.log(`Cluster:          ${CLUSTER}`);
  console.log(`Authority:        ${wallet.publicKey.toString()}`);
  console.log(`Program ID:       ${PROGRAM_ID.toString()}`);
  console.log(`SPRKS Mint:       ${SPRKS_MINT.toString()}`);
  console.log(`Presale State:    ${presaleStatePDA.toString()}`);
  console.log(`Token Vault:      ${tokenVaultPDA.toString()}`);
  console.log(`Presale Start:    ${new Date(PRESALE_START * 1000).toISOString()}`);
  console.log(`Presale End:      ${new Date(PRESALE_END   * 1000).toISOString()}`);
  console.log(`SOL Price (ref):  $${SOL_PRICE_USD}`);
  console.log(`Founding:         $${FOUNDING_USD}/SPRKS → ${foundingLamperSprks} lamports/SPRKS`);
  console.log(`Early:            $${EARLY_USD}/SPRKS → ${earlyLamperSprks} lamports/SPRKS`);
  console.log(`Public:           $${PUBLIC_USD}/SPRKS → ${publicLamperSprks} lamports/SPRKS`);
  console.log("─────────────────────────────────────────");

  // Check if already initialized
  const existing = await connection.getAccountInfo(presaleStatePDA);
  if (existing) {
    console.log("⚠️  Presale state account already exists. Aborting.");
    console.log("   If you want to re-initialize, close the account first.");
    process.exit(1);
  }

  // Load IDL
  const idlPath = path.resolve(__dirname, "../target/idl/sparks_presale.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new Program(idl, provider);

  console.log("\nSending initialize transaction...");

  const tx = await (program.methods as any)
    .initialize(
      new BN(PRESALE_START),
      new BN(PRESALE_END),
      new BN(foundingLamperSprks),
      new BN(earlyLamperSprks),
      new BN(publicLamperSprks)
    )
    .accounts({
      authority:    wallet.publicKey,
      presaleState: presaleStatePDA,
      tokenMint:    SPRKS_MINT,
      tokenVault:   tokenVaultPDA,
    })
    .rpc();

  console.log(`✓ Initialized! Tx: ${tx}`);
  console.log(`\nNext step: deposit 2,000,000 SPRKS into the vault:`);
  console.log(`  spl-token transfer ${SPRKS_MINT.toString()} 2000000 ${tokenVaultPDA.toString()} --fund-recipient`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
